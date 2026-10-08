import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import type { McpIdentity, McpRequestContext } from '../lib/identity.js';

export interface McpSession {
  identity: McpIdentity;
  request: McpRequestContext;
}

const correlationIdPattern = /^[A-Za-z0-9_-]{8,64}$/u;
const maxSourceIpLength = 64;
const maxUserAgentLength = 255;

function readHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function resolveCorrelationId(candidate: string | undefined): string {
  if (candidate !== undefined && correlationIdPattern.test(candidate)) return candidate;
  return `dpc_${randomUUID()}`;
}

export function buildRequestContext(request: FastifyRequest): McpRequestContext {
  const sourceIp = request.ip.length > 0 ? request.ip.slice(0, maxSourceIpLength) : null;
  const userAgent = readHeader(request.headers['user-agent']);
  return {
    correlationId: resolveCorrelationId(readHeader(request.headers['x-correlation-id'])),
    sourceIp,
    userAgent: userAgent === undefined ? null : userAgent.slice(0, maxUserAgentLength),
    requestId: request.id.slice(0, 255),
  };
}

export function buildLocalSession(identity: McpIdentity, clientLabel: string): McpSession {
  return {
    identity,
    request: {
      correlationId: resolveCorrelationId(undefined),
      sourceIp: null,
      userAgent: clientLabel.slice(0, maxUserAgentLength),
      requestId: null,
    },
  };
}
