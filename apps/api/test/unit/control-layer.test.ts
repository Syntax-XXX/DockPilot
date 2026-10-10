import { describe, expect, it } from 'vitest';
import {
  auditPayloadByteLimit,
  redactRecord,
  redactText,
  redactValue,
} from '../../src/lib/redact.js';
import {
  FixedWindowRateLimiter,
  mcpAuthenticationRateLimitRule,
  mcpRateLimitRules,
} from '../../src/lib/rate-limit.js';
import { decodeCursor, encodeCursor } from '../../src/lib/pagination.js';
import { hasPermission, permissionRank } from '../../src/lib/identity.js';
import {
  AppError,
  asAppError,
  authErrors,
  authzErrors,
  rateLimitedError,
  type AppErrorCode,
} from '../../src/lib/errors.js';
import {
  aiTokenName,
  createAiToken,
  hashAiToken,
  isAiTokenShape,
  timingSafeHexEqual,
} from '../../src/lib/ai-token.js';
import {
  demuxDockerLogs,
  DockerApiError,
  containerLogs,
  dockerVersion,
  inspectContainer,
  socketExists,
  stopContainer,
  restartContainer,
} from '../../src/lib/docker.js';
import { createServer, type Socket } from 'node:net';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const redacted = '[REDACTED]';
const truncated = '[TRUNCATED]';
const timestamp = '2026-01-01T00:00:00.000Z';
const identifier = 'b7ba6c0e-e4d6-4b2c-88ee-8a7384f43128';

function toCursor(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

describe('audit payload redaction', () => {
  it('redacts sensitive keys at every nesting depth', () => {
    const input = {
      password: 'hunter2',
      nested: {
        authorization: 'Bearer abc',
        deeper: {
          apiKey: 'key-1',
          api_key: 'key-2',
          'api-key': 'key-3',
          privateKey: 'private-value',
          private_key: 'private-value-2',
          sessionToken: 'session-value',
          hash: 'deadbeef',
          credential: 'credential-value',
          cookie: 'dockpilot_session=abc',
          secret: 'secret-value',
          token: 'token-value',
          passphrase: 'passphrase-value',
          signature: 'signature-value',
        },
      },
    };

    expect(JSON.stringify(redactValue(input))).toBe(
      JSON.stringify({
        password: redacted,
        nested: {
          authorization: redacted,
          deeper: {
            apiKey: redacted,
            api_key: redacted,
            'api-key': redacted,
            privateKey: redacted,
            private_key: redacted,
            sessionToken: redacted,
            hash: redacted,
            credential: redacted,
            cookie: redacted,
            secret: redacted,
            token: redacted,
            passphrase: redacted,
            signature: redacted,
          },
        },
      }),
    );
  });

  it('preserves non-sensitive scalars, nulls, undefined and dates', () => {
    expect(redactValue({ name: 'Alex', count: 3, active: true, missing: null })).toEqual({
      name: 'Alex',
      count: 3,
      active: true,
      missing: null,
    });
    expect(redactValue(undefined)).toBeUndefined();
    expect(redactValue(null)).toBeNull();
    expect(redactValue(10n)).toBe('10');
    expect(redactValue(() => 1)).toBeUndefined();
    expect(redactValue(Symbol('dockpilot'))).toBeUndefined();
    expect(redactValue(new Date(timestamp))).toBe(timestamp);
  });

  it('truncates long strings, caps arrays and stops at the maximum depth', () => {
    expect(JSON.stringify(redactValue({ note: 'a'.repeat(600) }))).toBe(
      JSON.stringify({ note: `${'a'.repeat(512)}${truncated}` }),
    );

    const items = Array.from({ length: 25 }, (_, index) => index);
    expect(JSON.stringify(redactValue(items))).toBe(
      JSON.stringify(Array.from({ length: 20 }, (_, index) => index)),
    );

    const deep = { one: { two: { three: { four: { five: { six: 'value' } } } } } };
    expect(JSON.stringify(redactValue(deep))).toContain('[MAX DEPTH]');
  });

  it('returns null for non-object records and a marker above the byte limit', () => {
    expect(redactRecord('text')).toBeNull();
    expect(redactRecord(5)).toBeNull();
    expect(redactRecord(null)).toBeNull();
    expect(redactRecord(undefined)).toBeNull();
    expect(redactRecord(['a', 'b'])).toBeNull();
    expect(redactRecord({ password: 'value', safe: 'kept' })).toEqual({
      password: redacted,
      safe: 'kept',
    });

    const oversized: Record<string, unknown> = {};
    for (let index = 0; index < 12; index += 1) {
      oversized[`field-${String(index)}`] = 'a'.repeat(500);
    }
    const result = redactRecord(oversized);
    expect(result?.truncated).toBe(true);
    expect(result?.byteLength).toBeGreaterThan(auditPayloadByteLimit);
    expect(JSON.stringify(result)).not.toContain('aaaa');
  });

  it('redacts and truncates free text within its limit', () => {
    expect(redactText('short value')).toBe('short value');
    expect(redactText('value with a secret inside')).toBe(redacted);
    expect(redactText('abcdefghij', 5)).toBe(`abcde${truncated}`);
    expect(redactText('x'.repeat(250))).toBe(`${'x'.repeat(200)}${truncated}`);
  });
});

describe('fixed window rate limiting', () => {
  it('publishes the documented production limits', () => {
    expect(mcpRateLimitRules.read).toEqual({ max: 120, windowMs: 60_000 });
    expect(mcpRateLimitRules.write).toEqual({ max: 20, windowMs: 60_000 });
    expect(mcpRateLimitRules.destructive).toEqual({ max: 5, windowMs: 300_000 });
    expect(mcpAuthenticationRateLimitRule).toEqual({ max: 20, windowMs: 60_000 });
  });

  it('allows up to the limit, then denies with a retry delay', () => {
    const reads = new FixedWindowRateLimiter(mcpRateLimitRules);
    let last = reads.check('credential-a', 'read');
    for (let index = 1; index < mcpRateLimitRules.read.max; index += 1) {
      last = reads.check('credential-a', 'read');
    }
    expect(last.allowed).toBe(true);
    expect(reads.check('credential-a', 'read').allowed).toBe(false);

    const small = new FixedWindowRateLimiter({ read: { max: 2, windowMs: 60_000 } });
    expect(small.check('key', 'read')).toMatchObject({ allowed: true, remaining: 1 });
    expect(small.check('key', 'read')).toMatchObject({ allowed: true, remaining: 0 });
    const denied = small.check('key', 'read');
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it('keeps keys and categories independent and resets cleanly', () => {
    const limiter = new FixedWindowRateLimiter({
      read: { max: 1, windowMs: 60_000 },
      write: { max: 1, windowMs: 60_000 },
    });
    expect(limiter.check('first', 'read').allowed).toBe(true);
    expect(limiter.check('first', 'read').allowed).toBe(false);
    expect(limiter.check('second', 'read').allowed).toBe(true);
    expect(limiter.check('first', 'write').allowed).toBe(true);
    expect(limiter.check('first', 'write').allowed).toBe(false);
    expect(limiter.check('first', 'unknown-category').allowed).toBe(true);
    limiter.reset();
    expect(limiter.check('first', 'read').allowed).toBe(true);
    expect(limiter.check('first', 'write').allowed).toBe(true);
  });

  it('enforces the dedicated authentication limit for repeated attempts', () => {
    const limiter = new FixedWindowRateLimiter({ authentication: mcpAuthenticationRateLimitRule });
    let allowed = 0;
    for (let index = 0; index < 21; index += 1) {
      if (limiter.check('127.0.0.1', 'authentication').allowed) allowed += 1;
    }
    expect(allowed).toBe(mcpAuthenticationRateLimitRule.max);
    expect(limiter.check('127.0.0.1', 'authentication').allowed).toBe(false);
  });
});

describe('keyset pagination cursors', () => {
  it('round-trips a timestamp and identifier pair', () => {
    expect(decodeCursor(encodeCursor([timestamp, identifier]))).toEqual([timestamp, identifier]);
  });

  it('rejects empty, oversized and non-base64url input', () => {
    expect(decodeCursor('')).toBeUndefined();
    expect(decodeCursor('a'.repeat(257))).toBeUndefined();
    expect(decodeCursor('not+base64/url=')).toBeUndefined();
    expect(decodeCursor('has spaces')).toBeUndefined();
  });

  it('rejects base64url that is not a two-element string pair with a date', () => {
    const notJson = Buffer.from('not json at all').toString('base64url');
    expect(decodeCursor(notJson)).toBeUndefined();
    expect(decodeCursor(toCursor({}))).toBeUndefined();
    expect(decodeCursor(toCursor([1, 2]))).toBeUndefined();
    expect(decodeCursor(toCursor(['a', 'b']))).toBeUndefined();
    expect(decodeCursor(toCursor([timestamp]))).toBeUndefined();
    expect(decodeCursor(toCursor([timestamp, 'id', 'extra']))).toBeUndefined();
    expect(decodeCursor(toCursor([timestamp, '']))).toBeUndefined();
    expect(decodeCursor(toCursor([timestamp, 'x'.repeat(65)]))).toBeUndefined();
  });
});

describe('Docker socket validation', () => {
  it('recognizes Unix sockets but rejects regular files and missing paths', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-socket-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const filePath = path.join(directory, 'not-a-socket');
    const server = createServer();
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));

    try {
      await writeFile(filePath, 'not a socket');
      expect(socketExists(socketPath)).toBe(true);
      expect(socketExists(filePath)).toBe(false);
      expect(socketExists(path.join(directory, 'missing.sock'))).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });
});

describe('Docker API request timeout enforcement', () => {
  it('aborts a JSON Docker request that accepts the socket but never responds', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-api-timeout-'));
    const socketPath = path.join(directory, 'docker.sock');
    const sockets: Socket[] = [];
    // Accepts the connection and never sends a byte back, so only the client-side
    // timeout can settle the request.
    const server = createServer((socket) => {
      sockets.push(socket);
      socket.on('data', () => undefined);
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));
    const startedAt = performance.now();

    try {
      await expect(dockerVersion({ kind: 'unix', socketPath })).rejects.toMatchObject({
        name: 'DockerConnectionError',
      });
      // The configured default is 5s; the request must settle close to it, and never hang.
      expect(performance.now() - startedAt).toBeLessThan(6000);
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('aborts inspectContainer and settles with a connection error when the socket stalls', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-inspect-timeout-'));
    const socketPath = path.join(directory, 'docker.sock');
    const sockets: Socket[] = [];
    const server = createServer((socket) => {
      sockets.push(socket);
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));

    try {
      await expect(
        inspectContainer({ kind: 'unix', socketPath }, 'a'.repeat(64)),
      ).rejects.toMatchObject({ name: 'DockerConnectionError' });
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it.each([
    ['stop', stopContainer],
    ['restart', restartContainer],
  ])(
    'allows %s to wait out the engine stop grace period beyond the default request timeout',
    async (_name, action) => {
      const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-stop-timeout-'));
      const socketPath = path.join(directory, 'docker.sock');
      const sockets: Socket[] = [];
      // Docker holds the response for up to `t` seconds while it signals the container.
      // With the default 10s grace period this outlasts the 5s default request timeout,
      // so the action must use a longer deadline or it fails on a healthy engine.
      const server = createServer((socket) => {
        sockets.push(socket);
        let request = '';
        socket.on('data', (chunk) => {
          request += chunk.toString();
          if (!request.includes('\r\n\r\n')) return;
          setTimeout(() => {
            if (socket.destroyed) return;
            socket.write('HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n');
            socket.end();
          }, 5_500);
        });
      });
      await new Promise<void>((resolve) => server.listen(socketPath, resolve));

      try {
        await expect(action({ kind: 'unix', socketPath }, 'a'.repeat(64))).resolves.toBeUndefined();
      } finally {
        for (const socket of sockets) socket.destroy();
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        await rm(directory, { recursive: true, force: true });
      }
    },
    15_000,
  );
});

describe('Docker log retrieval', () => {
  const containerId = 'a'.repeat(64);

  it('returns streamed log bytes and reports Docker HTTP errors without throwing from events', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const server = createServer((socket) => {
      let request = '';
      socket.on('data', (chunk) => {
        request += chunk.toString();
        if (!request.includes('\r\n\r\n')) return;
        socket.write(
          'HTTP/1.1 500 Internal Server Error\r\nContent-Length: 13\r\n\r\nDocker failed',
        );
        socket.end();
      });
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));

    try {
      await expect(containerLogs({ kind: 'unix', socketPath }, containerId)).rejects.toMatchObject({
        name: 'DockerApiError',
        status: 500,
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects oversized logs as a bounded API error instead of an uncaught stream exception', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const server = createServer((socket) => {
      socket.on('data', () => {
        socket.write('HTTP/1.1 200 OK\r\nContent-Length: 16\r\n\r\n0123456789abcdef');
        socket.end();
      });
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));

    try {
      await expect(
        containerLogs({ kind: 'unix', socketPath }, containerId, 10, 8),
      ).rejects.toMatchObject({
        name: 'DockerApiError',
        status: 413,
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('times out when Docker accepts the request but never sends response headers', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-timeout-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const server = createServer((socket) => {
      socket.on('data', () => undefined);
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));
    const startedAt = performance.now();

    try {
      await expect(
        containerLogs({ kind: 'unix', socketPath }, containerId, 10, 1024, 30),
      ).rejects.toMatchObject({ name: 'DockerConnectionError' });
      expect(performance.now() - startedAt).toBeLessThan(500);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects a log response that stalls after sending its headers', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-timeout-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const server = createServer((socket) => {
      socket.on('data', () => {
        socket.write('HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n');
      });
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));
    const startedAt = performance.now();

    try {
      await expect(
        containerLogs({ kind: 'unix', socketPath }, containerId, 10, 1024, 30),
      ).rejects.toMatchObject({ name: 'DockerConnectionError' });
      expect(performance.now() - startedAt).toBeLessThan(500);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('classifies a log request that disconnects before the response as a connection failure', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'dockpilot-docker-disconnect-test-'));
    const socketPath = path.join(directory, 'docker.sock');
    const server = createServer((socket) => {
      socket.on('data', () => socket.destroy());
    });
    await new Promise<void>((resolve) => server.listen(socketPath, resolve));

    try {
      await expect(
        containerLogs({ kind: 'unix', socketPath }, containerId, 10, 1024),
      ).rejects.toMatchObject({ name: 'DockerConnectionError' });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('demultiplexes a maximum-size framed log buffer in bounded time', () => {
    const frames = Array.from({ length: 10000 }, (_, index) => {
      const content = Buffer.from('x');
      const header = Buffer.alloc(8);
      header[0] = index === 0 ? 1 : index === 9999 ? 9 : 2;
      header.writeUInt32BE(content.length, 4);
      return Buffer.concat([header, content]);
    });
    const buffer = Buffer.concat(frames);
    const startedAt = performance.now();
    const output = demuxDockerLogs(buffer, false);
    const durationMs = performance.now() - startedAt;

    expect(output).toBe('x'.repeat(9_999));
    expect(durationMs).toBeLessThan(500);
  });

  it('returns only complete valid stdout and stderr log frames', () => {
    const firstPayload = Buffer.from('stdout\n');
    const secondPayload = Buffer.from('stderr\n');
    const frame = (stream: number, payload: Buffer) => {
      const header = Buffer.alloc(8);
      header[0] = stream;
      header.writeUInt32BE(payload.length, 4);
      return Buffer.concat([header, payload]);
    };
    const complete = Buffer.concat([frame(1, firstPayload), frame(2, secondPayload)]);
    const incomplete = Buffer.concat([complete, Buffer.from([1, 0, 0])]);

    expect(demuxDockerLogs(incomplete, false)).toBe('stdout\nstderr\n');
    expect(demuxDockerLogs(Buffer.from('terminal output'), true)).toBe('terminal output');
  });

  it('bounds log tail and byte limits before making a socket request', async () => {
    await expect(
      containerLogs({ kind: 'unix', socketPath: '/unused.sock' }, containerId, 0),
    ).rejects.toMatchObject({
      name: 'DockerApiError',
      status: 400,
    });
    await expect(
      containerLogs({ kind: 'unix', socketPath: '/unused.sock' }, containerId, 1, 300_000),
    ).rejects.toMatchObject({
      name: 'DockerApiError',
      status: 400,
    });
    expect(new DockerApiError(413, 'bounded').status).toBe(413);
  });
});

describe('AI permission ranking', () => {
  it('orders read below write below destructive', () => {
    expect(permissionRank.read).toBeLessThan(permissionRank.write);
    expect(permissionRank.write).toBeLessThan(permissionRank.destructive);
  });

  it('never allows an AI credential to escalate beyond its grant', () => {
    expect(hasPermission('read', 'read')).toBe(true);
    expect(hasPermission('read', 'write')).toBe(false);
    expect(hasPermission('read', 'destructive')).toBe(false);
    expect(hasPermission('write', 'read')).toBe(true);
    expect(hasPermission('write', 'write')).toBe(true);
    expect(hasPermission('write', 'destructive')).toBe(false);
    expect(hasPermission('destructive', 'read')).toBe(true);
    expect(hasPermission('destructive', 'write')).toBe(true);
    expect(hasPermission('destructive', 'destructive')).toBe(true);
  });
});

describe('structured application errors', () => {
  it('maps every code to its documented status and audit category', () => {
    const documented: { code: AppErrorCode; status: number; category: string }[] = [
      { code: 'AUTHENTICATION', status: 401, category: 'authentication' },
      { code: 'AUTHORIZATION', status: 403, category: 'authorization' },
      { code: 'VALIDATION', status: 400, category: 'validation' },
      { code: 'NOT_FOUND', status: 404, category: 'not_found' },
      { code: 'CONFLICT', status: 409, category: 'conflict' },
      { code: 'RATE_LIMITED', status: 429, category: 'rate_limited' },
      { code: 'INTERNAL', status: 500, category: 'internal' },
      { code: 'UNAVAILABLE', status: 503, category: 'internal' },
    ];
    for (const entry of documented) {
      const error = new AppError(entry.code, 'safe message');
      expect(error.code).toBe(entry.code);
      expect(error.httpStatus).toBe(entry.status);
      expect(error.category).toBe(entry.category);
    }
  });

  it('preserves known errors and wraps unknown failures as internal', () => {
    const known = new AppError('NOT_FOUND', 'The resource does not exist.');
    expect(asAppError(known)).toBe(known);
    const wrapped = asAppError(new Error('raw database failure'));
    expect(wrapped.code).toBe('INTERNAL');
    expect(wrapped.httpStatus).toBe(500);
    expect(wrapped.category).toBe('internal');
    expect(wrapped.message).not.toContain('raw database failure');
    expect(asAppError('a thrown string').code).toBe('INTERNAL');
  });

  it('reports a retry delay for rate limited credentials', () => {
    expect(rateLimitedError(30).retryAfterSeconds).toBe(30);
    expect(rateLimitedError(30).httpStatus).toBe(429);
  });

  it('never echoes credentials or tokens in authentication and authorization messages', () => {
    const token = `${aiTokenName}${'a'.repeat(43)}`;
    const messages = [
      authErrors.missingCredential().message,
      authErrors.invalidCredential().message,
      authErrors.revokedCredential().message,
      authErrors.expiredCredential().message,
      authErrors.disabledCredential().message,
      authzErrors.insufficientPermission('destructive').message,
      authzErrors.roleRequired().message,
      authzErrors.unauthenticated().message,
    ];
    for (const message of messages) {
      expect(message.length).toBeGreaterThan(0);
      expect(message.toLowerCase()).not.toContain('token');
      expect(message).not.toContain(token);
      expect(message).not.toContain('dpai_');
    }
  });
});

describe('AI credential tokens', () => {
  it('generates unique high-entropy tokens with a safe prefix and keyed hash', () => {
    const first = createAiToken();
    const second = createAiToken();
    expect(first.token).toMatch(/^dpai_[A-Za-z0-9_-]{43}$/u);
    expect(first.token.startsWith(aiTokenName)).toBe(true);
    expect(first.tokenPrefix).toMatch(/^dpai_[A-Za-z0-9_-]{8}$/u);
    expect(first.tokenPrefix.length).toBe(13);
    expect(first.token.startsWith(first.tokenPrefix)).toBe(true);
    expect(first.tokenHash).toMatch(/^[a-f0-9]{64}$/u);
    expect(first.tokenHash).not.toBe(first.token);
    expect(second.token).not.toBe(first.token);
    expect(second.tokenHash).not.toBe(first.tokenHash);
  });

  it('accepts only well-formed AI tokens', () => {
    expect(isAiTokenShape(createAiToken().token)).toBe(true);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(43)}`)).toBe(true);
    expect(isAiTokenShape('')).toBe(false);
    expect(isAiTokenShape('dpai_')).toBe(false);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(42)}`)).toBe(false);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(44)}`)).toBe(false);
    expect(isAiTokenShape('x'.repeat(48))).toBe(false);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(42)}.`)).toBe(false);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(42)}+`)).toBe(false);
    expect(isAiTokenShape(`${aiTokenName}${'a'.repeat(40)}==`)).toBe(false);
    expect(isAiTokenShape('Bearer dpai_abcdefghijklmnopqrstuvwxyz0123456789ABC')).toBe(false);
    expect(isAiTokenShape('JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXPJBSWY3DPEHP')).toBe(false);
  });

  it('hashes deterministically without storing the raw token', () => {
    const token = createAiToken().token;
    expect(hashAiToken(token)).toBe(hashAiToken(token));
    expect(hashAiToken(token)).toMatch(/^[a-f0-9]{64}$/u);
    expect(hashAiToken(token)).not.toBe(hashAiToken(`${token}a`));
    expect(hashAiToken(token)).not.toContain(token);
  });

  it('compares stored hashes safely and never throws on malformed input', () => {
    const first = hashAiToken(createAiToken().token);
    const second = hashAiToken(createAiToken().token);
    expect(timingSafeHexEqual(first, first)).toBe(true);
    expect(timingSafeHexEqual(first, second)).toBe(false);
    expect(timingSafeHexEqual('', '')).toBe(false);
    expect(timingSafeHexEqual('short', first)).toBe(false);
    expect(timingSafeHexEqual(first, 'A'.repeat(64))).toBe(false);
    expect(timingSafeHexEqual('x'.repeat(64), first)).toBe(false);
  });
});
