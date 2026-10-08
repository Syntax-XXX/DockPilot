import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { AiPermissionLevel, SafeUser } from '@dockpilot/shared';
import { buildApp } from '../../src/app.js';
import { sql as client } from '../../src/db/index.js';
import { mcpAuthenticationRateLimiter, mcpRateLimiter } from '../../src/lib/rate-limit.js';

export const testOrigin = 'http://127.0.0.1:5173';

export const ownerAccount = {
  email: 'owner@mcp-integration.example',
  password: 'integration-test-owner-password-987',
  name: 'MCP Integration Owner',
  organizationName: 'MCP Integration Lab',
};

export type TestApp = Awaited<ReturnType<typeof buildApp>>;

export interface CredentialSummary {
  id: string;
  token: string;
}

export interface ToolOutcome {
  isError: boolean;
  text: string;
  structuredContent: Record<string, unknown> | null;
}

export async function resetDatabase(): Promise<void> {
  await client`TRUNCATE TABLE audit_logs, ai_approvals, ai_credentials, sessions, users, organizations CASCADE`;
}

export function resetRateLimiters(): void {
  mcpRateLimiter.reset();
  mcpAuthenticationRateLimiter.reset();
}

export async function startTestApp(): Promise<TestApp> {
  const app = await buildApp();
  await app.ready();
  await app.listen({ port: 0, host: '127.0.0.1' });
  return app;
}

export function mcpEndpoint(app: TestApp): string {
  const address = app.server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('The test API did not expose a TCP port.');
  }
  return `http://127.0.0.1:${String(address.port)}/api/v1/mcp`;
}

export function apiEndpoint(app: TestApp, path: string): string {
  const address = app.server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('The test API did not expose a TCP port.');
  }
  return `http://127.0.0.1:${String(address.port)}${path}`;
}

export function originHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { origin: testOrigin, host: '127.0.0.1:4000', ...extra };
}

export async function bootstrapOwner(app: TestApp): Promise<{ cookie: string; user: SafeUser }> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/setup',
    headers: originHeaders({ 'content-type': 'application/json' }),
    payload: ownerAccount,
  });
  if (response.statusCode !== 201) {
    throw new Error(`Owner bootstrap failed with status ${String(response.statusCode)}.`);
  }
  const user = response.json<{ user: SafeUser }>().user;
  const cookie = response.headers['set-cookie']?.toString() ?? '';
  if (cookie.length === 0) throw new Error('Owner bootstrap did not return a session cookie.');
  return { cookie, user };
}

export async function createCredential(
  app: TestApp,
  cookie: string,
  input: {
    name: string;
    permissionLevel: AiPermissionLevel;
    description?: string;
    agentIdentity?: string;
    expiresInDays?: number;
  },
): Promise<CredentialSummary> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/admin/ai-credentials',
    headers: originHeaders({ 'content-type': 'application/json', cookie }),
    payload: input,
  });
  if (response.statusCode !== 201) {
    throw new Error(
      `Credential creation failed with status ${String(response.statusCode)}: ${response.body}`,
    );
  }
  const parsed = response.json<{ credential: { id: string }; token: string }>();
  return { id: parsed.credential.id, token: parsed.token };
}

export async function connectMcp(
  endpoint: string,
  token: string,
  correlationId?: string,
): Promise<Client> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (correlationId !== undefined) headers['x-correlation-id'] = correlationId;
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    requestInit: { headers },
  });
  const mcpClient = new Client({ name: 'dockpilot-integration-client', version: '0.1.0' });
  await mcpClient.connect(transport);
  return mcpClient;
}

export async function mcpPost(
  endpoint: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
): Promise<Response> {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

export async function callTool(
  mcpClient: Client,
  name: string,
  args: Record<string, unknown>,
): Promise<ToolOutcome> {
  return toolOutcome(await mcpClient.callTool({ name, arguments: args }));
}

export async function readToolText(
  mcpClient: Client,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  return JSON.stringify(await mcpClient.callTool({ name, arguments: args }));
}

export function toolOutcome(result: unknown): ToolOutcome {
  const record = asRecord(result);
  if (record === null) throw new Error('The MCP tool result was not an object.');
  let text = '';
  const content = record.content;
  if (Array.isArray(content)) {
    for (const block of content) {
      const blockRecord = asRecord(block);
      if (blockRecord?.type === 'text' && typeof blockRecord.text === 'string') {
        text += blockRecord.text;
      }
    }
  }
  return {
    isError: record.isError === true,
    text,
    structuredContent: asRecord(record.structuredContent),
  };
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return { ...value };
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
