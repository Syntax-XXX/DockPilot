import http from 'node:http';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DOCKER_DEFAULT_ALLOWLIST = ['/var/run/docker.sock', '/run/docker.sock'];
const DOCKER_REQUEST_TIMEOUT_MS = 5000;
const DOCKER_MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const DOCKER_MAX_LOG_BYTES = 256 * 1024;

export interface DockerEndpoint {
  kind: 'unix';
  socketPath: string;
}

export interface DockerVersion {
  Version: string;
  ApiVersion: string;
  GitCommit: string;
  Os: string;
  Arch: string;
  KernelVersion: string;
  BuildTime: string;
  Experimental: boolean;
}

export interface ContainerSummary {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  State: string;
  Status: string;
  Created: number;
  Ports: unknown[];
  Labels: Record<string, string>;
  HostConfig: { AutoRestart: boolean };
}

export interface ContainerInspect {
  Id: string;
  Name: string;
  Image: string;
  ImageID: string;
  Created: string;
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    OOMKilled: boolean;
    Dead: boolean;
    Pid: number;
    ExitCode: number | null;
    Error: string;
    StartedAt: string;
    FinishedAt: string;
    Health:
      | {
          Status: string;
          FailingStreak: number;
          Log: unknown[];
        }
      | null;
  };
  Config: {
    Tty: boolean;
    Env: string[];
    Cmd: string[];
    Entrypoint: string[];
    Image: string;
    Labels: Record<string, string>;
  };
  HostConfig: {
    NetworkMode: string;
    PortBindings: Record<string, unknown[]>;
    Binds: string[];
    LogConfig: { Type: string; Config: Record<string, string> };
  };
  NetworkSettings: { Ports: Record<string, unknown[]> };
  Sysctl: Record<string, string>;
  Labels: Record<string, string>;
}

export type ContainerState =
  | 'created'
  | 'running'
  | 'paused'
  | 'restarting'
  | 'removing'
  | 'exited'
  | 'dead'
  | 'unknown';

export type HostStatus = 'healthy' | 'unhealthy' | 'disabled' | 'error';

const allowedSocketsEnv = process.env.DOCKPILOT_DOCKER_SOCKETS;
const allowedSocketPaths: string[] =
  allowedSocketsEnv?.split(',').map((s) => s.trim()).filter(Boolean) ?? DOCKER_DEFAULT_ALLOWLIST;

let normalizedAllowedPaths: string[] | null = null;

function normalizeAllowedPaths(): string[] {
  if (normalizedAllowedPaths !== null) return normalizedAllowedPaths;
  const resolved = new Set<string>();
  for (const p of allowedSocketPaths) {
    try {
      const r = path.resolve(p);
      resolved.add(r);
      if (fs.existsSync(r) && fs.statSync(r).isDirectory()) {
        for (const entry of fs.readdirSync(r, { withFileTypes: true })) {
          if (entry.isFile()) resolved.add(path.resolve(path.join(r, entry.name)));
        }
      }
    } catch {
      // ignore invalid paths
    }
  }
  normalizedAllowedPaths = [...resolved];
  return normalizedAllowedPaths;
}

const DOCKER_ENDPOINT_PATTERN = /^unix:\/\/(\/[^?#]+)$/u;

export class DockerEndpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DockerEndpointError';
  }
}

export class DockerConnectionError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'DockerConnectionError';
    if (cause !== undefined) this.cause = cause;
  }
}

export class DockerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = 'DockerApiError';
  }
}

export function parseDockerEndpoint(input: string): DockerEndpoint {
  const trimmed = input.trim();
  const match = DOCKER_ENDPOINT_PATTERN.exec(trimmed);
  if (!match || !match[1]) {
    throw new DockerEndpointError('Only unix:// Docker endpoints are supported for host registration.');
  }
  const socketPath = path.resolve(match[1]);
  const normalized = normalizeAllowedPaths();
  const isAllowed = normalized.some((allowed) => allowed === socketPath || socketPath.startsWith(allowed + '/'));
  if (!isAllowed) {
    throw new DockerEndpointError(
      `Docker socket path is not in the operator allowlist. Allowed paths: ${normalized.join(', ')}`,
    );
  }
  return { kind: 'unix', socketPath };
}

async function dockerRequest<T>(
  endpoint: DockerEndpoint,
  method: string,
  requestPath: string,
  body?: string,
  timeoutMs = DOCKER_REQUEST_TIMEOUT_MS,
): Promise<{ status: number; body: T; rawBody: string; headers: http.IncomingHttpHeaders }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let req: http.ClientRequest | null = null;
  let resolvePromise: (value: { status: number; body: T; rawBody: string; headers: http.IncomingHttpHeaders }) => void;
  let rejectPromise: (reason: Error) => void;
  const promise = new Promise<{ status: number; body: T; rawBody: string; headers: http.IncomingHttpHeaders }>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  try {
    const options: http.RequestOptions = {
      socketPath: endpoint.socketPath,
      method,
      path: requestPath,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      timeout: timeoutMs,
    };

    req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      res.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes > DOCKER_MAX_RESPONSE_BYTES) {
          res.destroy();
          rejectPromise(new DockerApiError(res.statusCode ?? 500, 'Docker response exceeded the allowed size.'));
          return;
        }
        chunks.push(chunk);
      });

      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        const status = res.statusCode ?? 500;

        if (status >= 400) {
          let errorMsg = 'Unknown Docker error';
          try {
            const errBody = JSON.parse(rawBody || '{}');
            if (typeof errBody?.message === 'string') errorMsg = errBody.message;
          } catch {
            // ignore parse errors
          }
          resolvePromise({ status, body: ({} as unknown) as T, rawBody, headers: res.headers });
          return;
        }

        let parsedBody: T;
        if (rawBody.trim() === '') {
          parsedBody = {} as T;
        } else {
          try {
            parsedBody = JSON.parse(rawBody) as T;
          } catch {
            parsedBody = (rawBody as unknown) as T;
          }
        }

        resolvePromise({ status, body: parsedBody, rawBody, headers: res.headers });
      });

      res.on('error', (err) => {
        rejectPromise(err);
      });
    });

    req.on('error', (err) => {
      rejectPromise(err);
    });

    if (body !== undefined) {
      req.write(body);
    }
    req.end();

    return await promise;
  } finally {
    clearTimeout(timeout);
    if (req && !req.finished) {
      req.destroy();
    }
  }
}

export async function dockerVersion(endpoint: DockerEndpoint): Promise<DockerVersion> {
  const { body } = await dockerRequest<{ Version: string; ApiVersion: string; GitCommit?: string; Os: string; Arch: string; KernelVersion?: string; BuildTime?: string; Experimental?: boolean }>(
    endpoint,
    'GET',
    '/version',
  );
  if (!body || typeof body.Version !== 'string' || typeof body.ApiVersion !== 'string') {
    throw new DockerApiError(500, 'Docker /version response was malformed.');
  }
  return {
    Version: body.Version,
    ApiVersion: body.ApiVersion,
    GitCommit: body.GitCommit ?? '',
    Os: body.Os,
    Arch: body.Arch,
    KernelVersion: body.KernelVersion ?? '',
    BuildTime: body.BuildTime ?? '',
    Experimental: body.Experimental ?? false,
  };
}

export async function listContainers(
  endpoint: DockerEndpoint,
  all = true,
): Promise<ContainerSummary[]> {
  const { body } = await dockerRequest<ContainerSummary[]>(
    endpoint,
    'GET',
    `/containers/json?all=${all ? 1 : 0}&size=0`,
  );
  return Array.isArray(body) ? body : [];
}

export async function inspectContainer(endpoint: DockerEndpoint, containerId: string): Promise<ContainerInspect> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const { body } = await dockerRequest<ContainerInspect>(endpoint, 'GET', `/containers/${containerId}/json`);
  return body;
}

export async function containerLogs(
  endpoint: DockerEndpoint,
  containerId: string,
  tailLines = 100,
  maxBytes = DOCKER_MAX_LOG_BYTES,
): Promise<string> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const rawBuffer = await fetchContainerLogsRaw(endpoint, containerId, tailLines, maxBytes);
  const inspect = await inspectContainer(endpoint, containerId);
  const isTty = inspect.Config.Tty === true;
  return demuxLogBuffer(rawBuffer, isTty);
}

async function fetchContainerLogsRaw(
  endpoint: DockerEndpoint,
  containerId: string,
  tailLines: number,
  maxBytes: number,
): Promise<Buffer> {
  const controller = new AbortController();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  const params = new URLSearchParams({
    stdout: '1',
    stderr: '1',
    tail: String(tailLines),
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
      if (totalBytes > maxBytes) {
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

export async function startContainer(endpoint: DockerEndpoint, containerId: string): Promise<void> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const { status } = await dockerRequest(endpoint, 'POST', `/containers/${containerId}/start`);
  if (status !== 204 && status !== 304) {
    throw new DockerApiError(status, `Failed to start container: ${status}.`);
  }
}

export async function stopContainer(endpoint: DockerEndpoint, containerId: string, timeoutSec = 10): Promise<void> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const { status } = await dockerRequest(
    endpoint,
    'POST',
    `/containers/${containerId}/stop?t=${timeoutSec}`,
  );
  if (status !== 204) {
    throw new DockerApiError(status, `Failed to stop container: ${status}.`);
  }
}

export async function restartContainer(endpoint: DockerEndpoint, containerId: string, timeoutSec = 10): Promise<void> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const { status } = await dockerRequest(
    endpoint,
    'POST',
    `/containers/${containerId}/restart?t=${timeoutSec}`,
  );
  if (status !== 204) {
    throw new DockerApiError(status, `Failed to restart container: ${status}.`);
  }
}

export async function removeContainer(endpoint: DockerEndpoint, containerId: string, force = false): Promise<void> {
  if (!/^[a-f0-9]{64}$/u.test(containerId)) {
    throw new DockerApiError(400, 'Invalid container ID format.');
  }
  const { status } = await dockerRequest(
    endpoint,
    'DELETE',
    `/containers/${containerId}?force=${force ? '1' : '0'}&v=0`,
  );
  if (status !== 204) {
    throw new DockerApiError(status, `Failed to remove container: ${status}.`);
  }
}

export function socketExists(socketPath: string): boolean {
  try {
    const stat = fs.statSync(socketPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export function verifyDockerSocket(endpoint: DockerEndpoint): Promise<DockerVersion> {
  return dockerVersion(endpoint);
}