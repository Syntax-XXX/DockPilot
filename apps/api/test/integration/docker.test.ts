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
  const body = response.json<{ host: { id: string; endpoint: string } }>();
  expect(body.host.endpoint).toBe(fixture.endpoint);
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

    // The engine's state is authoritative: the response must reflect the state that the
    // action left behind (stop => exited), not the state captured at the last sync.
    const stopped = await adminSend('POST', `/containers/${containerId}/stop`, ownerCookie);
    expect(stopped.json<{ container: { state: string } }>().container.state).toBe('exited');
    const restarted = await adminSend('POST', `/containers/${containerId}/restart`, ownerCookie);
    expect(restarted.json<{ container: { state: string } }>().container.state).toBe('running');

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

  it('blocks Docker operations and re-enablement for a disabled host', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const disabled = await adminSend('POST', `/hosts/${hostId}/disable`, ownerCookie);
    expect(disabled.statusCode).toBe(200);
    expect(disabled.json<{ status: string }>().status).toBe('disabled');

    // Reading the stored inventory is still allowed; nothing reaches the Docker engine.
    expect((await adminGet(`/hosts/${hostId}/containers`, ownerCookie)).statusCode).toBe(200);

    // Re-syncing, operating a container and reading logs all refuse a disabled host.
    expect((await adminSend('POST', `/hosts/${hostId}/sync`, ownerCookie)).statusCode).toBe(409);
    expect(
      (await adminSend('POST', `/containers/${containerId}/start`, ownerCookie)).statusCode,
    ).toBe(409);
    expect((await adminGet(`/containers/${containerId}/logs`, ownerCookie)).statusCode).toBe(409);

    // Refresh returns the host unchanged and must not silently revive a disabled host.
    expect((await adminSend('POST', `/hosts/${hostId}/refresh`, ownerCookie)).statusCode).toBe(200);
    const reread = await adminGet(`/hosts/${hostId}`, ownerCookie);
    expect(reread.json<{ status: string }>().status).toBe('disabled');

    // Only an explicit enable restores operations.
    expect((await adminSend('POST', `/hosts/${hostId}/enable`, ownerCookie)).statusCode).toBe(200);
    expect((await adminSend('POST', `/hosts/${hostId}/sync`, ownerCookie)).statusCode).toBe(200);
  }, 30_000);

  it('refreshes the stored state of already-known containers on a later sync', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const before = await adminGet(`/containers/${containerId}`, ownerCookie);
    expect(before.statusCode).toBe(200);
    expect(before.json<{ container: { state: string } }>().container.state).toBe('running');

    // The engine now reports the container as exited.
    const fixtureContainer = fixture.containers[0];
    if (!fixtureContainer) throw new Error('Expected the fixture to expose a container.');
    fixtureContainer.state = 'exited';
    fixtureContainer.status = 'Exited (0) 1 second ago';
    const resync = await adminSend('POST', `/hosts/${hostId}/sync`, ownerCookie);
    expect(resync.statusCode).toBe(200);
    // No new containers were discovered; state is refreshed in place.
    expect(resync.json<{ synced: number }>().synced).toBe(0);

    const after = await adminGet(`/containers/${containerId}`, ownerCookie);
    expect(after.json<{ container: { state: string; status: string } }>().container.state).toBe(
      'exited',
    );
    expect(after.json<{ container: { status: string } }>().container.status).toBe(
      'Exited (0) 1 second ago',
    );
    // Still exactly one stored row: the update did not duplicate the container.
    expect(await client`SELECT id FROM containers`).toHaveLength(1);
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

describe('Docker insights surface', () => {
  it('reports organization-scoped summary counts', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const summary = await adminGet('/docker-summary', ownerCookie);
    expect(summary.statusCode).toBe(200);
    const body = summary.json<{
      summary: {
        hosts: number;
        healthyHosts: number;
        containers: number;
        runningContainers: number;
        stoppedContainers: number;
      };
    }>().summary;
    expect(body.hosts).toBe(1);
    expect(body.healthyHosts).toBe(1);
    expect(body.containers).toBe(1);
    expect(body.runningContainers).toBe(1);
    expect(body.stoppedContainers).toBe(0);
  }, 30_000);

  it('samples container stats for a synced container', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const response = await adminGet(`/containers/${containerId}/stats`, ownerCookie);
    expect(response.statusCode).toBe(200);
    const stats = response.json<{
      stats: { cpuPercent: number; memoryUsedBytes: number; networkRxBytes: number; pids: number };
    }>().stats;
    expect(stats.cpuPercent).toBeGreaterThan(0);
    expect(stats.memoryUsedBytes).toBe(100_000_000);
    expect(stats.networkRxBytes).toBe(1000);
    expect(stats.pids).toBe(7);
  }, 30_000);

  it('runs read-only host diagnostics and records an audit event', async () => {
    const hostId = await registerHost(ownerCookie);

    const response = await adminGet(`/hosts/${hostId}/diagnostics`, ownerCookie);
    expect(response.statusCode).toBe(200);
    const diagnostics = response.json<{
      diagnostics: { overall: string; checks: { id: string; severity: string }[] };
    }>().diagnostics;
    expect(diagnostics.overall).toBe('ok');
    expect(diagnostics.checks.map((check) => check.id)).toContain('engine_reachable');
    expect(await auditActions()).toContain('host.diagnosed');
  }, 30_000);

  it('lists host images and routes image removal through approval', async () => {
    const hostId = await registerHost(ownerCookie);
    const imageId = `sha256:${'a'.repeat(64)}`;

    const listing = await adminGet(`/hosts/${hostId}/images`, ownerCookie);
    expect(listing.statusCode).toBe(200);
    const images = listing.json<{
      images: { id: string; repoTags: string[]; sizeBytes: number }[];
    }>().images;
    expect(images).toHaveLength(1);
    expect(images[0]?.id).toBe(imageId);
    expect(images[0]?.repoTags).toContain('nginx:alpine');
    expect(images[0]?.sizeBytes).toBe(23_000_000);

    const request = await adminSend('DELETE', `/hosts/${hostId}/images`, ownerCookie, {
      imageId,
      justification: 'Reclaim unused image',
    });
    expect(request.statusCode).toBe(202);
    expect(fixture.removedImages).toHaveLength(0);

    const approvalId = request.json<{ approval: { id: string } }>().approval.id;
    const decision = await adminSend('POST', `/approvals/${approvalId}/decision`, ownerCookie, {
      decision: 'approve',
    });
    expect(decision.statusCode).toBe(200);
    expect(fixture.removedImages).toEqual([imageId]);
    expect(await auditActions()).toContain('image.removed');
  }, 30_000);

  it('exposes stats, diagnostics, images and summary through MCP tools', async () => {
    const hostId = await registerHost(ownerCookie);
    await syncHost(ownerCookie, hostId);

    const reader = await createCredential(app, ownerCookie, {
      name: 'insights-reader',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(reader.token);

    const stats = await callTool(mcpClient, 'dockpilot_get_container_stats', { containerId });
    expect(stats.isError).toBe(false);
    expect(stats.structuredContent?.stats !== undefined).toBe(true);

    const diagnostics = await callTool(mcpClient, 'dockpilot_run_host_diagnostics', { hostId });
    expect(diagnostics.isError).toBe(false);
    expect(asRecord(diagnostics.structuredContent?.diagnostics)?.overall).toBe('ok');

    const images = await callTool(mcpClient, 'dockpilot_list_images', { hostId });
    expect(images.isError).toBe(false);
    expect(asArray(images.structuredContent?.images)).toHaveLength(1);

    const summary = await callTool(mcpClient, 'dockpilot_docker_summary', {});
    expect(summary.isError).toBe(false);
    expect(summary.structuredContent?.hosts).toBe(1);
    expect(summary.structuredContent?.containers).toBe(1);

    const denied = await callTool(mcpClient, 'dockpilot_request_image_removal', {
      hostId,
      imageId: `sha256:${'a'.repeat(64)}`,
      justification: 'Reclaim an image',
    });
    expect(denied.isError).toBe(true);
    expect(denied.text).toContain('authorization');
  }, 30_000);

  it('creates a pending approval for an image removal request via MCP', async () => {
    const hostId = await registerHost(ownerCookie);
    const imageId = `sha256:${'a'.repeat(64)}`;

    const destructor = await createCredential(app, ownerCookie, {
      name: 'insights-destructor',
      permissionLevel: 'destructive',
    });
    const mcpClient = await connect(destructor.token);

    const request = await callTool(mcpClient, 'dockpilot_request_image_removal', {
      hostId,
      imageId,
      justification: 'Reclaim an image',
    });
    expect(request.isError).toBe(false);
    expect(request.structuredContent?.approvalRequired).toBe(true);
    expect(request.structuredContent?.targetType).toBe('image');
    expect(fixture.removedImages).toHaveLength(0);
  }, 30_000);

  it('lists host volumes and networks over REST', async () => {
    const hostId = await registerHost(ownerCookie);

    const volumes = await adminGet(`/hosts/${hostId}/volumes`, ownerCookie);
    expect(volumes.statusCode).toBe(200);
    const volumeList = volumes.json<{
      volumes: { name: string; driver: string; mountpoint: string; scope: string }[];
      nextCursor: string | null;
    }>();
    expect(volumeList.volumes).toHaveLength(1);
    expect(volumeList.volumes[0]).toMatchObject({
      name: 'fixture-data',
      driver: 'local',
      scope: 'local',
    });
    expect(volumeList.nextCursor).toBeNull();

    const networks = await adminGet(`/hosts/${hostId}/networks`, ownerCookie);
    expect(networks.statusCode).toBe(200);
    const networkList = networks.json<{
      networks: {
        id: string;
        name: string;
        driver: string;
        internal: boolean;
        containerCount: number;
      }[];
      nextCursor: string | null;
    }>();
    expect(networkList.networks).toHaveLength(1);
    expect(networkList.networks[0]?.name).toBe('fixture-bridge');
    expect(networkList.networks[0]?.driver).toBe('bridge');
    expect(networkList.networks[0]?.internal).toBe(false);
    expect(networkList.networks[0]?.containerCount).toBe(2);
  }, 30_000);

  it('keeps volume and network listings organization-scoped', async () => {
    const missing = 'b7ba6c0e-e4d6-4b2c-88ee-8a7384f43128';
    const volumes = await adminGet(`/hosts/${missing}/volumes`, ownerCookie);
    expect(volumes.statusCode).toBe(404);
    const networks = await adminGet(`/hosts/${missing}/networks`, ownerCookie);
    expect(networks.statusCode).toBe(404);
  }, 30_000);

  it('exposes volumes and networks through MCP read tools', async () => {
    const hostId = await registerHost(ownerCookie);

    const reader = await createCredential(app, ownerCookie, {
      name: 'topology-reader',
      permissionLevel: 'read',
    });
    const mcpClient = await connect(reader.token);

    const volumes = await callTool(mcpClient, 'dockpilot_list_volumes', { hostId });
    expect(volumes.isError).toBe(false);
    const listedVolumes = asArray(volumes.structuredContent?.volumes);
    expect(listedVolumes).toHaveLength(1);
    expect(asRecord(listedVolumes[0])?.name).toBe('fixture-data');

    const networks = await callTool(mcpClient, 'dockpilot_list_networks', { hostId });
    expect(networks.isError).toBe(false);
    const listedNetworks = asArray(networks.structuredContent?.networks);
    expect(listedNetworks).toHaveLength(1);
    expect(asRecord(listedNetworks[0])?.name).toBe('fixture-bridge');
  }, 30_000);
});

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  return { ...value };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
