import { and, desc, eq, inArray } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { hosts as hostsTable, containers as containersTable } from '../db/schema.js';
import {
  dockerVersion,
  parseDockerEndpoint,
  verifyDockerSocket,
  listContainers,
} from '../lib/docker.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { conflictError, internalError, notFoundError, validationError } from '../lib/errors.js';
import type { HostView, CreateHostInput, HostStatus, ContainerView } from '@dockpilot/shared';

interface HostRow {
  id: string;
  organizationId: string;
  createdByUserId: string | null;
  name: string;
  description: string | null;
  endpoint: string;
  status: HostStatus;
  lastErrorAt: Date | null;
  lastError: string | null;
  dockerVersion: string | null;
  labels: Record<string, string> | null;
  metadata: Record<string, unknown> | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const hostColumns = {
  id: hostsTable.id,
  organizationId: hostsTable.organizationId,
  createdByUserId: hostsTable.createdByUserId,
  name: hostsTable.name,
  description: hostsTable.description,
  endpoint: hostsTable.endpoint,
  status: hostsTable.status,
  lastErrorAt: hostsTable.lastErrorAt,
  lastError: hostsTable.lastError,
  dockerVersion: hostsTable.dockerVersion,
  labels: hostsTable.labels,
  metadata: hostsTable.metadata,
  lastSeenAt: hostsTable.lastSeenAt,
  createdAt: hostsTable.createdAt,
  updatedAt: hostsTable.updatedAt,
};

const containerColumns = {
  id: containersTable.id,
  organizationId: containersTable.organizationId,
  hostId: containersTable.hostId,
  containerId: containersTable.containerId,
  shortId: containersTable.shortId,
  name: containersTable.name,
  image: containersTable.image,
  state: containersTable.state,
  status: containersTable.status,
  created: containersTable.created,
  labels: containersTable.labels,
  ports: containersTable.ports,
  syncedAt: containersTable.syncedAt,
};

function toHostView(row: HostRow): HostView {
  return {
    id: row.id,
    organizationId: row.organizationId,
    createdByUserId: row.createdByUserId,
    name: row.name,
    description: row.description,
    endpoint: row.endpoint,
    status: row.status,
    lastErrorAt: row.lastErrorAt?.toISOString() ?? null,
    lastError: row.lastError,
    dockerVersion: row.dockerVersion,
    labels: row.labels,
    metadata: row.metadata,
    lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export interface CreateHostServiceInput extends CreateHostInput {
  organizationId: string;
  createdByUserId: string | null;
  executor?: DbExecutor;
}

export async function createHost(input: CreateHostServiceInput): Promise<{ host: HostView }> {
  const executor = input.executor ?? db;
  const endpoint = parseDockerEndpoint(input.endpoint);
  const version = await verifyDockerSocket(endpoint);
  const dockerVersionStr = `${version.Version}@${version.Arch}`;

  const inserted = await executor
    .insert(hostsTable)
    .values({
      organizationId: input.organizationId,
      createdByUserId: input.createdByUserId,
      name: input.name,
      description: input.description ?? null,
      endpoint: input.endpoint,
      status: 'healthy',
      dockerVersion: dockerVersionStr,
      labels: input.labels ?? null,
      metadata: input.metadata ?? null,
      lastSeenAt: new Date(),
    })
    .returning(hostColumns);

  const row = inserted[0];
  if (!row) throw internalError('Host creation failed.');

  return { host: toHostView(row) };
}

export interface ListHostsInput {
  organizationId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listHosts(
  input: ListHostsInput,
): Promise<{ hosts: HostView[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const rows = await executor
    .select(hostColumns)
    .from(hostsTable)
    .where(
      and(
        eq(hostsTable.organizationId, input.organizationId),
        keysetAfter(hostsTable.createdAt, hostsTable.id, cursor),
      ),
    )
    .orderBy(desc(hostsTable.createdAt), desc(hostsTable.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    hosts: page.map(toHostView),
    nextCursor: overflow && last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
  };
}

export async function getHost(input: {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}): Promise<HostView> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select(hostColumns)
    .from(hostsTable)
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw notFoundError('The host does not exist.');
  return toHostView(row);
}

export interface UpdateHostInput {
  organizationId: string;
  hostId: string;
  name?: string;
  description?: string | null;
  endpoint?: string;
  labels?: Record<string, string> | null;
  metadata?: Record<string, unknown> | null;
  executor?: DbExecutor;
}

export async function updateHost(input: UpdateHostInput): Promise<HostView> {
  const executor = input.executor ?? db;
  const patch: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.labels !== undefined) patch.labels = input.labels;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  if (input.endpoint !== undefined) {
    const parsedEndpoint = parseDockerEndpoint(input.endpoint);
    const version = await verifyDockerSocket(parsedEndpoint);
    patch.endpoint = input.endpoint;
    patch.dockerVersion = `${version.Version}@${version.Arch}`;
    patch.status = 'healthy';
    patch.lastErrorAt = null;
    patch.lastError = null;
  }

  const updated = await executor
    .update(hostsTable)
    .set(patch)
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    )
    .returning(hostColumns);

  const row = updated[0];
  if (!row) throw notFoundError('The host does not exist.');
  return toHostView(row);
}

export interface DisableHostInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function disableHost(input: DisableHostInput): Promise<HostView> {
  const executor = input.executor ?? db;
  const updated = await executor
    .update(hostsTable)
    .set({ status: 'disabled', updatedAt: new Date() })
    .where(
      and(
        eq(hostsTable.id, input.hostId),
        eq(hostsTable.organizationId, input.organizationId),
        eq(hostsTable.status, 'healthy'),
      ),
    )
    .returning(hostColumns);

  const row = updated[0];
  if (!row) throw notFoundError('The host does not exist or is not healthy.');
  return toHostView(row);
}

export interface EnableHostInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function enableHost(input: EnableHostInput): Promise<HostView> {
  const executor = input.executor ?? db;
  const updated = await executor
    .update(hostsTable)
    .set({ status: 'healthy', updatedAt: new Date() })
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    )
    .returning(hostColumns);

  const row = updated[0];
  if (!row) throw notFoundError('The host does not exist.');
  return toHostView(row);
}

export interface RemoveHostInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function removeHost(input: RemoveHostInput): Promise<void> {
  const executor = input.executor ?? db;
  const existing = await executor
    .select({ id: hostsTable.id })
    .from(hostsTable)
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    )
    .limit(1);
  if (!existing[0]) throw notFoundError('The host does not exist.');
  await executor
    .delete(hostsTable)
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    );
}

export async function hostExists(input: {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}): Promise<boolean> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select({ id: hostsTable.id })
    .from(hostsTable)
    .where(
      and(eq(hostsTable.id, input.hostId), eq(hostsTable.organizationId, input.organizationId)),
    )
    .limit(1);
  return rows.length > 0;
}

/**
 * Loads a host and refuses it when an administrator has disabled it, so disabling a host
 * also suspends every Docker operation that would otherwise reach the engine through it.
 */
export async function getOperableHost(input: {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}): Promise<HostView> {
  const host = await getHost(input);
  if (host.status === 'disabled') {
    throw conflictError(`Host ${host.name} is disabled. Enable it before running Docker actions.`);
  }
  return host;
}

export interface RefreshHostInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function refreshHost(input: RefreshHostInput): Promise<HostView> {
  const executor = input.executor ?? db;
  const host = await getHost({ ...input, executor });

  // A disabled host stays disabled until an administrator explicitly enables it, even if the
  // Docker engine answers a probe.
  if (host.status === 'disabled') return host;

  const endpoint = parseDockerEndpoint(host.endpoint);

  try {
    await verifyDockerSocket(endpoint);
    const version = await dockerVersion(endpoint);
    const dockerVersionStr = `${version.Version}@${version.Arch}`;
    await executor
      .update(hostsTable)
      .set({
        status: 'healthy',
        dockerVersion: dockerVersionStr,
        lastSeenAt: new Date(),
        lastErrorAt: null,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(hostsTable.id, host.id));
  } catch (error) {
    const lastError = error instanceof Error ? error.message : 'Docker engine unreachable';
    await executor
      .update(hostsTable)
      .set({
        status: 'error',
        lastErrorAt: new Date(),
        lastError: lastError.slice(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(hostsTable.id, host.id));
  }

  return await getHost({ ...input, executor });
}

export interface SyncHostContainersInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function syncHostContainers(
  input: SyncHostContainersInput,
): Promise<{ synced: number }> {
  const executor = input.executor ?? db;
  const host = await getOperableHost(input);

  const endpoint = parseDockerEndpoint(host.endpoint);
  const dockerContainers = await listContainers(endpoint, true);

  const existingContainers = await executor
    .select({ id: containersTable.id, containerId: containersTable.containerId })
    .from(hostsTable)
    .innerJoin(
      containersTable,
      and(
        eq(containersTable.hostId, hostsTable.id),
        eq(containersTable.organizationId, hostsTable.organizationId),
      ),
    )
    .where(eq(hostsTable.id, input.hostId));

  const existingMap = new Map(existingContainers.map((c) => [c.containerId, c.id]));

  const newContainers: (typeof containersTable.$inferInsert)[] = [];
  const now = new Date();

  for (const dc of dockerContainers) {
    const firstName = dc.Names[0];
    const shortId = firstName ? firstName.slice(1) : null;
    const name = firstName && firstName !== '/' ? firstName : null;
    const fields = {
      name,
      image: dc.Image,
      state: dc.State as
        'created' | 'running' | 'paused' | 'restarting' | 'removing' | 'exited' | 'dead',
      status: dc.Status,
      created: dc.Created.toString(),
      labels: dc.Labels,
      ports: dc.Ports,
      syncedAt: now,
    };

    const existingId = existingMap.get(dc.Id);
    if (existingId) {
      // Refresh the stored state for a container DockPilot already knows about so a
      // re-sync reports the engine's current state instead of the first-seen state.
      await executor.update(containersTable).set(fields).where(eq(containersTable.id, existingId));
      existingMap.delete(dc.Id);
      continue;
    }

    newContainers.push({
      organizationId: input.organizationId,
      hostId: input.hostId,
      containerId: dc.Id,
      shortId: shortId ? shortId.slice(0, 12) : null,
      ...fields,
    });
  }

  if (newContainers.length > 0) {
    await executor.insert(containersTable).values(newContainers);
  }

  if (existingMap.size > 0) {
    const deletedIds = Array.from(existingMap.values());
    await executor
      .delete(containersTable)
      .where(
        and(eq(containersTable.hostId, input.hostId), inArray(containersTable.id, deletedIds)),
      );
  }

  return { synced: newContainers.length };
}

export interface ListHostContainersInput {
  organizationId: string;
  hostId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listHostContainers(
  input: ListHostContainersInput,
): Promise<{ containers: ContainerView[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const rows = await executor
    .select(containerColumns)
    .from(containersTable)
    .where(
      and(
        eq(containersTable.hostId, input.hostId),
        eq(containersTable.organizationId, input.organizationId),
        keysetAfter(containersTable.syncedAt, containersTable.id, cursor),
      ),
    )
    .orderBy(desc(containersTable.syncedAt), desc(containersTable.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const overflow = rows.length > input.limit;
  const last = overflow ? page[page.length - 1] : null;

  return {
    containers: page.map(toContainerView),
    nextCursor: last ? encodeCursor([last.syncedAt.toISOString(), last.id]) : null,
  };
}

function toContainerView(row: typeof containersTable.$inferSelect): ContainerView {
  return {
    id: row.id,
    hostId: row.hostId,
    containerId: row.containerId,
    shortId: row.shortId,
    name: row.name,
    image: row.image,
    state: row.state,
    status: row.status ?? 'unknown',
    created: row.created ?? '',
    labels: row.labels,
    ports: row.ports,
    syncedAt: row.syncedAt.toISOString(),
  };
}
