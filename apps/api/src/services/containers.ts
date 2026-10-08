import { and, desc, eq, isNull, inArray, gte, lte } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { containers as containersTable, hosts as hostsTable } from '../db/schema.js';
import { dockerVersion, parseDockerEndpoint, verifyDockerSocket, startContainer as dockerStartContainer, stopContainer as dockerStopContainer, restartContainer as dockerRestartContainer, removeContainer as dockerRemoveContainer, ContainerInspect, DockerConnectionError, DockerApiError } from '../lib/docker.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { conflictError, notFoundError, validationError, internalError } from '../lib/errors.js';
import { writeAuditEvent } from '../lib/audit.js';
import { getHost } from './hosts.js';
import type {
  HostView,
  ContainerView,
  ContainerLogView,
} from '@dockpilot/shared';

interface ContainerRow {
  id: string;
  organizationId: string;
  hostId: string;
  containerId: string;
  shortId: string | null;
  name: string | null;
  image: string;
  state: string;
  status: string;
  created: string;
  labels: Record<string, string> | null;
  ports: unknown[] | null;
  syncedAt: Date;
}

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

function toContainerView(row: ContainerRow): ContainerView {
  return {
    id: row.id,
    hostId: row.hostId,
    containerId: row.containerId,
    shortId: row.shortId,
    name: row.name,
    image: row.image,
    state: row.state as any,
    status: row.status,
    created: row.created,
    labels: row.labels,
    ports: row.ports,
    syncedAt: row.syncedAt.toISOString(),
  };
}

function toContainerLogView(log: string, tty: boolean, tail: number): ContainerLogView {
  return {
    log,
    tty,
    tail: tail,
  };
}

export interface SyncHostContainersInput {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}

export async function syncHostContainers(input: SyncHostContainersInput): Promise<{ synced: number }> {
  const executor = input.executor ?? db;
  const host = await getHost({ organizationId: input.organizationId, hostId: input.hostId, executor });

  const endpoint = parseDockerEndpoint(host.endpoint);
  const dockerContainers = await listContainers(endpoint, true);

  const existingContainers = await executor
    .select({ id: containersTable.id, containerId: containersTable.containerId })
    .from(hostsTable)
    .innerJoin(
      containersTable,
      and(eq(containersTable.hostId, hostsTable.id), eq(containersTable.organizationId, hostsTable.organizationId)),
    )
    .where(eq(hostsTable.id, input.hostId));

  const existingMap = new Map(existingContainers.map((c) => [c.containerId, c.id]));

  const newContainers: typeof containersTable.$inferInsert[] = [];

  for (const dc of dockerContainers) {
    const existingId = existingMap.get(dc.Id);
    if (existingId) {
      existingMap.delete(dc.Id);
      continue;
    }
    const shortId = dc.Names && dc.Names.length > 0 ? dc.Names[0].slice(1) : null;
    newContainers.push({
      organizationId: input.organizationId,
      hostId: input.hostId,
      containerId: dc.Id,
      shortId: shortId?.slice(0, 12) ?? null,
      name: dc.Name && dc.Name !== '/' ? dc.Name : null,
      image: dc.Image,
      state: dc.State as any,
      status: dc.Status,
      created: dc.Created.toString(),
      labels: dc.Labels ?? null,
      ports: dc.Ports ?? null,
      syncedAt: new Date(),
    });
  }

  if (newContainers.length > 0) {
    await executor.insert(containersTable).values(newContainers);
  }

  if (existingMap.size > 0) {
    const deletedIds = Array.from(existingMap.values());
    await executor.delete(containersTable).where(
      and(
        eq(containersTable.hostId, input.hostId),
        inArray(containersTable.id, deletedIds),
      ),
    );
  }

  return { synced: newContainers.length };
}

export interface ListContainersInput {
  organizationId: string;
  hostId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listContainers(input: ListContainersInput): Promise<{ containers: ContainerView[]; nextCursor: string | null }> {
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
  const container = await getContainer(input, executor);

  const host = await getHost({ organizationId: input.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);
  const ttyFlag = await getContainerTty(endpoint, container.containerId);
  const tail = input.tail ?? 100;
  const log = await fetchContainerLog(endpoint, container.containerId, ttyFlag, tail);
  return toContainerLogView(log, ttyFlag, tail);
}

async function getContainerTty(endpoint: DockerEndpoint, containerId: string): Promise<boolean> {
  const inspect = await inspectContainer(endpoint, containerId);
  return inspect.Config.Tty === true;
}

async function fetchContainerLog(
  endpoint: DockerEndpoint,
  containerId: string,
  isTty: boolean,
  tail: number,
): Promise<string> {
  const raw = await fetchContainerLogRaw(endpoint, containerId, tail);
  return demuxLogBuffer(raw, isTty);
}

async function fetchContainerLogRaw(
  endpoint: DockerEndpoint,
  containerId: string,
  tail: number,
): Promise<Buffer> {
  const controller = new AbortController();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  const params = new URLSearchParams({
    stdout: '1',
    stderr: '1',
    tail: String(tail),
  });

  const options: http.RequestOptions = {
    socketPath: endpoint.socketPath,
    method: 'GET',
    path: `/containers/${containerId}/logs?${params.toString()}`,
    headers: { Accept: 'application/json' },
    timeout: DOCKER_REQUEST_TIMEOUT_MS,
    signal: controller.signal,
  };

  const req = http.request(options, (res) => {
    res.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes > DOCKER_MAX_LOG_BYTES) {
        req.destroy();
        controller.abort();
        throw new DockerApiError(500, 'Container logs exceed maximum allowed size.');
      }
      chunks.push(chunk);
    });

    res.on('end', () => {});
    res.on('error', (err) => {
      req.destroy();
      controller.abort();
    });
  });

  req.on('error', (err: NodeJS.ErrnoException) => {
    req.destroy();
    controller.abort();
  });

  req.end();

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      controller.abort();
      req.destroy();
    };

    const finishHandler = () => resolve();
    const errorHandler = (err: Error) => reject(err);

    req.once('response', finishHandler);
    req.once('error', errorHandler);
  });

  return Buffer.concat(chunks);
}

function demuxLogBuffer(buffer: Buffer, isTty: boolean): string {
  if (isTty) {
    return buffer.toString('utf8');
  }

  let offset = 0;
  let output = '';
  const maxFrames = 10000;

  while (offset + 8 <= buffer.length && output.length < DOCKER_MAX_LOG_BYTES && output.split('\n').length < maxFrames) {
    const stream = buffer[offset];
    const size = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + size > buffer.length) break;

    const chunk = buffer.toString('utf8', offset, offset + size);
    output += chunk;
    offset += size;
  }

  return output;
}

export async function startContainer(
  input: {
    organizationId: string;
    containerId: string;
    executor?: DbExecutor;
  }
): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer(input, executor);

  const host = await getHost({ organizationId: input.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerStartContainer(endpoint, container.containerId);
  await updateContainerStateAfterOperation(executor, container.containerId, 'running');
}

export async function stopContainer(
  input: {
    organizationId: string;
    containerId: string;
    executor?: DbExecutor;
  }
): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer(input, executor);

  const host = await getHost({ organizationId: input.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerStopContainer(endpoint, container.containerId);
  await updateContainerStateAfterOperation(executor, container.containerId, 'exited');
}

export async function restartContainer(
  input: {
    organizationId: string;
    containerId: string;
    executor?: DbExecutor;
  }
): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer(input, executor);

  const host = await getHost({ organizationId: input.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerRestartContainer(endpoint, container.containerId);
  await updateContainerStateAfterOperation(executor, container.containerId, 'running');
}

export async function removeContainer(
  input: {
    organizationId: string;
    containerId: string;
    executor?: DbExecutor;
  }
): Promise<void> {
  const executor = input.executor ?? db;
  const container = await getContainer(input, executor);

  const host = await getHost({ organizationId: input.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);

  await dockerRemoveContainer(endpoint, container.containerId);
  await executor.delete(containersTable).where(
    and(
      eq(containersTable.id, container.id),
      eq(containersTable.organizationId, input.organizationId),
    ),
  );
}

async function updateContainerStateAfterOperation(
  executor: DbExecutor,
  containerId: string,
  state: 'running' | 'exited',
): Promise<void> {
  const container = await getContainer({ organizationId: '', containerId, executor });
  const host = await getHost({ organizationId: container.organizationId, hostId: container.hostId, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);
  const inspect = await inspectContainer(endpoint, containerId);

  const newState = inspect.State.Status as string;
  const newStatus = inspect.State.Status === 'running' ? 'Up' : inspect.State.Status;

  await executor
    .update(containersTable)
    .set({
      state: newState as any,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(containersTable.id, container.id));
}