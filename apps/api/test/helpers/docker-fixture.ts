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

export interface DockerFixture {
  socketPath: string;
  endpoint: string;
  containers: FixtureContainer[];
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
  socketPath = process.env.DOCKPILOT_DOCKER_SOCKETS ??
    path.join(tmpdir(), 'dockpilot-test-docker.sock'),
): Promise<DockerFixture> {
  const server: Server = createServer((socket: Socket) => {
    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      const requestLine = buffer.slice(0, buffer.indexOf('\r\n'));
      const [method, target] = requestLine.split(' ');
      const url = new URL(target ?? '/', 'http://docker');
      const pathname = url.pathname;
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
      const inspectMatch = /^\/containers\/([a-f0-9]{64})\/json$/u.exec(pathname);
      if (method === 'GET' && inspectMatch) {
        socket.end(
          jsonBody({
            Id: inspectMatch[1],
            Name: '/fixture',
            Config: { Tty: false },
            State: { Status: 'running' },
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
      if (
        method === 'POST' &&
        /^\/containers\/[a-f0-9]{64}\/(start|stop|restart)$/u.test(pathname)
      ) {
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
