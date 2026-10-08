import { and, desc, eq } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { containers as containersTable } from '../db/schema.js';
import {
  parseDockerEndpoint,
  startContainer as dockerStartContainer,
  stopContainer as dockerStopContainer,
  restartContainer as dockerRestartContainer,
  removeContainer as dockerRemoveContainer,
  containerLogs,
} from '../lib/docker.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { notFoundError, validationError } from '../lib/errors.js';
import { getHost } from './hosts.js';
import type { ContainerView, ContainerLogView } from '@dockpilot/shared';

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

function toContainerLogView(log: string, tty: boolean, tail: number): ContainerLogView {
  return { log, tty, tail };
}

export interface ListContainersInput {
  organizationId: string;
  hostId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listContainers(
  input: ListContainersInput,
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
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    containers: page.map(toContainerView),
    nextCursor: overflow && last ? encodeCursor([last.syncedAt.toISOString(), last.id]) : null,
  };
}

export async function getContainer(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<ContainerView> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select(containerColumns)
    .from(containersTable)
    .where(
      and(
        eq(containersTable.containerId, input.containerId),
        eq(containersTable.organizationId, input.organizationId),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw notFoundError('The container does not exist.');
  return toContainerView(row);
}

export interface ContainerLogInput {
  organizationId: string;
  containerId: string;
  tail?: number;
  executor?: DbExecutor;
}

export async function containerLog(input: ContainerLogInput): Promise<ContainerLogView> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });

  const host = await getHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);
  const tail = input.tail ?? 100;
  const log = await containerLogs(endpoint, container.containerId, tail);
  return toContainerLogView(log, false, tail);
}

export async function startContainer(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });

  const host = await getHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerStartContainer(endpoint, container.containerId);
}

export async function stopContainer(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });

  const host = await getHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerStopContainer(endpoint, container.containerId);
}

export async function restartContainer(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });

  const host = await getHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerRestartContainer(endpoint, container.containerId);
}

export async function removeContainer(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });

  const host = await getHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerRemoveContainer(endpoint, container.containerId);
  await executor
    .delete(containersTable)
    .where(
      and(
        eq(containersTable.id, container.id),
        eq(containersTable.organizationId, input.organizationId),
      ),
    );
}
