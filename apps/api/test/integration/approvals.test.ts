import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { LightMyRequestResponse } from 'fastify';
import { db, sql as client } from '../../src/db/index.js';
import { aiCredentials, organizations, sessions, users } from '../../src/db/schema.js';
import { createAiToken } from '../../src/lib/ai-token.js';
import { createSessionToken, hashPassword, hashSessionToken } from '../../src/lib/security.js';
import {
  asRecord,
  bootstrapOwner,
  callTool,
  connectMcp,
  createCredential,
  mcpEndpoint,
  mcpPost,
  originHeaders,
  resetDatabase,
  resetRateLimiters,
  startTestApp,
  type TestApp,
} from '../helpers/control-harness.js';

interface AuditRow {
  id: string;
  action: string;
  outcome: string;
  actor_user_id: string | null;
  ai_credential_id: string | null;
  approval_id: string | null;
  permission_used: string | null;
  tool_name: string | null;
  input_summary: Record<string, unknown> | null;
}

let app: TestApp;
let endpoint: string;
let ownerCookie: string;
let ownerId: string;
let organizationId: string;
const openClients: Client[] = [];

beforeEach(async () => {
  await resetDatabase();
  resetRateLimiters();
  app = await startTestApp();
  endpoint = mcpEndpoint(app);
  const owner = await bootstrapOwner(app);
  ownerCookie = owner.cookie;
  ownerId = owner.user.id;
  organizationId = owner.user.organizationId;
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

function adminGet(path: string, cookie?: string): Promise<LightMyRequestResponse> {
  return app.inject({
    method: 'GET',
    url: `/api/v1/admin${path}`,
    headers: cookie === undefined ? originHeaders() : originHeaders({ cookie }),
  });
}

function adminPost(path: string, cookie: string, payload: object): Promise<LightMyRequestResponse> {
  return app.inject({
    method: 'POST',
    url: `/api/v1/admin${path}`,
    headers: originHeaders({ cookie, 'content-type': 'application/json' }),
    payload,
  });
}

async function auditRows(action?: string): Promise<AuditRow[]> {
  if (action === undefined) {
    return client<AuditRow[]>`
      SELECT id, action, outcome, actor_user_id, ai_credential_id, approval_id,
             permission_used, tool_name, input_summary
      FROM audit_logs ORDER BY occurred_at, id`;
  }
  return client<AuditRow[]>`
    SELECT id, action, outcome, actor_user_id, ai_credential_id, approval_id,
           permission_used, tool_name, input_summary
    FROM audit_logs WHERE action = ${action} ORDER BY occurred_at, id`;
}

async function createMember(role: 'operator' | 'viewer', suffix: string): Promise<string> {
  const email = `${role}-${suffix}@mcp-integration.example`;
  const inserted = await db
    .insert(users)
    .values({
      email,
      emailNormalized: email,
      passwordHash: await hashPassword('integration-test-member-password-987'),
      name: `Integration ${role}`,
      organizationId,
      role,
    })
    .returning({ id: users.id });
  const member = inserted[0];
  if (!member) throw new Error('Failed to create the member fixture.');
  const token = createSessionToken();
  await db.insert(sessions).values({
    tokenHash: hashSessionToken(token),
    userId: member.id,
    expiresAt: new Date(Date.now() + 3600_000),
  });
  return `dockpilot_session=${token}`;
}

async function createSessionFor(userId: string): Promise<string> {
  const inserted = await db
    .insert(sessions)
    .values({
      tokenHash: hashSessionToken(createSessionToken()),
      userId,
      expiresAt: new Date(Date.now() + 3600_000),
    })
    .returning({ id: sessions.id });
  const session = inserted[0];
  if (!session) throw new Error('Failed to create the session fixture.');
  return session.id;
}

async function sessionIds(): Promise<string[]> {
  const rows = await client<{ id: string }[]>`SELECT id FROM sessions ORDER BY created_at`;
  return rows.map((row) => row.id);
}

async function pendingApprovalCount(): Promise<number> {
  const rows = await client<{ total: number }[]>`SELECT count(*)::int AS total FROM ai_approvals`;
  return rows[0]?.total ?? 0;
}

async function createForeignOrganization(): Promise<{ userId: string; eventId: string }> {
  const insertedOrganization = await db
    .insert(organizations)
    .values({ name: 'Foreign Lab' })
    .returning({ id: organizations.id });
  const foreignOrganization = insertedOrganization[0];
  if (!foreignOrganization) throw new Error('Failed to create the foreign organization.');
  const insertedUser = await db
    .insert(users)
    .values({
      email: 'foreign-owner@mcp-integration.example',
      emailNormalized: 'foreign-owner@mcp-integration.example',
      passwordHash: await hashPassword('integration-test-foreign-password-987'),
      name: 'Foreign Owner',
      organizationId: foreignOrganization.id,
      role: 'owner',
    })
    .returning({ id: users.id });
  const foreignUser = insertedUser[0];
  if (!foreignUser) throw new Error('Failed to create the foreign user.');
  const generated = createAiToken();
  await db.insert(aiCredentials).values({
    organizationId: foreignOrganization.id,
    createdByUserId: foreignUser.id,
    name: 'foreign-agent',
    permissionLevel: 'read',
    tokenPrefix: generated.tokenPrefix,
    tokenHash: generated.tokenHash,
  });
  const foreignClient = await connect(generated.token);
  const health = await callTool(foreignClient, 'dockpilot_health', {});
  if (health.isError) throw new Error('The foreign credential could not call a tool.');
  const rows = await client<{ id: string }[]>`
    SELECT id FROM audit_logs
    WHERE organization_id = ${foreignOrganization.id} AND tool_name = 'dockpilot_health'
    ORDER BY occurred_at DESC LIMIT 1`;
  const eventId = rows[0]?.id;
  if (eventId === undefined) throw new Error('The foreign organization produced no audit event.');
  return { userId: foreignUser.id, eventId };
}

async function requestSessionRevocation(
  mcpClient: Client,
  sessionId: string,
  justification: string,
) {
  return callTool(mcpClient, 'dockpilot_request_session_revocation', { sessionId, justification });
}

describe('administrator authorization', () => {
  it('requires an owner or administrator session for administrator routes', async () => {
    expect((await adminGet('/system-status')).statusCode).toBe(401);
    expect(await client`SELECT id FROM users`).toHaveLength(1);

    const ownerStatus = await adminGet('/system-status', ownerCookie);
    expect(ownerStatus.statusCode).toBe(200);
    expect(ownerStatus.json<{ counts: { users: number } }>().counts.users).toBe(1);

    for (const role of ['operator', 'viewer'] as const) {
      const cookie = await createMember(role, 'status');
      const response = await adminGet('/system-status', cookie);
      expect(response.statusCode).toBe(403);
      expect(response.json<{ error: string }>().error).toBe('FORBIDDEN');
    }

    const unknownSession = `dockpilot_session=${'A'.repeat(43)}`;
    expect((await adminGet('/system-status', unknownSession)).statusCode).toBe(401);
  }, 30_000);

  it('denies unauthenticated and non-administrator access to credentials, audit and approvals', async () => {
    const viewerCookie = await createMember('viewer', 'list');
    for (const path of ['/ai-credentials', '/audit-events', '/approvals']) {
      expect((await adminGet(path)).statusCode).toBe(401);
      expect((await adminGet(path, viewerCookie)).statusCode).toBe(403);
      expect((await adminGet(path, ownerCookie)).statusCode).toBe(200);
    }
  }, 30_000);
});

describe('AI credential management', () => {
  it('shows a new token exactly once and stores only a keyed digest', async () => {
    const response = await adminPost('/ai-credentials', ownerCookie, {
      name: 'provisioned-agent',
      description: 'Provisioned by the integration suite',
      agentIdentity: 'provisioned-agent-v1',
      permissionLevel: 'read',
      expiresInDays: 30,
    });
    expect(response.statusCode).toBe(201);
    const created = response.json<{
      credential: { id: string; tokenPrefix: string; permissionLevel: string };
      token: string;
    }>();
    expect(created.token).toMatch(/^dpai_[A-Za-z0-9_-]{43}$/u);
    expect(created.credential.tokenPrefix).toMatch(/^dpai_[A-Za-z0-9_-]{8}$/u);
    expect(created.credential.tokenPrefix).toBe(created.token.slice(0, 13));
    expect(created.credential.permissionLevel).toBe('read');

    const listing = await adminGet('/ai-credentials', ownerCookie);
    expect(listing.statusCode).toBe(200);
    expect(listing.body).not.toContain(created.token);
    expect(listing.body).not.toContain('tokenHash');
    expect(listing.body).not.toContain('token_hash');

    const stored = await client<{ token_hash: string }[]>`
      SELECT token_hash FROM ai_credentials WHERE id = ${created.credential.id}`;
    const tokenHash = stored[0]?.token_hash;
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(tokenHash).not.toBe(created.token);
    expect(response.body).not.toContain(tokenHash ?? '');
  }, 30_000);

  it('rejects invalid credential input with 400', async () => {
    const invalid: Record<string, unknown>[] = [
      { name: 'bad-agent', permissionLevel: 'root' },
      { permissionLevel: 'read' },
      { name: 'x'.repeat(81), permissionLevel: 'read' },
      { name: 'bad-expiry', permissionLevel: 'read', expiresInDays: 0 },
      { name: 'bad-expiry', permissionLevel: 'read', expiresInDays: 366 },
      { name: 'overposted', permissionLevel: 'read', token: 'dpai_injected' },
      { name: 'overposted', permissionLevel: 'read', id: '00000000-0000-4000-8000-000000000000' },
    ];
    for (const payload of invalid) {
      const response = await adminPost('/ai-credentials', ownerCookie, payload);
      expect(response.statusCode).toBe(400);
      expect(response.json<{ error: string }>().error).toBe('VALIDATION_ERROR');
    }
    expect(await client`SELECT id FROM ai_credentials`).toHaveLength(0);
  }, 30_000);

  it('revokes a credential immediately and refuses a repeat or unknown revocation', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'to-be-revoked',
      permissionLevel: 'read',
    });
    const first = await adminPost(`/ai-credentials/${credential.id}/revoke`, ownerCookie, {});
    expect(first.statusCode).toBe(200);
    const revokedCredential = first.json<{ credential: { revokedAt: string | null } }>();
    expect(revokedCredential.credential.revokedAt).not.toBeNull();

    const revokedCall = await mcpPost(
      endpoint,
      { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
      { authorization: `Bearer ${credential.token}` },
    );
    expect(revokedCall.status).toBe(401);

    const second = await adminPost(`/ai-credentials/${credential.id}/revoke`, ownerCookie, {});
    expect(second.statusCode).toBe(409);

    const unknown = await adminPost(
      '/ai-credentials/00000000-0000-4000-8000-000000000000/revoke',
      ownerCookie,
      {},
    );
    expect(unknown.statusCode).toBe(404);

    const malformed = await adminPost('/ai-credentials/not-a-uuid/revoke', ownerCookie, {});
    expect(malformed.statusCode).toBe(400);
  }, 30_000);

  it('audits administrator credential mutations as human actions and never stores the token', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'audited-credential',
      permissionLevel: 'write',
    });
    const revoke = await adminPost(`/ai-credentials/${credential.id}/revoke`, ownerCookie, {});
    expect(revoke.statusCode).toBe(200);

    const created = await auditRows('ai_credential.created');
    expect(created).toHaveLength(1);
    expect(created[0]?.actor_user_id).toBe(ownerId);
    expect(created[0]?.ai_credential_id).toBeNull();

    const revoked = await auditRows('ai_credential.revoked');
    expect(revoked).toHaveLength(1);
    expect(revoked[0]?.actor_user_id).toBe(ownerId);
    expect(revoked[0]?.ai_credential_id).toBeNull();

    const stored = await client<{ text: string }[]>`
      SELECT action || COALESCE(metadata::text, '') AS text FROM audit_logs`;
    for (const row of stored) expect(row.text).not.toContain(credential.token);
  }, 30_000);
});

describe('administrator audit event access', () => {
  it('pages audit events newest-first with a usable cursor and rejects invalid pagination', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'pager',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(credential.token);
    for (let index = 0; index < 3; index += 1) {
      expect((await callTool(mcpClient, 'dockpilot_health', {})).isError).toBe(false);
    }

    const firstPage = await adminGet('/audit-events?limit=2', ownerCookie);
    expect(firstPage.statusCode).toBe(200);
    const firstBody = firstPage.json<{
      events: { id: string; occurredAt: string }[];
      nextCursor: string | null;
    }>();
    expect(firstBody.events).toHaveLength(2);
    expect(firstBody.nextCursor).not.toBeNull();
    const ordered = firstBody.events.map((event) => Date.parse(event.occurredAt));
    expect(ordered[0] ?? 0).toBeGreaterThanOrEqual(ordered[1] ?? 0);

    const secondPage = await adminGet(
      `/audit-events?limit=2&cursor=${encodeURIComponent(firstBody.nextCursor ?? '')}`,
      ownerCookie,
    );
    expect(secondPage.statusCode).toBe(200);
    const secondBody = secondPage.json<{ events: { id: string }[] }>();
    const firstIds = firstBody.events.map((event) => event.id);
    for (const event of secondBody.events) expect(firstIds).not.toContain(event.id);

    const single = await adminGet('/audit-events?limit=1', ownerCookie);
    const singleBody = single.json<{ events: { id: string }[]; nextCursor: string | null }>();
    expect(singleBody.events).toHaveLength(1);
    expect(singleBody.nextCursor).not.toBeNull();

    const byTool = await adminGet('/audit-events?toolName=dockpilot_health', ownerCookie);
    const byToolBody = byTool.json<{ events: { toolName: string | null }[] }>();
    expect(byToolBody.events.length).toBeGreaterThanOrEqual(3);
    for (const event of byToolBody.events) expect(event.toolName).toBe('dockpilot_health');

    const invalid = [
      '/audit-events?limit=0',
      '/audit-events?limit=101',
      '/audit-events?cursor=not-a-cursor',
    ];
    for (const path of invalid) {
      expect((await adminGet(path, ownerCookie)).statusCode).toBe(400);
    }
  }, 30_000);

  it('filters audit events by outcome and by time window', async () => {
    const reader = await createCredential(app, ownerCookie, {
      name: 'reader',
      permissionLevel: 'read',
    });
    const writer = await createCredential(app, ownerCookie, {
      name: 'writer',
      permissionLevel: 'write',
    });
    const readerClient = await connect(reader.token);
    const writerClient = await connect(writer.token);

    expect((await callTool(readerClient, 'dockpilot_health', {})).isError).toBe(false);
    const denied = await callTool(readerClient, 'dockpilot_update_my_credential', {
      description: 'denied attempt',
    });
    expect(denied.isError).toBe(true);
    expect((await callTool(writerClient, 'dockpilot_health', {})).isError).toBe(false);

    const denials = await adminGet('/audit-events?outcome=denied', ownerCookie);
    const deniedEvents = denials.json<{ events: { outcome: string }[] }>().events;
    expect(deniedEvents.length).toBeGreaterThanOrEqual(1);
    for (const event of deniedEvents) expect(event.outcome).toBe('denied');

    const successes = await adminGet('/audit-events?outcome=success', ownerCookie);
    const successEvents = successes.json<{ events: { outcome: string }[] }>().events;
    for (const event of successEvents) expect(event.outcome).toBe('success');

    const from = encodeURIComponent(new Date(Date.now() - 3_600_000).toISOString());
    const to = encodeURIComponent(new Date(Date.now() + 3_600_000).toISOString());
    const wide = await adminGet(`/audit-events?from=${from}&to=${to}`, ownerCookie);
    expect(wide.statusCode).toBe(200);
    expect(wide.json<{ events: unknown[] }>().events.length).toBeGreaterThan(0);

    const future = encodeURIComponent(new Date(Date.now() + 3_600_000).toISOString());
    const empty = await adminGet(`/audit-events?from=${future}`, ownerCookie);
    expect(empty.statusCode).toBe(200);
    expect(empty.json<{ events: unknown[] }>().events).toHaveLength(0);
  }, 30_000);

  it('returns a redacted event detail and reports missing or malformed identifiers', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'redaction-agent',
      permissionLevel: 'write',
    });
    const mcpClient = await connect(credential.token);
    const updated = await callTool(mcpClient, 'dockpilot_update_my_credential', {
      description: 'redaction probe',
      metadata: { token: 'super-secret-value', region: 'eu-central-1' },
    });
    expect(updated.isError).toBe(false);

    const listing = await adminGet(
      '/audit-events?action=mcp.update_own_credential&limit=1',
      ownerCookie,
    );
    const eventId = listing.json<{ events: { id: string }[] }>().events[0]?.id;
    if (eventId === undefined) throw new Error('Expected an audit event for the update.');

    const detail = await adminGet(`/audit-events/${eventId}`, ownerCookie);
    expect(detail.statusCode).toBe(200);
    expect(detail.body).not.toContain('super-secret-value');
    expect(detail.body).toContain('[REDACTED]');
    expect(detail.body).toContain('eu-central-1');
    const parsed = detail.json<{ inputSummary: Record<string, unknown> | null }>();
    expect(asRecord(parsed.inputSummary?.metadata)?.token).toBe('[REDACTED]');

    const missing = await adminGet(
      '/audit-events/00000000-0000-4000-8000-000000000000',
      ownerCookie,
    );
    expect(missing.statusCode).toBe(404);
    expect((await adminGet('/audit-events/not-a-uuid', ownerCookie)).statusCode).toBe(400);
  }, 30_000);

  it('never exposes another organization audit events through listing or detail', async () => {
    const foreign = await createForeignOrganization();

    const detail = await adminGet(`/audit-events/${foreign.eventId}`, ownerCookie);
    expect(detail.statusCode).toBe(404);
    expect(detail.body).not.toContain(foreign.eventId);

    const listing = await adminGet('/audit-events?limit=100', ownerCookie);
    const events = listing.json<{ events: { id: string }[] }>().events;
    for (const event of events) expect(event.id).not.toBe(foreign.eventId);
  }, 30_000);
});

describe('human approval for destructive AI actions', () => {
  it('records a pending approval without performing the destructive action', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'destructive-agent',
      permissionLevel: 'destructive',
      agentIdentity: 'destructive-agent-identity',
    });
    const targetSessionId = await createSessionFor(ownerId);
    const mcpClient = await connect(credential.token);

    const result = await requestSessionRevocation(
      mcpClient,
      targetSessionId,
      'Runaway agent containment',
    );
    expect(result.isError).toBe(false);
    expect(result.structuredContent?.approvalRequired).toBe(true);
    expect(result.structuredContent?.status).toBe('pending');
    expect(result.structuredContent?.targetType).toBe('session');
    expect(result.structuredContent?.targetId).toBe(targetSessionId);
    const approvalId = result.structuredContent?.approvalId;
    expect(typeof approvalId).toBe('string');
    expect(await sessionIds()).toContain(targetSessionId);

    const listing = await adminGet('/approvals?status=pending', ownerCookie);
    expect(listing.statusCode).toBe(200);
    const approvals = listing.json<{
      approvals: {
        id: string;
        status: string;
        targetId: string;
        justification: string | null;
        requestedByCredentialName: string | null;
        requestedByAgentIdentity: string | null;
      }[];
    }>().approvals;
    expect(approvals).toHaveLength(1);
    expect(approvals[0]?.id).toBe(approvalId);
    expect(approvals[0]?.status).toBe('pending');
    expect(approvals[0]?.targetId).toBe(targetSessionId);
    expect(approvals[0]?.justification).toBe('Runaway agent containment');
    expect(approvals[0]?.requestedByCredentialName).toBe('destructive-agent');
    expect(approvals[0]?.requestedByAgentIdentity).toBe('destructive-agent-identity');

    const rows = await auditRows('mcp.request_session_revocation');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.outcome).toBe('success');
    expect(rows[0]?.approval_id).toBe(approvalId);
    expect(rows[0]?.ai_credential_id).toBe(credential.id);
  }, 30_000);

  it('prevents execution when an administrator rejects the request', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'rejected-agent',
      permissionLevel: 'destructive',
    });
    const targetSessionId = await createSessionFor(ownerId);
    const mcpClient = await connect(credential.token);
    const request = await requestSessionRevocation(mcpClient, targetSessionId, 'Contain the agent');
    const approvalId = request.structuredContent?.approvalId;
    if (typeof approvalId !== 'string') throw new Error('Expected an approval identifier.');

    const decision = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'reject',
      note: 'Not justified',
    });
    expect(decision.statusCode).toBe(200);
    const decided = decision.json<{
      approval: { status: string; decidedByUserId: string | null };
    }>();
    expect(decided.approval.status).toBe('rejected');
    expect(decided.approval.decidedByUserId).toBe(ownerId);

    expect(await sessionIds()).toContain(targetSessionId);
    const rows = await auditRows('approval.rejected');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.outcome).toBe('denied');
    expect(rows[0]?.approval_id).toBe(approvalId);

    const replay = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'reject',
    });
    expect(replay.statusCode).toBe(409);
  }, 30_000);

  it('executes an approved action exactly once and audits the execution', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'approved-agent',
      permissionLevel: 'destructive',
    });
    const targetSessionId = await createSessionFor(ownerId);
    const mcpClient = await connect(credential.token);
    const request = await requestSessionRevocation(mcpClient, targetSessionId, 'Contain the agent');
    const approvalId = request.structuredContent?.approvalId;
    if (typeof approvalId !== 'string') throw new Error('Expected an approval identifier.');

    const decision = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
      note: 'Reviewed and approved',
    });
    expect(decision.statusCode).toBe(200);
    const decided = decision.json<{
      approval: {
        status: string;
        executionAuditEventId: string | null;
        decisionNote: string | null;
      };
    }>();
    expect(decided.approval.status).toBe('executed');
    expect(decided.approval.executionAuditEventId).not.toBeNull();
    expect(decided.approval.decisionNote).toBe('Reviewed and approved');

    expect(await sessionIds()).not.toContain(targetSessionId);

    const rows = await auditRows('session.revoked');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.outcome).toBe('success');
    expect(rows[0]?.permission_used).toBe('destructive');
    expect(rows[0]?.approval_id).toBe(approvalId);
    expect(rows[0]?.id).toBe(decided.approval.executionAuditEventId);

    const replay = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
    });
    expect(replay.statusCode).toBe(409);
  }, 30_000);

  it('refuses an expired approval and reports it as expired', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'expiring-agent',
      permissionLevel: 'destructive',
    });
    const targetSessionId = await createSessionFor(ownerId);
    const mcpClient = await connect(credential.token);
    const request = await requestSessionRevocation(mcpClient, targetSessionId, 'Contain the agent');
    const approvalId = request.structuredContent?.approvalId;
    if (typeof approvalId !== 'string') throw new Error('Expected an approval identifier.');

    await client`UPDATE ai_approvals SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = ${approvalId}`;

    const decision = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
    });
    expect(decision.statusCode).toBe(409);
    expect(await sessionIds()).toContain(targetSessionId);

    const listing = await adminGet('/approvals?status=expired', ownerCookie);
    const expired = listing.json<{ approvals: { id: string; status: string }[] }>().approvals;
    expect(expired.map((approval) => approval.id)).toContain(approvalId);
    expect(await auditRows('approval.expired')).toHaveLength(1);

    const unknown = await adminPost(
      '/approvals/00000000-0000-4000-8000-000000000000/decision',
      ownerCookie,
      { decision: 'approve' },
    );
    expect(unknown.statusCode).toBe(404);

    const missingDecision = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {});
    expect(missingDecision.statusCode).toBe(400);

    const invalidDecision = await adminPost(`/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'maybe',
    });
    expect(invalidDecision.statusCode).toBe(400);
  }, 30_000);
});

describe('destructive capability boundaries', () => {
  it('refuses to create an approval for a credential without destructive permission', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'write-only-agent',
      permissionLevel: 'write',
    });
    const targetSessionId = await createSessionFor(ownerId);
    const mcpClient = await connect(credential.token);

    const denied = await requestSessionRevocation(mcpClient, targetSessionId, 'Contain the agent');
    expect(denied.isError).toBe(true);
    expect(denied.text).toContain('authorization');
    expect(await pendingApprovalCount()).toBe(0);
    expect(await sessionIds()).toContain(targetSessionId);
  }, 30_000);

  it('refuses to target sessions or credentials outside the organization', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'boundary-agent',
      permissionLevel: 'destructive',
    });
    const foreign = await createForeignOrganization();
    const foreignSessionId = await createSessionFor(foreign.userId);
    const foreignCredential = await client<{ id: string }[]>`
      SELECT c.id FROM ai_credentials c
      JOIN organizations o ON o.id = c.organization_id
      WHERE o.name = 'Foreign Lab' LIMIT 1`;
    const foreignCredentialId = foreignCredential[0]?.id;
    if (foreignCredentialId === undefined) throw new Error('Expected a foreign credential.');

    const mcpClient = await connect(credential.token);

    const foreignSessionAttempt = await requestSessionRevocation(
      mcpClient,
      foreignSessionId,
      'Contain the foreign agent',
    );
    expect(foreignSessionAttempt.isError).toBe(true);
    expect(foreignSessionAttempt.text).toContain('not_found');

    const unknownSession = await requestSessionRevocation(
      mcpClient,
      '00000000-0000-4000-8000-000000000000',
      'Contain the agent',
    );
    expect(unknownSession.isError).toBe(true);
    expect(unknownSession.text).toContain('not_found');

    const foreignCredentialRequest = await callTool(
      mcpClient,
      'dockpilot_request_credential_revocation',
      { credentialId: foreignCredentialId, justification: 'Contain the rogue credential' },
    );
    expect(foreignCredentialRequest.isError).toBe(true);
    expect(foreignCredentialRequest.text).toContain('not_found');

    expect(await sessionIds()).toContain(foreignSessionId);
    expect(await pendingApprovalCount()).toBe(0);
    const storedCredential = await client<{ revoked_at: string | null }[]>`
      SELECT revoked_at FROM ai_credentials WHERE id = ${foreignCredentialId}`;
    expect(storedCredential[0]?.revoked_at).toBeNull();
  }, 30_000);

  it('rate limits destructive approval requests per credential', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'noisy-destructive-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    const targetSessions: string[] = [];
    for (let index = 0; index < 5; index += 1) {
      targetSessions.push(await createSessionFor(ownerId));
    }

    for (const sessionId of targetSessions) {
      const result = await requestSessionRevocation(mcpClient, sessionId, 'Contain the agent');
      expect(result.isError).toBe(false);
    }
    expect(await pendingApprovalCount()).toBe(5);

    const firstTarget = targetSessions[0];
    if (firstTarget === undefined) throw new Error('Missing session fixture.');
    const sixth = await requestSessionRevocation(mcpClient, firstTarget, 'Contain the agent');
    expect(sixth.isError).toBe(true);
    expect(sixth.text).toContain('rate_limited');
    expect(await pendingApprovalCount()).toBe(5);

    const rows = await auditRows('mcp.request_session_revocation');
    expect(rows.filter((row) => row.outcome === 'denied')).toHaveLength(1);
  }, 60_000);
});

describe('approval listing shape', () => {
  it('pages approvals with a cursor and reports invalid status filters', async () => {
    const credential = await createCredential(app, ownerCookie, {
      name: 'listing-agent',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(credential.token);
    for (let index = 0; index < 3; index += 1) {
      const sessionId = await createSessionFor(ownerId);
      const result = await requestSessionRevocation(mcpClient, sessionId, 'Contain the agent');
      expect(result.isError).toBe(false);
    }
    await createForeignOrganization();

    const page = await adminGet('/approvals?limit=2', ownerCookie);
    expect(page.statusCode).toBe(200);
    const body = page.json<{ approvals: { id: string }[]; nextCursor: string | null }>();
    expect(body.approvals).toHaveLength(2);
    expect(body.nextCursor).not.toBeNull();

    const next = await adminGet(
      `/approvals?limit=2&cursor=${encodeURIComponent(body.nextCursor ?? '')}`,
      ownerCookie,
    );
    expect(next.statusCode).toBe(200);
    const nextBody = next.json<{ approvals: { id: string }[] }>();
    expect(nextBody.approvals).toHaveLength(1);
    const firstIds = body.approvals.map((approval) => approval.id);
    for (const approval of nextBody.approvals) expect(firstIds).not.toContain(approval.id);

    const all = await adminGet('/approvals?limit=100', ownerCookie);
    expect(all.json<{ approvals: unknown[] }>().approvals).toHaveLength(3);
    expect((await adminGet('/approvals?status=nonsense', ownerCookie)).statusCode).toBe(400);
  }, 30_000);
});
