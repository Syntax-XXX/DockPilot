import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { asAppError } from '../lib/errors.js';
import { mcpAuthenticationRateLimiter } from '../lib/rate-limit.js';
import { mcpEnabled } from '../lib/security.js';
import { authenticateAiRequest } from './auth.js';
import { buildRequestContext, resolveCorrelationId, type McpSession } from './session.js';
import { createMcpServer } from './server.js';

const routePath = '/mcp';

export function registerMcpRoutes(app: FastifyInstance): void {
  if (!mcpEnabled) return;
  app.post(routePath, handleMcpRequest);
  app.get(routePath, handleMcpRequest);
  app.delete(routePath, handleMcpRequest);
}

async function handleMcpRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const headerCorrelationId = request.headers['x-correlation-id'];
  const correlationId = resolveCorrelationId(
    typeof headerCorrelationId === 'string' ? headerCorrelationId : undefined,
  );

  const blocked = mcpAuthenticationRateLimiter.peek(request.ip, 'authentication');
  if (!blocked.allowed) {
    await reply
      .code(429)
      .header('Retry-After', String(blocked.retryAfterSeconds))
      .header('X-Correlation-Id', correlationId)
      .send(jsonRpcError(null, -32029, 'Too many MCP authentication attempts. Try again later.'));
    return;
  }

  const requestContext = buildRequestContext(request);
  let session: McpSession;
  try {
    const identity = await authenticateAiRequest(request, requestContext);
    session = { identity, request: requestContext };
  } catch (error) {
    const appError = asAppError(error);
    if (appError.category === 'authentication') {
      mcpAuthenticationRateLimiter.check(request.ip, 'authentication');
    }
    request.log.warn(
      { correlationId, errorCategory: appError.category },
      'MCP authentication rejected',
    );
    await reply
      .code(appError.httpStatus)
      .header('WWW-Authenticate', 'Bearer')
      .header('X-Correlation-Id', correlationId)
      .send(
        jsonRpcError(
          null,
          appError.category === 'authentication' ? -32001 : -32603,
          appError.message,
        ),
      );
    return;
  }

  const server = createMcpServer(session);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  reply.hijack();
  const raw = reply.raw;
  raw.setHeader('X-Correlation-Id', session.request.correlationId);
  raw.setHeader('Cache-Control', 'no-store');

  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    void transport.close();
    void server.close();
  };
  raw.once('close', dispose);
  raw.once('finish', dispose);

  try {
    await server.connect(transport);
    await transport.handleRequest(request.raw, raw, request.body);
  } catch (error) {
    request.log.error(
      { err: error, correlationId: session.request.correlationId },
      'MCP request failed',
    );
    if (!raw.headersSent) {
      raw.writeHead(500, { 'content-type': 'application/json' });
    }
    raw.end(JSON.stringify(jsonRpcError(null, -32603, 'An unexpected error occurred.')));
    dispose();
  }
}

function jsonRpcError(id: null, code: number, message: string): Record<string, unknown> {
  return { jsonrpc: '2.0', id, error: { code, message } };
}
