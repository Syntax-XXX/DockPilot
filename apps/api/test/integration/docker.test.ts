import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { LightMyRequestResponse } from 'fastify';
import { db, sql as client } from '../../src/db/index.js';
import { organizations, sessions, users } from '../../src/db/schema.js';
import { createSessionToken, hashPassword, hashSessionToken } from '../../src/lib/security.js';
import {
  bootstrapOwner,
  callTool,
  connectMcp,
  createCredential,
  mcpEndpoint,
  originHeaders,
  resetDatabase,
  resetRateLimiters,
  startTestApp,
  type TestApp,
} from '../helpers/control-harness.js';
import {
  startDockerFixture,
  fixtureContainer,
  type DockerFixture,
} from '../helpers/docker-fixture.js';

const containerId = 'c'.repeat(64);

let app: TestApp;
let endpoint: string;
let ownerCookie: string;
let organizationId: string;
let fixture: DockerFixture;
const openClients: Client[] = [];

beforeEach(async () => {
  await resetDatabase();
  resetRateLimiters();
  fixture = await startDockerFixture([
    fixtureContainer({ id: containerId, name: 'fixture-web', image: 'nginx:alpine' }),
  ]);
  app = await startTestApp();
  endpoint = mcpEndpoint(app);
  const owner = await bootstrapOwner(app);
  ownerCookie = owner.cookie;

  organizationId = owner.user.organizationId;
  openClients.length = 0;
});

afterEach(async () => {
  for (const openClient of openClients) {
    await openClient.close().catch(() => undefined);
  }
  await app.close();
  await fixture.stop();
});

afterAll(async () => {
  await client.end({ timeout: 5 });
});

function adminGet(path: string, cookie: string): Promise<LightMyRequestResponse> {
  return app.inject({
    method: 'GET',
    url: `/api/v1/admin${path}`,
    headers: originHeaders({ cookie }),
  });
}

function adminSend(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  cookie: string,
  payload: object = {},
): Promise<LightMyRequestResponse> {
  return app.inject({
    method,
    url: `/api/v1/admin${path}`,
    headers: originHeaders({ cookie, 'content-type': 'application/json' }),
    payload,
  });
}

async function createMember(role: 'operator' | 'viewer', suffix: string): Promise<string> {
  const email = `${role}-${suffix}@docker-integration.example`;
  const inserted = await db
    .insert(users)
    .values({
      email,
      emailNormalized: email,
      passwordHash: await hashPassword('integration-test-member-password-987'),
      name: `Docker ${role}`,
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

async function registerHost(cookie: string, name = 'fixture-host'): Promise<string> {
  const response = await adminSend('POST', '/hosts', cookie, {
    name,
    description: 'integration fixture host',
    endpoint: fixture.endpoint,
  });
  expect(response.statusCode).toBe(201);
  const body = response.json<{ host: { id: string; endpoint: string }; token: string }>();
  expect(body.host.endpoint).toBe(fixture.endpoint);
  expect(body.token.startsWith('dph_')).toBe(true);
  return body.host.id;
}

async function syncHost(cookie: string, hostId: string): Promise<void> {
  const response = await adminSend('POST', `/hosts/${hostId}/sync`, cookie);
  expect(response.statusCode).toBe(200);
  expect(response.json<{ synced: number }>().synced).toBe(1);
}

async function connect(token: string): Promise<Client> {
  const mcpClient = await connectMcp(endpoint, token);
  openClients.push(mcpClient);
  return mcpClient;
}

async function auditActions(): Promise<string[]> {
  const rows = await client<{ action: string }[]>`
    SELECT action FROM audit_logs ORDER BY occurred_at, id`;
  return rows.map((row) => row.action);
}

describe('host and container REST surface', () => {
  it('registers a host, syncs containers, reads logs and drives container actions', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const listing = await adminGet(`/hosts/${hostId}/containers`, ownerCookie);
    expect(listing.statusCode).toBe(200);
    const containers = listing.json<{ containers: { containerId: string; image: string }[] }>()
      .containers;
    expect(containers).toHaveLength(1);
    expect(containers[0]?.containerId).toBe(containerId);

    const logs = await adminGet(`/containers/${containerId}/logs?tail=10`, ownerCookie);
    expect(logs.statusCode).toBe(200);
    expect(logs.json<{ log: { log: string } }>().log.log).toContain('fixture log line');

    for (const action of ['start', 'stop', 'restart'] as const) {
      const response = await adminSend('POST', `/containers/${containerId}/${action}`, ownerCookie);
      expect(response.statusCode).toBe(200);
      expect(response.json<{ container: { containerId: string } }>().container.containerId).toBe(
        containerId,
      );
    }

    const actions = await auditActions();
    expect(actions).toContain('host.created');
    expect(actions).toContain('host.synced');
    expect(actions).toContain('container.started');
    expect(actions).toContain('container.stopped');
    expect(actions).toContain('container.restarted');
  }, 30_000);

  it('rejects a Docker endpoint outside the operator allowlist with a validation error', async () => {
    const response = await adminSend('POST', '/hosts', ownerCookie, {
      name: 'rogue-host',
      endpoint: 'unix:///tmp/dockpilot-not-allowlisted.sock',
    });
    expect(response.statusCode).toBe(400);
    expect(response.json<{ error: string }>().error).toBe('VALIDATION');
    expect(await client`SELECT id FROM hosts`).toHaveLength(0);
  }, 30_000);

  it('enforces viewer, operator and administrator capabilities server-side', async () => {
    const viewer = await createMember('viewer', 'read');
    const operator = await createMember('operator', 'ops');
    const hostId = await registerHost(ownerCookie);

    // Viewer can read.
    expect((await adminGet('/hosts', viewer)).statusCode).toBe(200);
    // Viewer cannot register or operate.
    expect(
      (
        await adminSend('POST', '/hosts', viewer, {
          name: 'viewer-host',
          endpoint: fixture.endpoint,
        })
      ).statusCode,
    ).toBe(403);
    expect((await adminSend('POST', `/hosts/${hostId}/sync`, viewer)).statusCode).toBe(403);

    // Operator can sync and act on containers, but cannot manage hosts.
    const sync = await adminSend('POST', `/hosts/${hostId}/sync`, operator);
    expect(sync.statusCode).toBe(200);
    expect(
      (
        await adminSend('POST', '/hosts', operator, {
          name: 'operator-host',
          endpoint: fixture.endpoint,
        })
      ).statusCode,
    ).toBe(403);
    expect((await adminSend('POST', `/hosts/${hostId}/disable`, operator)).statusCode).toBe(403);

    // Unauthenticated is rejected.
    expect((await adminGet('/hosts', 'dockpilot_session=none')).statusCode).toBe(401);
  }, 30_000);

  it('keeps hosts organization-scoped', async () => {
    const hostId = await registerHost(ownerCookie);
    const insertedOrg = await db
      .insert(organizations)
      .values({ name: 'Docker Foreign Lab' })
      .returning({ id: organizations.id });
    const foreignOrg = insertedOrg[0];
    if (!foreignOrg) throw new Error('Failed to create foreign organization.');
    const insertedUser = await db
      .insert(users)
      .values({
        email: 'foreign-owner@docker-integration.example',
        emailNormalized: 'foreign-owner@docker-integration.example',
        passwordHash: await hashPassword('integration-test-foreign-password-987'),
        name: 'Foreign Owner',
        organizationId: foreignOrg.id,
        role: 'owner',
      })
      .returning({ id: users.id });
    const foreignUser = insertedUser[0];
    if (!foreignUser) throw new Error('Failed to create foreign user.');
    const token = createSessionToken();
    await db.insert(sessions).values({
      tokenHash: hashSessionToken(token),
      userId: foreignUser.id,
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const foreignCookie = `dockpilot_session=${token}`;

    expect((await adminGet(`/hosts/${hostId}`, foreignCookie)).statusCode).toBe(404);
    const listing = await adminGet('/hosts', foreignCookie);
    expect(listing.json<{ hosts: unknown[] }>().hosts).toHaveLength(0);
  }, 30_000);

  it('routes container removal through human approval and only executes on approval', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const request = await adminSend('DELETE', `/containers/${containerId}`, ownerCookie, {
      justification: 'Retire the fixture container',
    });
    expect(request.statusCode).toBe(202);
    const approvalId = request.json<{ approval: { id: string; actionType: string } }>().approval.id;
    expect(request.json<{ approval: { actionType: string } }>().approval.actionType).toBe(
      'container.remove',
    );
    // Not removed yet.
    expect(await client`SELECT id FROM containers`).toHaveLength(1);

    const decision = await adminSend('POST', `/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
    });
    expect(decision.statusCode).toBe(200);
    expect(decision.json<{ approval: { status: string } }>().approval.status).toBe('executed');
    expect(await client`SELECT id FROM containers`).toHaveLength(0);

    const actions = await auditActions();
    expect(actions).toContain('container.removal_requested');
    expect(actions).toContain('container.removed');
  }, 30_000);

  it('routes host removal through human approval', async () => {
    const hostId = await registerHost(ownerCookie);
    const request = await adminSend('DELETE', `/hosts/${hostId}`, ownerCookie, {
      justification: 'Retire the fixture host',
    });
    expect(request.statusCode).toBe(202);
    const approvalId = request.json<{ approval: { id: string } }>().approval.id;
    expect(await client`SELECT id FROM hosts`).toHaveLength(1);

    const decision = await adminSend('POST', `/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
    });
    expect(decision.statusCode).toBe(200);
    expect(await client`SELECT id FROM hosts`).toHaveLength(0);
    expect(await auditActions()).toContain('host.removed');
  }, 30_000);
});

describe('Docker MCP tools', () => {
  it('lets a read credential inspect hosts and containers but denies mutation', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const reader = await createCredential(app, ownerCookie, {
      name: 'docker-reader',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(reader.token);

    const hosts = await callTool(mcpClient, 'dockpilot_list_hosts', {});
    expect(hosts.isError).toBe(false);
    expect(asArray(hosts.structuredContent?.hosts)).toHaveLength(1);

    const containers = await callTool(mcpClient, 'dockpilot_list_containers', { hostId });
    expect(containers.isError).toBe(false);
    expect(asArray(containers.structuredContent?.containers)).toHaveLength(1);

    const logs = await callTool(mcpClient, 'dockpilot_get_container_logs', { containerId });
    expect(logs.isError).toBe(false);

    const denied = await callTool(mcpClient, 'dockpilot_sync_host_containers', { hostId });
    expect(denied.isError).toBe(true);
    expect(denied.text).toContain('authorization');

    const auditRows = await client<{ outcome: string }[]>`
      SELECT outcome FROM audit_logs WHERE tool_name = 'dockpilot_sync_host_containers'`;
    expect(auditRows[0]?.outcome).toBe('denied');
  }, 30_000);

  it('lets a write credential register hosts, sync and change container state', async () => {
    const writer = await createCredential(app, ownerCookie, {
      name: 'docker-writer',
      permissionLevel: 'write',
    });
    const mcpClient = await connect(writer.token);

    const created = await callTool(mcpClient, 'dockpilot_create_host', {
      name: 'mcp-host',
      endpoint: fixture.endpoint,
    });
    expect(created.isError).toBe(false);
    const hostId = created.structuredContent?.host;
    const host = asRecord(hostId);
    const createdHostId = host?.id;
    if (typeof createdHostId !== 'string') throw new Error('Expected a created host id.');

    const synced = await callTool(mcpClient, 'dockpilot_sync_host_containers', {
      hostId: createdHostId,
    });
    expect(synced.isError).toBe(false);
    expect(synced.structuredContent?.synced).toBe(1);

    const started = await callTool(mcpClient, 'dockpilot_set_container_state', {
      containerId,
      action: 'restart',
    });
    expect(started.isError).toBe(false);
    expect(asRecord(started.structuredContent?.container)?.containerId).toBe(containerId);
  }, 30_000);

  it('creates pending approvals for removal requests without executing them', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const destructor = await createCredential(app, ownerCookie, {
      name: 'docker-destructor',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(destructor.token);

    const request = await callTool(mcpClient, 'dockpilot_request_container_removal', {
      containerId,
      justification: 'Contain the fixture workload',
    });
    expect(request.isError).toBe(false);
    expect(request.structuredContent?.approvalRequired).toBe(true);
    expect(request.structuredContent?.targetType).toBe('container');
    expect(await client`SELECT id FROM containers`).toHaveLength(1);

    const pending = await client<{ total: number }[]>`
      SELECT count(*)::int AS total FROM ai_approvals WHERE status = 'pending'`;
    expect(pending[0]?.total).toBe(1);
  }, 30_000);

  it('refuses container removal requests for containers outside the organization', async () => {
    const destructor = await createCredential(app, ownerCookie, {
      name: 'docker-boundary',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(destructor.token);

    const unknown = await callTool(mcpClient, 'dockpilot_request_container_removal', {
      containerId: 'd'.repeat(64),
      justification: 'Contain an unknown workload',
    });
    expect(unknown.isError).toBe(true);
    expect(unknown.text).toContain('not_found');
    expect(await client`SELECT count(*)::int AS total FROM ai_approvals`).toEqual([{ total: 0 }]);
  }, 30_000);
});

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return { ...value };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
