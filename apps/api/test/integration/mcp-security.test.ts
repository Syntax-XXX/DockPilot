import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { mcpToolCatalog, mcpToolInputSchemas, mcpToolNames } from '@dockpilot/shared';
import { sql as client } from '../../src/db/index.js';
import { createAiToken } from '../../src/lib/ai-token.js';
import { listToolDefinitions } from '../../src/mcp/server.js';
import {
  asArray,
  asRecord,
  bootstrapOwner,
  callTool,
  connectMcp,
  createCredential,
  mcpEndpoint,
  mcpPost,
  originHeaders,
  readToolText,
  resetDatabase,
  resetRateLimiters,
  startTestApp,
  type TestApp,
} from '../helpers/control-harness.js';

const forbiddenToolNames = [
  'execute',
  'shell',
  'command',
  'docker_exec',
  'docker_run',
  'sql',
  'query',
  'run',
  'eval',
  'admin',
];

const forbiddenArgumentNames = ['command', 'cmd', 'shell', 'script', 'sql'];

const nonExistentUuid = '00000000-0000-4000-8000-000000000000';

const stackTraceMarkers = ['at Object.', 'node_modules', 'SELECT ', '/home/'];

interface AuditRow {
  action: string;
  outcome: string;
  tool_name: string | null;
  permission_used: string | null;
  error_category: string | null;
  ai_credential_id: string | null;
  correlation_id: string | null;
}

interface SeededOrganization {
  organizationId: string;
  userId: string;
  sessionId: string;
  credentialId: string;
  token: string;
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

async function connect(token: string): Promise<Client> {
  const mcpClient = await connectMcp(endpoint, token);
  openClients.push(mcpClient);
  return mcpClient;
}

async function auditRows(where?: { action?: string; credentialId?: string }): Promise<AuditRow[]> {
  if (where?.action !== undefined) {
    return client<AuditRow[]>`
      SELECT action, outcome, tool_name, permission_used, error_category, ai_credential_id,
             correlation_id
      FROM audit_logs WHERE action = ${where.action} ORDER BY occurred_at, id`;
  }
  if (where?.credentialId !== undefined) {
    return client<AuditRow[]>`
      SELECT action, outcome, tool_name, permission_used, error_category, ai_credential_id,
             correlation_id
      FROM audit_logs WHERE ai_credential_id = ${where.credentialId} ORDER BY occurred_at, id`;
  }
  return client<AuditRow[]>`
    SELECT action, outcome, tool_name, permission_used, error_category, ai_credential_id,
           correlation_id
    FROM audit_logs ORDER BY occurred_at, id`;
}

async function postRaw(body: string, headers: Record<string, string> = {}): Promise<Response> {
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...headers,
    },
    body,
  });
}

async function seedSecondOrganization(): Promise<SeededOrganization> {
  const [organization] = await client<{ id: string }[]>`
    INSERT INTO organizations (name) VALUES ('Second Organization') RETURNING id`;
  if (organization === undefined) throw new Error('Failed to seed the second organization.');

  const [user] = await client<{ id: string }[]>`
    INSERT INTO users (email, email_normalized, password_hash, name, organization_id, role)
    VALUES ('second-owner@security.example', 'second-owner@security.example', 'seeded-hash-value',
            'Second Owner', ${organization.id}, 'owner')
    RETURNING id`;
  if (user === undefined) throw new Error('Failed to seed the second user.');

  const [session] = await client<{ id: string }[]>`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${'b'.repeat(64)}, ${user.id}, NOW() + INTERVAL '1 hour') RETURNING id`;
  if (session === undefined) throw new Error('Failed to seed the second session.');

  const generated = createAiToken();
  const [credential] = await client<{ id: string }[]>`
    INSERT INTO ai_credentials
      (organization_id, name, permission_level, token_prefix, token_hash, agent_identity)
    VALUES (${organization.id}, 'second-org-agent', 'destructive', ${generated.tokenPrefix},
            ${generated.tokenHash}, 'second-org-agent')
    RETURNING id`;
  if (credential === undefined) throw new Error('Failed to seed the second credential.');

  return {
    organizationId: organization.id,
    userId: user.id,
    sessionId: session.id,
    credentialId: credential.id,
    token: generated.token,
  };
}

async function firstSessionId(): Promise<string> {
  const rows = await client<{ id: string }[]>`SELECT id FROM sessions ORDER BY created_at LIMIT 1`;
  const session = rows[0];
  if (session === undefined) throw new Error('Expected at least one session to exist.');
  return session.id;
}

async function tokenHashes(): Promise<string[]> {
  const rows = await client<{ token_hash: string }[]>`SELECT token_hash FROM ai_credentials`;
  return rows.map((row) => row.token_hash);
}

describe('cross-organization isolation', () => {
  it('never lets an AI credential read another organization users, sessions, credentials or approvals', async () => {
    const second = await seedSecondOrganization();
    const firstCredential = await createCredential(app, ownerCookie, {
      name: 'first-org-agent',
      permissionLevel: 'destructive',
    });

    const secondClient = await connect(second.token);
    const secondHealth = await callTool(secondClient, 'dockpilot_health', {});
    expect(secondHealth.isError).toBe(false);
    const secondApproval = await callTool(secondClient, 'dockpilot_request_session_revocation', {
      sessionId: second.sessionId,
      justification: 'second organization approval probe',
    });
    expect(secondApproval.isError).toBe(false);

    const firstClient = await connect(firstCredential.token);

    const users = await callTool(firstClient, 'dockpilot_list_users', {});
    expect(users.isError).toBe(false);
    const listedUsers = asArray(users.structuredContent?.users).map((row) => asRecord(row));
    expect(listedUsers.some((row) => row?.id === second.userId)).toBe(false);
    expect(listedUsers.map((row) => row?.email)).not.toContain('second-owner@security.example');

    const credentials = await callTool(firstClient, 'dockpilot_list_ai_credentials', {});
    expect(credentials.isError).toBe(false);
    const listedCredentials = asArray(credentials.structuredContent?.credentials).map((row) =>
      asRecord(row),
    );
    expect(listedCredentials.some((row) => row?.id === second.credentialId)).toBe(false);

    const sessions = await callTool(firstClient, 'dockpilot_list_sessions', {});
    expect(sessions.isError).toBe(false);
    const listedSessions = asArray(sessions.structuredContent?.sessions).map((row) =>
      asRecord(row),
    );
    expect(listedSessions.some((row) => row?.userId === second.userId)).toBe(false);
    expect(listedSessions.some((row) => row?.id === second.sessionId)).toBe(false);

    const approvals = await callTool(firstClient, 'dockpilot_list_approvals', {});
    expect(approvals.isError).toBe(false);
    expect(asArray(approvals.structuredContent?.approvals)).toHaveLength(0);

    const secondEvents = await client<{ id: string }[]>`
      SELECT id FROM audit_logs WHERE ai_credential_id = ${second.credentialId} LIMIT 1`;
    const foreignEventId = secondEvents[0]?.id;
    expect(foreignEventId).toBeTruthy();
    const foreignEvent = await callTool(firstClient, 'dockpilot_get_audit_event', {
      eventId: foreignEventId ?? nonExistentUuid,
    });
    expect(foreignEvent.isError).toBe(true);
    expect(foreignEvent.text).toContain('not_found');
    expect(JSON.stringify(foreignEvent)).not.toContain('second-owner@security.example');
  }, 40_000);
});

describe('privilege escalation', () => {
  it('denies every tool above the credential permission level and audits each denial', async () => {
    const readCredential = await createCredential(app, ownerCookie, {
      name: 'escalation-read-agent',
      permissionLevel: 'read',
    });
    const writeCredential = await createCredential(app, ownerCookie, {
      name: 'escalation-write-agent',
      permissionLevel: 'write',
    });

    const readClient = await connect(readCredential.token);
    const writeClient = await connect(writeCredential.token);
    const sessionId = await firstSessionId();

    const readAttempts: [string, Record<string, unknown>][] = [
      ['dockpilot_update_my_credential', { description: 'escalate' }],
      ['dockpilot_request_session_revocation', { sessionId, justification: 'escalate now' }],
      [
        'dockpilot_request_credential_revocation',
        { credentialId: readCredential.id, justification: 'escalate now' },
      ],
    ];
    for (const [name, args] of readAttempts) {
      const denied = await callTool(readClient, name, args);
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('authorization');
    }

    const writeAttempts: [string, Record<string, unknown>][] = [
      ['dockpilot_request_session_revocation', { sessionId, justification: 'escalate now' }],
      [
        'dockpilot_request_credential_revocation',
        { credentialId: writeCredential.id, justification: 'escalate now' },
      ],
    ];
    for (const [name, args] of writeAttempts) {
      const denied = await callTool(writeClient, name, args);
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('authorization');
    }

    const readDenials = await auditRows({ credentialId: readCredential.id });
    expect(readDenials).toHaveLength(readAttempts.length);
    for (const row of readDenials) {
      expect(row.outcome).toBe('denied');
      expect(row.error_category).toBe('authorization');
    }
    const writeDenials = await auditRows({ credentialId: writeCredential.id });
    expect(writeDenials).toHaveLength(writeAttempts.length);
    for (const row of writeDenials) {
      expect(row.outcome).toBe('denied');
      expect(row.error_category).toBe('authorization');
    }

    const stored = await client<{ id: string; permission_level: string }[]>`
      SELECT id, permission_level FROM ai_credentials ORDER BY id`;
    const levels = new Map(stored.map((row) => [row.id, row.permission_level]));
    expect(levels.get(readCredential.id)).toBe('read');
    expect(levels.get(writeCredential.id)).toBe('write');
  }, 40_000);
});

describe('permission over-posting', () => {
  it('rejects attempts to raise the credential own permission level or token through tool arguments', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'overpost-agent',
      permissionLevel: 'write',
    });
    const before = await client<{ token_hash: string; revoked_at: Date | null }[]>`
      SELECT token_hash, revoked_at FROM ai_credentials WHERE id = ${credential.id}`;

    const mcpClient = await connect(credential.token);
    const payloads: Record<string, unknown>[] = [
      { permissionLevel: 'destructive' },
      { token: 'dpai_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
      { revokedAt: new Date().toISOString() },
      { id: nonExistentUuid },
      { expiresAt: new Date(Date.now() + 86_400_000).toISOString() },
    ];
    for (const payload of payloads) {
      const denied = await callTool(mcpClient, 'dockpilot_update_my_credential', payload);
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('validation');
    }

    const after = await client<
      { permission_level: string; token_hash: string; revoked_at: Date | null }[]
    >`SELECT permission_level, token_hash, revoked_at FROM ai_credentials WHERE id = ${credential.id}`;
    expect(after[0]?.permission_level).toBe('write');
    expect(after[0]?.token_hash).toBe(before[0]?.token_hash);
    expect(after[0]?.revoked_at).toBeNull();
  }, 40_000);
});

describe('secret non-disclosure', () => {
  it('never returns a token, a token digest or a password digest through any tool response', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'leak-probe-agent',
      permissionLevel: 'destructive',
    });
    const sessionId = await firstSessionId();
    const hashes = await tokenHashes();
    const mcpClient = await connect(credential.token);

    const calls: [string, Record<string, unknown>][] = [
      ['dockpilot_health', {}],
      ['dockpilot_system_status', {}],
      ['dockpilot_list_users', {}],
      ['dockpilot_list_sessions', {}],
      ['dockpilot_list_ai_credentials', {}],
      ['dockpilot_list_audit_events', {}],
      ['dockpilot_get_audit_event', { eventId: nonExistentUuid }],
      ['dockpilot_list_approvals', {}],
      ['dockpilot_update_my_credential', { description: 'leak probe' }],
      ['dockpilot_request_session_revocation', { sessionId, justification: 'leak probe request' }],
      [
        'dockpilot_request_credential_revocation',
        { credentialId: credential.id, justification: 'leak probe request' },
      ],
    ];

    for (const [name, args] of calls) {
      const raw = await readToolText(mcpClient, name, args);
      expect(raw).not.toContain(credential.token);
      for (const hash of hashes) expect(raw).not.toContain(hash);
      expect(raw).not.toContain('password_hash');
      expect(raw).not.toContain('token_hash');
      for (const marker of stackTraceMarkers) expect(raw).not.toContain(marker);
    }
  }, 40_000);

  it('returns protocol errors that never leak a stack trace, a query or an internal path', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'error-shape-agent',
      permissionLevel: 'read',
    });
    const authorization = `Bearer ${credential.token}`;
    const probes: Record<string, unknown>[] = [
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'not_a_tool', arguments: {} },
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'dockpilot_list_users', arguments: { unexpected: true } },
      },
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'dockpilot_get_audit_event', arguments: { eventId: nonExistentUuid } },
      },
      { jsonrpc: '2.0', id: 4, method: 'tools/list', params: { unexpected: true } },
    ];
    for (const body of probes) {
      const response = await mcpPost(endpoint, body, { authorization });
      const raw = JSON.stringify(await response.json());
      expect(response.status).toBeLessThan(500);
      for (const marker of stackTraceMarkers) expect(raw).not.toContain(marker);
    }
  }, 40_000);
});

describe('injection resistance', () => {
  it('treats injection payloads as data and leaves every table intact', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'injection-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    const usersBefore = await client<{ count: number }[]>`SELECT count(*)::int AS count FROM users`;

    const payloads = [
      "'; DROP TABLE audit_logs; --",
      "' OR 1=1 --",
      '1); DELETE FROM users; --',
      '%_',
    ];
    const readFilters = ['action', 'toolName', 'targetType', 'targetId'];

    for (const payload of payloads.slice(0, 2)) {
      for (const filter of readFilters) {
        const result = await callTool(mcpClient, 'dockpilot_list_audit_events', {
          [filter]: payload,
        });
        if (result.isError) {
          expect(result.text).toContain('validation');
        } else {
          expect(asArray(result.structuredContent?.events)).toHaveLength(0);
        }
      }
    }

    for (const payload of payloads) {
      const cursorResult = await callTool(mcpClient, 'dockpilot_list_users', { cursor: payload });
      expect(cursorResult.isError).toBe(true);
      expect(cursorResult.text).toContain('validation');
    }

    const sessionId = await firstSessionId();
    const justification = await callTool(mcpClient, 'dockpilot_request_session_revocation', {
      sessionId,
      justification: "'; DELETE FROM ai_approvals; --",
    });
    expect(justification.isError).toBe(false);

    const uuidInjection = await callTool(mcpClient, 'dockpilot_get_audit_event', {
      eventId: "'; DROP TABLE users; --",
    });
    expect(uuidInjection.isError).toBe(true);
    expect(uuidInjection.text).toContain('validation');

    const usersAfter = await client<{ count: number }[]>`SELECT count(*)::int AS count FROM users`;
    expect(usersAfter[0]?.count).toBe(usersBefore[0]?.count);
    const tables = await client<{ name: string | null }[]>`
      SELECT to_regclass('public.audit_logs')::text AS name
      UNION ALL SELECT to_regclass('public.users')::text
      UNION ALL SELECT to_regclass('public.ai_credentials')::text`;
    for (const table of tables) expect(table.name).not.toBeNull();
  }, 40_000);

  it('rejects traversal, path and oversized identifier payloads without leaking filesystem paths', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'traversal-agent',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);

    const cursorPayloads = [
      encodeURIComponent('../../../../etc/passwd'),
      '/etc/passwd',
      'file:///etc/passwd',
      'x'.repeat(10_000),
      '..%2f..%2f..%2fvar%2flog%2fsyslog',
    ];
    for (const cursor of cursorPayloads) {
      const result = await callTool(mcpClient, 'dockpilot_list_users', { cursor });
      expect(result.isError).toBe(true);
      expect(result.text).toContain('validation');
      expect(JSON.stringify(result)).not.toContain('passwd');
      expect(JSON.stringify(result)).not.toContain('syslog');
    }

    const identifierProbes: [string, Record<string, unknown>][] = [
      ['dockpilot_get_audit_event', { eventId: '../../../../etc/passwd' }],
      [
        'dockpilot_request_session_revocation',
        { sessionId: '../../etc/shadow', justification: 'traversal probe' },
      ],
      [
        'dockpilot_request_credential_revocation',
        { credentialId: 'file:///etc/passwd', justification: 'traversal probe' },
      ],
    ];
    for (const [name, args] of identifierProbes) {
      const result = await callTool(mcpClient, name, args);
      expect(result.isError).toBe(true);
      expect(result.text).toContain('validation');
      expect(JSON.stringify(result)).not.toContain('passwd');
      expect(JSON.stringify(result)).not.toContain('shadow');
    }
  }, 40_000);
});

describe('no generic execution surface', () => {
  it('advertises no execution tool and exposes no command or SQL shaped argument', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'surface-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    const listing = await mcpClient.listTools();
    for (const forbidden of forbiddenToolNames) {
      expect(listing.tools.map((tool) => tool.name)).not.toContain(forbidden);
    }
    for (const tool of listToolDefinitions()) {
      const parameterNames = Object.keys(tool.inputSchema.properties ?? {});
      for (const forbidden of forbiddenArgumentNames) {
        expect(parameterNames).not.toContain(forbidden);
      }
    }
    for (const name of mcpToolNames) {
      const parameterNames = Object.keys(mcpToolInputSchemas[name].shape);
      for (const forbidden of forbiddenArgumentNames) {
        expect(parameterNames).not.toContain(forbidden);
      }
    }
    for (const name of forbiddenToolNames) {
      const denied = await callTool(mcpClient, name, { command: 'id', sql: 'SELECT 1' });
      expect(denied.isError).toBe(true);
      expect(denied.text).toContain('validation');
    }
    const unknownRows = await auditRows({ action: 'mcp.unknown_tool' });
    expect(unknownRows).toHaveLength(forbiddenToolNames.length);
    for (const row of unknownRows) {
      expect(row.outcome).toBe('denied');
      expect(row.error_category).toBe('validation');
    }
  }, 40_000);
});

describe('audit history immutability', () => {
  it('keeps audit history append-only and exposes no tool that can mutate it', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'history-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    await callTool(mcpClient, 'dockpilot_health', {});
    expect((await auditRows()).length).toBeGreaterThan(0);

    await expect(client`UPDATE audit_logs SET action = 'forged'`).rejects.toThrow(/append-only/u);
    await expect(client`UPDATE audit_logs SET resource_id = 'forged'`).rejects.toThrow(
      /append-only/u,
    );
    await expect(client`DELETE FROM audit_logs WHERE true`).rejects.toThrow(/append-only/u);

    const mutatingTools = mcpToolNames.filter((name) =>
      mcpToolCatalog[name].actionType.startsWith('audit'),
    );
    expect(mutatingTools).toHaveLength(0);
    expect((await auditRows()).length).toBeGreaterThan(0);
  }, 40_000);
});

describe('transport hardening', () => {
  it('rejects oversized and malformed payloads and stays healthy afterwards', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'transport-agent',
      permissionLevel: 'read',
    });
    const authorization = `Bearer ${credential.token}`;

    const oversized = await postRaw(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: 'dockpilot_list_users', arguments: { padding: 'a'.repeat(200_000) } },
      }),
      { authorization },
    );
    expect(oversized.status).toBe(413);

    const invalidJson = await postRaw('{"jsonrpc": "2.0", "id": 2, ', { authorization });
    expect(invalidJson.status).toBeGreaterThanOrEqual(400);
    expect(invalidJson.status).toBeLessThan(500);

    const batch = await postRaw(
      JSON.stringify([{ jsonrpc: '2.0', id: 3, method: 'tools/list', params: {} }]),
      { authorization },
    );
    expect(batch.status).toBeGreaterThanOrEqual(200);

    const malformedArguments: unknown[] = ['not-an-object', 42, ['a'], true];
    for (const argumentValue of malformedArguments) {
      const response = await mcpPost(
        endpoint,
        {
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: { name: 'dockpilot_list_users', arguments: argumentValue },
        },
        { authorization },
      );
      expect(response.status).toBeLessThan(500);
      const raw = JSON.stringify(await response.json());
      expect(raw).toContain('error');
      for (const marker of stackTraceMarkers) expect(raw).not.toContain(marker);
    }

    const stillHealthy = await callTool(await connect(credential.token), 'dockpilot_health', {});
    expect(stillHealthy.isError).toBe(false);
    expect(stillHealthy.structuredContent?.status).toBe('ok');
  }, 60_000);
});

describe('credential abuse', () => {
  it('rejects malformed and foreign tokens and throttles brute force attempts', async () => {
    const valid = await createCredential(app, ownerCookie, {
      name: 'token-shape-agent',
      permissionLevel: 'read',
    });
    const tokenSuffix = 'C'.repeat(43);
    const forgedTokens = [
      `dpai_${tokenSuffix}`,
      `dpai_${'D'.repeat(42)}`,
      `dpai_${'E'.repeat(44)}`,
      `dpai_${'F'.repeat(20)}.${'G'.repeat(22)}`,
      `dpai_${'H'.repeat(20)}=${'I'.repeat(22)}`,
      'Bearer',
      '',
    ];
    for (const token of forgedTokens) {
      const response = await mcpPost(
        endpoint,
        { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
        { authorization: `Bearer ${token}` },
      );
      expect(response.status).toBe(401);
      expect(JSON.stringify(await response.json())).not.toContain(valid.token);
    }

    const cookieAttempt = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { cookie: ownerCookie },
    );
    expect(cookieAttempt.status).toBe(401);

    const toolEvents = (await auditRows()).filter((row) => row.tool_name !== null);
    expect(toolEvents).toHaveLength(0);

    resetRateLimiters();
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 21; attempt += 1) {
      const response = await mcpPost(
        endpoint,
        { jsonrpc: '2.0', id: attempt, method: 'tools/list', params: {} },
        { authorization: `Bearer dpai_${'Z'.repeat(43)}` },
      );
      statuses.push(response.status);
    }
    expect(statuses.slice(0, 20).every((status) => status === 401)).toBe(true);
    expect(statuses[20]).toBe(429);
  }, 60_000);
});

describe('rate limit isolation and credential lifecycle', () => {
  it('rate limits per credential so one noisy agent cannot deny service to another', async () => {
    const noisy = await createCredential(app, ownerCookie, {
      name: 'noisy-isolated-agent',
      permissionLevel: 'write',
    });
    const quiet = await createCredential(app, ownerCookie, {
      name: 'quiet-isolated-agent',
      permissionLevel: 'write',
    });

    const noisyClient = await connect(noisy.token);
    let noisyLimited = false;
    for (let attempt = 0; attempt < 21; attempt += 1) {
      const result = await callTool(noisyClient, 'dockpilot_update_my_credential', {
        description: `noisy ${String(attempt)}`,
      });
      if (result.isError && result.text.includes('rate_limited')) {
        noisyLimited = true;
        break;
      }
    }
    expect(noisyLimited).toBe(true);

    const quietClient = await connect(quiet.token);
    const quietWrite = await callTool(quietClient, 'dockpilot_update_my_credential', {
      description: 'quiet write',
    });
    expect(quietWrite.isError).toBe(false);

    const noisyRows = await auditRows({ credentialId: noisy.id });
    expect(noisyRows.some((row) => row.error_category === 'rate_limited')).toBe(true);
    const quietRows = await auditRows({ credentialId: quiet.id });
    expect(quietRows).toHaveLength(1);
    expect(quietRows[0]?.outcome).toBe('success');
  }, 90_000);

  it('stops a revoked or expired credential immediately and records the rejected attempt', async () => {
    const revoked = await createCredential(app, ownerCookie, {
      name: 'lifecycle-revoked-agent',
      permissionLevel: 'read',
    });
    const expired = await createCredential(app, ownerCookie, {
      name: 'lifecycle-expired-agent',
      permissionLevel: 'read',
    });

    const revokeResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/admin/ai-credentials/${revoked.id}/revoke`,
      headers: originHeaders({ cookie: ownerCookie }),
    });
    expect(revokeResponse.statusCode).toBe(200);

    await client`UPDATE ai_credentials SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = ${expired.id}`;

    const healthCall = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'dockpilot_health', arguments: {} },
    };
    for (const token of [revoked.token, expired.token]) {
      const response = await mcpPost(endpoint, healthCall, {
        authorization: `Bearer ${token}`,
      });
      expect(response.status).toBe(401);
      const raw = JSON.stringify(await response.json());
      expect(raw).not.toContain(token);
    }

    for (const credential of [revoked, expired]) {
      const rows = await auditRows({ credentialId: credential.id });
      expect(rows.length).toBeGreaterThanOrEqual(1);
      expect(rows[0]?.action).toBe('mcp.authentication_denied');
      expect(rows[0]?.outcome).toBe('denied');
      expect(rows[0]?.error_category).toBe('authentication');
      expect(rows[0]?.correlation_id).not.toBeNull();
    }

    const toolEvents = (await auditRows()).filter((row) => row.tool_name !== null);
    expect(toolEvents).toHaveLength(0);
  }, 40_000);
});
