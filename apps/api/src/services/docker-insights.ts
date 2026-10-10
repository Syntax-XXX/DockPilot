import { count, eq, max } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { containers as containersTable, hosts as hostsTable } from '../db/schema.js';
import {
  parseDockerEndpoint,
  containerStats as dockerContainerStats,
  listContainers as dockerListContainers,
  listImages as dockerListImages,
  removeImage as dockerRemoveImage,
  systemInfo as dockerSystemInfo,
  verifyDockerSocket,
} from '../lib/docker.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { validationError } from '../lib/errors.js';
import { getOperableHost } from './hosts.js';
import { getContainer } from './containers.js';
import type {
  ContainerStats,
  DiagnosticCheck,
  DiagnosticSeverity,
  DockerSummary,
  HostDiagnostics,
  ImageView,
} from '@dockpilot/shared';

const severityRank: Record<DiagnosticSeverity, number> = {
  ok: 0,
  info: 1,
  warning: 2,
  critical: 3,
};

/** Health is driven by actionable findings; informational notes do not change the overall status. */
function worstSeverity(checks: DiagnosticCheck[]): DiagnosticSeverity {
  return checks.reduce<DiagnosticSeverity>((worst, check) => {
    if (check.severity === 'info') return worst;
    return severityRank[check.severity] > severityRank[worst] ? check.severity : worst;
  }, 'ok');
}

function isDanglingImage(image: { RepoTags?: string[] | null }): boolean {
  const tags = (image.RepoTags ?? []).filter((tag) => tag !== '<none>:<none>');
  return tags.length === 0;
}

function toImageView(image: {
  Id: string;
  RepoTags?: string[] | null;
  RepoDigests?: string[] | null;
  Size: number;
  Created: number;
  Containers?: number;
}): ImageView {
  const repoTags = (image.RepoTags ?? []).filter((tag) => tag !== '<none>:<none>');
  return {
    id: image.Id,
    repoDigests: image.RepoDigests ?? [],
    repoTags,
    sizeBytes: image.Size,
    sharedSizeBytes: 0,
    containerCount: image.Containers ?? 0,
    dangling: isDanglingImage(image),
    createdAt: new Date(image.Created * 1000).toISOString(),
  };
}

export async function containerStats(input: {
  organizationId: string;
  containerId: string;
  executor?: DbExecutor;
}): Promise<{ container: { name: string | null; containerId: string }; stats: ContainerStats }> {
  const executor = input.executor ?? db;
  const container = await getContainer({ ...input, executor });
  const host = await getOperableHost({
    organizationId: input.organizationId,
    hostId: container.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);
  const stats = await dockerContainerStats(endpoint, container.containerId);
  return {
    container: { name: container.name, containerId: container.containerId },
    stats: {
      cpuPercent: stats.cpuPercent,
      memoryUsedBytes: stats.memory.usedBytes,
      memoryLimitBytes: stats.memory.limitBytes,
      memoryPercent: stats.memory.percent,
      networkRxBytes: stats.network.rxBytes,
      networkTxBytes: stats.network.txBytes,
      blockReadBytes: stats.blockIo.readBytes,
      blockWriteBytes: stats.blockIo.writeBytes,
      pids: stats.pids,
      capturedAt: new Date().toISOString(),
    },
  };
}

export async function runHostDiagnostics(input: {
  organizationId: string;
  hostId: string;
  executor?: DbExecutor;
}): Promise<HostDiagnostics> {
  const executor = input.executor ?? db;
  const host = await getOperableHost({ ...input, executor });
  const endpoint = parseDockerEndpoint(host.endpoint);

  const checks: DiagnosticCheck[] = [];

  let engineReachable = false;
  try {
    const version = await verifyDockerSocket(endpoint);
    engineReachable = true;
    checks.push({
      id: 'engine_reachable',
      title: 'Docker engine reachable',
      severity: 'ok',
      summary: `Engine answered with API version ${version.ApiVersion}.`,
      detail: `${version.Os}/${version.Arch} running Docker ${version.Version}.`,
    });
  } catch (error) {
    checks.push({
      id: 'engine_reachable',
      title: 'Docker engine reachable',
      severity: 'critical',
      summary: 'The Docker engine did not answer on the configured socket.',
      detail: error instanceof Error ? error.message : null,
    });
  }

  const [containersResult, imagesResult, infoResult] = await Promise.allSettled([
    dockerListContainers(endpoint, true),
    dockerListImages(endpoint, true),
    dockerSystemInfo(endpoint),
  ]);

  if (containersResult.status === 'fulfilled') {
    const containers = containersResult.value;
    const stopped = containers.filter(
      (container) => container.State === 'exited' || container.State === 'dead',
    );
    const restarting = containers.filter((container) => container.State === 'restarting');
    const unhealthy = containers.filter((container) => container.State === 'paused');

    checks.push({
      id: 'stopped_containers',
      title: 'Stopped containers',
      severity: stopped.length > 0 ? 'warning' : 'ok',
      summary:
        stopped.length > 0
          ? `${String(stopped.length)} container(s) are stopped.`
          : 'No stopped containers were found.',
      detail:
        stopped.length > 0
          ? stopped
              .slice(0, 10)
              .map((container) => container.Names[0] ?? container.Id.slice(0, 12))
              .join(', ')
          : null,
    });
    checks.push({
      id: 'restart_loops',
      title: 'Restart loops',
      severity: restarting.length > 0 ? 'warning' : 'ok',
      summary:
        restarting.length > 0
          ? `${String(restarting.length)} container(s) are restarting repeatedly.`
          : 'No containers are stuck restarting.',
      detail:
        restarting.length > 0
          ? restarting
              .map((container) => container.Names[0] ?? container.Id.slice(0, 12))
              .join(', ')
          : null,
    });
    checks.push({
      id: 'paused_containers',
      title: 'Paused containers',
      severity: unhealthy.length > 0 ? 'info' : 'ok',
      summary:
        unhealthy.length > 0
          ? `${String(unhealthy.length)} container(s) are paused.`
          : 'No paused containers were found.',
      detail: null,
    });
  } else {
    checks.push({
      id: 'stopped_containers',
      title: 'Container inventory',
      severity: 'warning',
      summary: 'The container list could not be read from the engine.',
      detail: containersResult.reason instanceof Error ? containersResult.reason.message : null,
    });
  }

  if (imagesResult.status === 'fulfilled') {
    const images = imagesResult.value;
    const dangling = images.filter((image) => isDanglingImage(image));
    checks.push({
      id: 'dangling_images',
      title: 'Dangling images',
      severity: dangling.length > 0 ? 'info' : 'ok',
      summary:
        dangling.length > 0
          ? `${String(dangling.length)} dangling image(s) can be reclaimed.`
          : 'No dangling images were found.',
      detail: null,
    });
  } else {
    checks.push({
      id: 'dangling_images',
      title: 'Image inventory',
      severity: 'info',
      summary: 'The image list could not be read from the engine.',
      detail: imagesResult.reason instanceof Error ? imagesResult.reason.message : null,
    });
  }

  if (infoResult.status === 'fulfilled') {
    const info = infoResult.value;
    const storageDriver = typeof info.Driver === 'string' ? info.Driver : 'unknown';
    const rootDir = typeof info.DockerRootDir === 'string' ? info.DockerRootDir : 'unknown';
    checks.push({
      id: 'storage',
      title: 'Storage driver',
      severity: 'info',
      summary: `Storage driver: ${storageDriver}.`,
      detail: `Docker root directory: ${rootDir}.`,
    });
  }

  if (host.status === 'error' && host.lastError !== null) {
    checks.push({
      id: 'last_error',
      title: 'Last recorded error',
      severity: 'warning',
      summary: 'DockPilot recorded a recent error for this host.',
      detail: host.lastError,
    });
  }

  return {
    hostId: host.id,
    hostName: host.name,
    overall: engineReachable ? worstSeverity(checks) : 'critical',
    checkedAt: new Date().toISOString(),
    checks,
  };
}

export interface ListImagesInput {
  organizationId: string;
  hostId: string;
  limit: number;
  cursor?: string | undefined;
  danglingOnly?: boolean;
  executor?: DbExecutor;
}

export async function listImages(
  input: ListImagesInput,
): Promise<{ images: ImageView[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const host = await getOperableHost({
    organizationId: input.organizationId,
    hostId: input.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);
  const raw = await dockerListImages(endpoint, true);
  const views = raw
    .map(toImageView)
    .filter((image) => (input.danglingOnly === true ? image.dangling : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const startIndex = cursor ? Math.max(0, Number(cursor[0]) || 0) : 0;
  const slice = views.slice(startIndex, startIndex + input.limit);
  const nextIndex = startIndex + input.limit;

  return {
    images: slice,
    nextCursor: nextIndex < views.length ? encodeCursor([String(nextIndex), 'image']) : null,
  };
}

export async function removeImageOnHost(input: {
  organizationId: string;
  hostId: string;
  imageId: string;
  executor?: DbExecutor;
}): Promise<void> {
  const executor = input.executor ?? db;
  const host = await getOperableHost({
    organizationId: input.organizationId,
    hostId: input.hostId,
    executor,
  });
  const endpoint = parseDockerEndpoint(host.endpoint);
  await dockerRemoveImage(endpoint, input.imageId);
}

export async function getDockerSummary(input: {
  organizationId: string;
  executor?: DbExecutor;
}): Promise<DockerSummary> {
  const executor = input.executor ?? db;

  const hostCounts = await executor
    .select({ status: hostsTable.status, total: count() })
    .from(hostsTable)
    .where(eq(hostsTable.organizationId, input.organizationId))
    .groupBy(hostsTable.status);

  const hostTotal = hostCounts.reduce((sum, row) => sum + row.total, 0);
  const byStatus = new Map(hostCounts.map((row) => [row.status, row.total]));

  const containerRows = await executor
    .select({ state: containersTable.state, total: count() })
    .from(containersTable)
    .where(eq(containersTable.organizationId, input.organizationId))
    .groupBy(containersTable.state);

  const containerTotal = containerRows.reduce((sum, row) => sum + row.total, 0);
  const running = containerRows
    .filter(
      (row) => row.state === 'running' || row.state === 'restarting' || row.state === 'paused',
    )
    .reduce((sum, row) => sum + row.total, 0);

  const lastSyncRows = await executor
    .select({ lastSyncedAt: max(containersTable.syncedAt) })
    .from(containersTable)
    .where(eq(containersTable.organizationId, input.organizationId));
  const lastSyncedAt = lastSyncRows[0]?.lastSyncedAt ?? null;

  return {
    hosts: hostTotal,
    healthyHosts: byStatus.get('healthy') ?? 0,
    errorHosts: byStatus.get('error') ?? 0,
    disabledHosts: byStatus.get('disabled') ?? 0,
    containers: containerTotal,
    runningContainers: running,
    stoppedContainers: containerTotal - running,
    lastSyncedAt:
      lastSyncedAt instanceof Date
        ? lastSyncedAt.toISOString()
        : typeof lastSyncedAt === 'string'
          ? lastSyncedAt
          : null,
  };
}
