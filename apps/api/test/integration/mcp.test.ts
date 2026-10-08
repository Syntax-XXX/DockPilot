import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mcpToolNames } from '@dockpilot/shared';
import { sql as client } from '../../src/db/index.js';
import {
  asArray,
  asRecord,
  bootstrapOwner,
  callTool,
  connectMcp,
  createCredential,
  mcpEndpoint,
  mcpPost,
  ownerAccount,
  resetDatabase,
  resetRateLimiters,
  startTestApp,
  type TestApp,
} from '../helpers/control-harness.js';

const forbiddenToolNames = ['execute', 'shell', 'command', 'docker_exec', 'sql', 'run', 'admin'];

interface AuditRow {
  action: string;
  outcome: string;
  tool_name: string | null;
  permission_used: string | null;
  agent_identity: string | null;
  correlation_id: string | null;
  error_category: string | null;
  duration_ms: number | null;
  ai_credential_id: string | null;
}

let app: TestApp;
let endpoint: string;
let ownerCookie: string;
const openClients: Client[] = [];

beforeEach(async () => {
  await resetDatabase();
  resetRateLimiters();
  app = await startTestApp();
  endpoint = mcpEndpoint(app);
  ownerCookie = (await bootstrapOwner(app)).cookie;
  openClients.length = 0;
});

afterEach(async () => {
  for (const openClient of openClients) {
    await openClient.close().catch(() => undefined);
  }
  await app.close();
});

afterAll(async () => {
  await client.end({ timeout: 5 });
});

async function connect(token: string, correlationId?: string): Promise<Client> {
  const mcpClient = await connectMcp(endpoint, token, correlationId);
  openClients.push(mcpClient);
  return mcpClient;
}

async function auditRows(where?: { correlationId?: string; action?: string }): Promise<AuditRow[]> {
  if (where?.correlationId !== undefined) {
    return client<AuditRow[]>`
      SELECT action, outcome, tool_name, permission_used, agent_identity, correlation_id,
             error_category, duration_ms, ai_credential_id
      FROM audit_logs WHERE correlation_id = ${where.correlationId} ORDER BY occurred_at, id`;
  }
  if (where?.action !== undefined) {
    return client<AuditRow[]>`
      SELECT action, outcome, tool_name, permission_used, agent_identity, correlation_id,
             error_category, duration_ms, ai_credential_id
      FROM audit_logs WHERE action = ${where.action} ORDER BY occurred_at, id`;
  }
  return client<AuditRow[]>`
    SELECT action, outcome, tool_name, permission_used, agent_identity, correlation_id,
           error_category, duration_ms, ai_credential_id
    FROM audit_logs ORDER BY occurred_at, id`;
}

describe('MCP authentication', () => {
  it('rejects requests without an AI credential before any tool logic runs', async () => {
    const anonymous = await mcpPost(endpoint, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {},
    });
    expect(anonymous.status).toBe(401);
    expect(anonymous.headers.get('www-authenticate')).toContain('Bearer');
    const body: unknown = await anonymous.json();
    expect(asRecord(body)?.error).toBeTruthy();

    const malformed = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { authorization: 'Bearer not-a-dockpilot-token' },
    );
    expect(malformed.status).toBe(401);

    const forged = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { authorization: `Bearer dpai_${'A'.repeat(43)}` },
    );
    expect(forged.status).toBe(401);

    await expect(connectMcp(endpoint, 'not-a-token')).rejects.toThrow();
    const toolEvents = (await auditRows()).filter((row) => row.tool_name !== null);
    expect(toolEvents).toHaveLength(0);
  }, 30_000);

  it('never accepts a browser session cookie as MCP authentication', async () => {
    const response = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { cookie: ownerCookie },
    );
    expect(response.status).toBe(401);
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain('dockpilot_session');
  }, 30_000);

  it('rejects a revoked AI credential without disclosing why to the caller', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'revoked-agent',
      permissionLevel: 'read',
    });
    const revoke = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/ai-credentials/${credential.id}/revoke`,
      headers: { origin: 'http://127.0.0.1:5173', cookie: ownerCookie },
    });
    expect(revoke.statusCode).toBe(200);

    const response = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { authorization: `Bearer ${credential.token}` },
    );
    expect(response.status).toBe(401);
    expect(JSON.stringify(await response.json())).not.toContain(credential.token);
    await expect(connectMcp(endpoint, credential.token)).rejects.toThrow();

    const deniedEvents = await auditRows({ action: 'mcp.authentication_denied' });
    expect(deniedEvents.length).toBeGreaterThanOrEqual(1);
    expect(deniedEvents[0]?.outcome).toBe('denied');
    expect(deniedEvents[0]?.error_category).toBe('authentication');
    expect(deniedEvents[0]?.ai_credential_id).toBe(credential.id);
    expect(deniedEvents[0]?.correlation_id).not.toBeNull();
  }, 30_000);

  it('rejects an expired AI credential', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'expired-agent',
      permissionLevel: 'read',
    });
    await client`UPDATE ai_credentials SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = ${credential.id}`;
    const response = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { authorization: `Bearer ${credential.token}` },
    );
    expect(response.status).toBe(401);
  }, 30_000);
});

describe('MCP tool discovery', () => {
  it('advertises exactly the narrow, documented tools and flags destructive capabilities', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'discovery-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    const listing = await mcpClient.listTools();
    const names = listing.tools.map((tool) => tool.name).sort();
    expect(names).toEqual([...mcpToolNames].sort());
    for (const forbidden of forbiddenToolNames) expect(names).not.toContain(forbidden);

    const destructive = listing.tools
      .filter((tool) => tool.annotations?.destructiveHint === true)
      .map((tool) => tool.name)
      .sort();
    expect(destructive).toEqual([
      'dockpilot_request_credential_revocation',
      'dockpilot_request_session_revocation',
    ]);
    const readOnly = listing.tools
      .filter((tool) => tool.annotations?.readOnlyHint === true)
      .map((tool) => tool.name);
    expect(readOnly).toContain('dockpilot_list_users');
    expect(readOnly).not.toContain('dockpilot_update_my_credential');

    for (const tool of listing.tools) {
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(tool.outputSchema?.additionalProperties).toBe(false);
    }
  }, 30_000);
});

describe('MCP authorized tool execution', () => {
  it('executes read tools against real state and returns structured content', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'reader-agent',
      permissionLevel: 'read',
      agentIdentity: 'claude-code',
    });
    const mcpClient = await connect(credential.token);

    const health = await callTool(mcpClient, 'dockpilot_health', {});
    expect(health.isError).toBe(false);
    expect(health.structuredContent?.status).toBe('ok');
    expect(health.structuredContent?.database).toBe('reachable');

    const status = await callTool(mcpClient, 'dockpilot_system_status', {});
    expect(status.isError).toBe(false);
    expect(status.structuredContent?.users).toBe(1);
    expect(status.structuredContent?.activeAiCredentials).toBe(1);
    expect(status.structuredContent?.mcpEnabled).toBe(true);

    const users = await callTool(mcpClient, 'dockpilot_list_users', {});
    expect(users.isError).toBe(false);
    const listed = asArray(users.structuredContent?.users);
    expect(listed).toHaveLength(1);
    expect(asRecord(listed[0])?.email).toBe(ownerAccount.email);
  }, 30_000);

  it('records AI identity, tool, permission, correlation id, outcome and duration for a success', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'audited-agent',
      permissionLevel: 'read',
      agentIdentity: 'audited-agent-identity',
    });
    const correlationId = 'testcorrelation0001';
    const mcpClient = await connect(credential.token, correlationId);

    const health = await callTool(mcpClient, 'dockpilot_health', {});
    expect(health.isError).toBe(false);

    const rows = await auditRows({ correlationId });
    expect(rows).toHaveLength(1);
    const event = rows[0];
    if (event === undefined) throw new Error('Expected an audit event for the tool call.');
    expect(event.action).toBe('mcp.health');
    expect(event.tool_name).toBe('dockpilot_health');
    expect(event.permission_used).toBe('read');
    expect(event.outcome).toBe('success');
    expect(event.error_category).toBeNull();
    expect(event.agent_identity).toBe('audited-agent-identity');
    expect(event.ai_credential_id).toBe(credential.id);
    expect(typeof event.duration_ms).toBe('number');
    expect(event.duration_ms).toBeGreaterThanOrEqual(0);
  }, 30_000);

  it('lets a credential update only its own non-security metadata', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'writer-agent',
      permissionLevel: 'write',
    });
    const mcpClient = await connect(credential.token);
    const updated = await callTool(mcpClient, 'dockpilot_update_my_credential', {
      description: 'Rotated by the agent',
      agentIdentity: 'writer-agent-v2',
    });
    expect(updated.isError).toBe(false);
    expect(asRecord(updated.structuredContent?.credential)?.agentIdentity).toBe('writer-agent-v2');

    const stored = await client<{ permission_level: string; agent_identity: string }[]>`
      SELECT permission_level, agent_identity FROM ai_credentials WHERE id = ${credential.id}`;
    expect(stored[0]?.permission_level).toBe('write');
    expect(stored[0]?.agent_identity).toBe('writer-agent-v2');
  }, 30_000);

  it('never returns a raw credential token or token digest through MCP output', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'self-listing-agent',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);
    const listing = await callTool(mcpClient, 'dockpilot_list_ai_credentials', {});
    expect(listing.isError).toBe(false);
    const serialized = JSON.stringify(listing);
    expect(serialized).not.toContain(credential.token);
    expect(serialized).toContain(credential.token.slice(0, 13));
    const stored = await client<{ token_hash: string }[]>`
      SELECT token_hash FROM ai_credentials WHERE id = ${credential.id}`;
    expect(serialized).not.toContain(stored[0]?.token_hash ?? '');
  }, 30_000);
});

describe('MCP denials and failures are audited', () => {
  it('denies a tool that exceeds the credential permission level and audits the denial', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'read-only-agent',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);
    const denied = await callTool(mcpClient, 'dockpilot_update_my_credential', {
      description: 'escalation attempt',
    });
    expect(denied.isError).toBe(true);
    expect(denied.text).toContain('authorization');
    expect(denied.structuredContent).toBeNull();

    const rows = await auditRows({ action: 'mcp.update_own_credential' });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.outcome).toBe('denied');
    expect(rows[0]?.error_category).toBe('authorization');
    expect(rows[0]?.tool_name).toBe('dockpilot_update_my_credential');
  }, 30_000);

  it('rejects malformed, oversized and unexpected tool input and audits a validation denial', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'fuzz-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);

    const cases: Record<string, unknown>[] = [
      { limit: 0 },
      { limit: 5000 },
      { limit: 1.5 },
      { unexpected: 'value' },
      { cursor: 'x'.repeat(400) },
    ];
    for (const args of cases) {
      const denied = await callTool(mcpClient, 'dockpilot_list_users', args);
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('validation');
    }

    const rows = await auditRows({ action: 'mcp.list_users' });
    expect(rows).toHaveLength(cases.length);
    for (const row of rows) {
      expect(row.outcome).toBe('denied');
      expect(row.error_category).toBe('validation');
    }
  }, 30_000);

  it('rejects an unknown tool, audits it, and never runs a fabricated capability', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'probe-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    for (const name of forbiddenToolNames) {
      const denied = await callTool(mcpClient, name, { command: 'id' });
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('validation');
    }
    const denied = await callTool(mcpClient, 'dockpilot_execute_shell', { command: 'id' });
    expect(denied.isError).toBe(true);
    expect(denied.text).toContain('validation');

    const rows = await auditRows({ action: 'mcp.unknown_tool' });
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]?.outcome).toBe('denied');
  }, 30_000);

  it('audits a not-found failure with the correct error category', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'missing-lookup-agent',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);
    const missing = await callTool(mcpClient, 'dockpilot_get_audit_event', {
      eventId: '00000000-0000-4000-8000-000000000000',
    });
    expect(missing.isError).toBe(true);
    expect(missing.text).toContain('not_found');

    const rows = await auditRows({ action: 'mcp.get_audit_event' });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.outcome).toBe('failure');
    expect(rows[0]?.error_category).toBe('not_found');
  }, 30_000);

  it('rejects an unknown JSON-RPC method without touching any tool', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'protocol-agent',
      permissionLevel: 'read',
    });
    const response = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 3, method: 'tools/destroy', params: {} },
      { authorization: `Bearer ${credential.token}` },
    );
    const body = JSON.stringify(await response.json());
    expect(body).toContain('error');
    expect(await auditRows({ action: 'mcp.health' })).toHaveLength(0);
  }, 30_000);
});

describe('MCP rate limiting', () => {
  it('rate limits repeated write calls for the same AI credential', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'noisy-agent',
      permissionLevel: 'write',
    });
    const mcpClient = await connect(credential.token);

    let limitedAt = 0;
    for (let attempt = 1; attempt <= 21; attempt += 1) {
      const result = await callTool(mcpClient, 'dockpilot_update_my_credential', {
        description: `attempt ${String(attempt)}`,
      });
      if (result.isError && result.text.includes('rate_limited')) {
        limitedAt = attempt;
        break;
      }
    }
    expect(limitedAt).toBe(21);

    const rows = await auditRows({ action: 'mcp.update_own_credential' });
    expect(rows.filter((row) => row.error_category === 'rate_limited')).toHaveLength(1);
  }, 60_000);
});

describe('audit log integrity', () => {
  it('is append-only at the database level and cannot be deleted or rewritten', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'integrity-agent',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);
    await callTool(mcpClient, 'dockpilot_health', {});
    expect((await auditRows()).length).toBeGreaterThan(0);

    await expect(client`UPDATE audit_logs SET action = 'tampered'`).rejects.toThrow(/append-only/u);
    await expect(client`DELETE FROM audit_logs`).rejects.toThrow(/append-only/u);
    expect((await auditRows()).length).toBeGreaterThan(0);
  }, 30_000);
});
