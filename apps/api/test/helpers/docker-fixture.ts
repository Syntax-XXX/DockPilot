import { createServer, type Server, type Socket } from 'node:net';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

export interface FixtureContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
}

export interface FixtureImage {
  id: string;
  repoTags: string[];
  size: number;
  containers: number;
}

export interface FixtureVolume {
  name: string;
  driver: string;
  mountpoint: string;
  scope: string;
}

export interface FixtureNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
  internal?: boolean;
  attachable?: boolean;
  containerCount?: number;
}

export interface DockerFixture {
  socketPath: string;
  endpoint: string;
  containers: FixtureContainer[];
  images: FixtureImage[];
  volumes: FixtureVolume[];
  networks: FixtureNetwork[];
  removedImages: string[];
  stop: () => Promise<void>;
}

function jsonBody(value: unknown, status = 200): string {
  const payload = JSON.stringify(value);
  return `HTTP/1.1 ${String(status)} ${status === 200 ? 'OK' : 'Status'}\r\nContent-Type: application/json\r\nConnection: close\r\nContent-Length: ${String(Buffer.byteLength(payload))}\r\n\r\n${payload}`;
}

function emptyResponse(status: number): string {
  return `HTTP/1.1 ${String(status)} ${status === 204 ? 'No Content' : 'Status'}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`;
}

function logFrames(log: string): Buffer {
  const payload = Buffer.from(log, 'utf8');
  const header = Buffer.alloc(8);
  header[0] = 1;
  header.writeUInt32BE(payload.length, 4);
  return Buffer.concat([header, payload]);
}

export async function startDockerFixture(
  containers: FixtureContainer[],
  options: {
    socketPath?: string;
    images?: FixtureImage[];
    volumes?: FixtureVolume[];
    networks?: FixtureNetwork[];
    state?: { running: boolean };
  } = {},
): Promise<DockerFixture> {
  const socketPath =
    options.socketPath ??
    process.env.DOCKPILOT_DOCKER_SOCKETS ??
    path.join(tmpdir(), 'dockpilot-test-docker.sock');
  const images = options.images ?? [
    {
      id: `sha256:${'a'.repeat(64)}`,
      repoTags: ['nginx:alpine'],
      size: 23_000_000,
      containers: 1,
    },
  ];
  const volumes: FixtureVolume[] = options.volumes ?? [
    {
      name: 'fixture-data',
      driver: 'local',
      mountpoint: '/var/lib/docker/volumes/fixture-data/_data',
      scope: 'local',
    },
  ];
  const networks: FixtureNetwork[] = options.networks ?? [
    {
      id: 'c'.repeat(64),
      name: 'fixture-bridge',
      driver: 'bridge',
      scope: 'local',
      containerCount: 2,
    },
  ];
  const state = options.state ?? { running: true };
  const removedImages: string[] = [];
  const server: Server = createServer((socket: Socket) => {
    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const requestLine = buffer.slice(0, buffer.indexOf('\r\n'));
      const [method, target] = requestLine.split(' ');
      const url = new URL(target ?? '/', 'http://docker');
      const pathname = decodeURIComponent(url.pathname);
      buffer = '';

      if (method === 'GET' && pathname === '/version') {
        socket.end(
          jsonBody({
            Version: '27.0.0-fixture',
            ApiVersion: '1.45',
            GitCommit: 'fixture',
            Os: 'linux',
            Arch: 'amd64',
            KernelVersion: 'fixture',
            BuildTime: 'fixture',
            Experimental: false,
          }),
        );
        return;
      }
      if (method === 'GET' && pathname === '/info') {
        socket.end(
          jsonBody({
            ID: 'fixture-daemon',
            Driver: 'overlay2',
            DockerRootDir: '/var/lib/docker',
            Containers: containers.length,
            Images: images.length,
            NCPU: 4,
            MemTotal: 8_000_000_000,
          }),
        );
        return;
      }
      if (method === 'GET' && pathname === '/containers/json') {
        socket.end(
          jsonBody(
            containers.map((container) => ({
              Id: container.id,
              Names: [`/${container.name}`],
              Image: container.image,
              ImageID: 'sha256:' + 'b'.repeat(64),
              State: container.state,
              Status: container.status,
              Created: 1_700_000_000,
              Ports: [],
              Labels: {},
              HostConfig: { AutoRestart: false },
            })),
          ),
        );
        return;
      }
      const statsMatch = /^\/containers\/([a-f0-9]{64})\/stats$/u.exec(pathname);
      if (method === 'GET' && statsMatch) {
        socket.end(
          jsonBody({
            read: new Date().toISOString(),
            cpu_stats: {
              cpu_usage: { total_usage: 2_000_000 },
              system_cpu_usage: 10_000_000,
              online_cpus: 2,
            },
            precpu_stats: {
              cpu_usage: { total_usage: 1_000_000 },
              system_cpu_usage: 8_000_000,
              online_cpus: 2,
            },
            memory_stats: {
              usage: 120_000_000,
              limit: 512_000_000,
              stats: { inactive_file: 20_000_000 },
            },
            networks: { eth0: { rx_bytes: 1000, tx_bytes: 2000 } },
            blkio_stats: {
              io_service_bytes_recursive: [
                { op: 'read', value: 3000 },
                { op: 'write', value: 4000 },
              ],
            },
            pids_stats: { current: 7 },
          }),
        );
        return;
      }
      if (method === 'GET' && pathname === '/images/json') {
        const danglingOnly = url.searchParams.get('all') === '0';
        const listed = danglingOnly
          ? images.filter((image) => image.repoTags.length === 0)
          : images;
        socket.end(
          jsonBody(
            listed.map((image) => ({
              Id: image.id,
              RepoTags: image.repoTags,
              RepoDigests: [],
              Size: image.size,
              Created: 1_700_000_000,
              Containers: image.containers,
            })),
          ),
        );
        return;
      }
      if (method === 'GET' && pathname === '/volumes') {
        socket.end(
          jsonBody({
            Volumes: volumes.map((volume) => ({
              Name: volume.name,
              Driver: volume.driver,
              Mountpoint: volume.mountpoint,
              Scope: volume.scope,
              CreatedAt: '2026-01-01T00:00:00Z',
              Labels: {},
            })),
            Warnings: null,
          }),
        );
        return;
      }
      if (method === 'GET' && pathname === '/networks') {
        socket.end(
          jsonBody(
            networks.map((network) => ({
              Id: network.id,
              Name: network.name,
              Driver: network.driver,
              Scope: network.scope,
              Internal: network.internal ?? false,
              Attachable: network.attachable ?? false,
              Created: '2026-01-01T00:00:00Z',
              Containers: Object.fromEntries(
                Array.from({ length: network.containerCount ?? 0 }, (_, index) => [
                  `container-${String(index)}`,
                  {},
                ]),
              ),
              Labels: {},
            })),
          ),
        );
        return;
      }
      const imageDeleteMatch = /^\/images\/(sha256:[a-f0-9]{64})$/u.exec(pathname);
      if (method === 'DELETE' && imageDeleteMatch) {
        removedImages.push(imageDeleteMatch[1] ?? '');
        socket.end(jsonBody([{ Deleted: imageDeleteMatch[1] ?? '' }]));
        return;
      }
      const inspectMatch = /^\/containers\/([a-f0-9]{64})\/json$/u.exec(pathname);
      if (method === 'GET' && inspectMatch) {
        socket.end(
          jsonBody({
            Id: inspectMatch[1],
            Name: '/fixture',
            Config: { Tty: false },
            State: {
              Status: state.running ? 'running' : 'exited',
              Running: state.running,
              Paused: false,
              Restarting: false,
              ExitCode: state.running ? 0 : 137,
              FinishedAt: state.running ? '0001-01-01T00:00:00Z' : '2026-01-01T00:00:00Z',
              Health: null,
            },
          }),
        );
        return;
      }
      const logsMatch = /^\/containers\/([a-f0-9]{64})\/logs$/u.exec(pathname);
      if (method === 'GET' && logsMatch) {
        const frames = logFrames('fixture log line\n');
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/vnd.docker.raw-stream\r\nConnection: close\r\nContent-Length: ${String(frames.length)}\r\n\r\n`,
        );
        socket.end(frames);
        return;
      }
      const actionMatch = /^\/containers\/[a-f0-9]{64}\/(start|stop|restart)$/u.exec(pathname);
      if (method === 'POST' && actionMatch) {
        // Mirror the engine: stop leaves the container exited, start/restart leave it running.
        state.running = actionMatch[1] !== 'stop';
        socket.end(emptyResponse(204));
        return;
      }
      if (method === 'DELETE' && /^\/containers\/[a-f0-9]{64}$/u.test(pathname)) {
        socket.end(emptyResponse(204));
        return;
      }
      socket.end(emptyResponse(404));
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(socketPath, () => {
      resolve();
    });
  });

  return {
    socketPath,
    endpoint: `unix://${socketPath}`,
    containers,
    images,
    volumes,
    networks,
    removedImages,
    stop: async () => {
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      await rm(socketPath, { force: true });
    },
  };
}

export function fixtureContainer(overrides: Partial<FixtureContainer> = {}): FixtureContainer {
  return {
    id: 'c'.repeat(64),
    name: 'fixture-web',
    image: 'nginx:alpine',
    state: 'running',
    status: 'Up 3 minutes',
    ...overrides,
  };
}
