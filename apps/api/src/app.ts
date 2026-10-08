import Fastify, { LogController } from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { healthResponseSchema } from '@dockpilot/shared';
import { authRoutes, installSessionAuthentication } from './routes/auth.js';
import { administratorRoutes } from './routes/admin.js';
import { registerMcpRoutes } from './mcp/routes.js';
import { isMcpRequestUrl } from './mcp/paths.js';
import { isAppError } from './lib/errors.js';
import { env, sessionMaxAgeSeconds } from './lib/security.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'req.headers["set-cookie"]',
          'req.body.password',
          'req.body.currentPassword',
          'req.body.newPassword',
          'req.body.token',
          'res.headers["set-cookie"]',
        ],
        censor: '[REDACTED]',
      },
    },
    logController: new LogController({ disableRequestLogging: true }),
    bodyLimit: 64 * 1024,
    trustProxy: env.TRUSTED_PROXY === 'true',
    requestTimeout: 15_000,
    forceCloseConnections: true,
    genReqId(rawRequest) {
      const incoming = rawRequest.headers['x-request-id'];
      return typeof incoming === 'string' && /^[a-zA-Z0-9_-]{8,80}$/u.test(incoming)
        ? incoming
        : cryptoRandomRequestId();
    },
  });

  await app.register(helmet, {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts:
      env.NODE_ENV === 'production'
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
        : false,
  });

  await app.register(rateLimit, {
    global: true,
    max: 120,
    timeWindow: '1 minute',
    allowList: [],
    enableDraftSpec: false,
  });

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    reply.header('X-Request-Id', _request.id);
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-Permitted-Cross-Domain-Policies', 'none');
    reply.header('Cross-Origin-Resource-Policy', 'same-origin');
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    reply.removeHeader('Server');
    reply.removeHeader('X-Powered-By');
    if (
      !isMcpRequestUrl(_request.url) &&
      _request.method !== 'GET' &&
      _request.method !== 'HEAD' &&
      _request.url !== '/api/v1/health'
    ) {
      if (_request.headers.origin !== env.WEB_ORIGIN) {
        return reply
          .code(403)
          .send({ error: 'FORBIDDEN', message: 'Cross-origin request rejected.' });
      }
    }
  });

  installSessionAuthentication(app);

  app.get(
    '/api/v1/health',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (_request, reply) => {
      const response = healthResponseSchema.parse({
        status: 'ok',
        service: 'dockpilot-api',
        protocolVersion: 1,
      });
      return reply.code(200).header('Cache-Control', 'no-store').send(response);
    },
  );

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({
      error: 'NOT_FOUND',
      message: 'This DockPilot API route does not exist.',
    }),
  );

  app.setErrorHandler((error: { statusCode?: number; validation?: unknown }, request, reply) => {
    const statusCode = error.statusCode;
    const validationError = error.validation;
    if (validationError) {
      return reply.code(400).send({
        error: 'VALIDATION_ERROR',
        message: 'The request did not match the expected schema.',
      });
    }
    if (isAppError(error)) {
      if (error.retryAfterSeconds !== undefined) {
        reply.header('Retry-After', String(error.retryAfterSeconds));
      }
      if (error.category === 'internal') {
        request.log.error({ err: error }, 'DockPilot request failed');
      }
      return reply.code(error.httpStatus).send({ error: error.code, message: error.message });
    }
    if (statusCode === 413) {
      return reply.code(413).send({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'The request body exceeds the allowed size.',
      });
    }
    if (statusCode === 429) {
      return reply
        .code(429)
        .send({ error: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' });
    }
    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      return reply.code(statusCode).send({
        error: 'BAD_REQUEST',
        message: 'The request could not be processed.',
      });
    }
    request.log.error({ err: error }, 'DockPilot request failed');
    return reply.code(500).send({
      error: 'INTERNAL_ERROR',
      message:
        env.NODE_ENV === 'production'
          ? 'An unexpected error occurred.'
          : 'An unexpected error occurred. Inspect the redacted server log.',
    });
  });

  app.addHook('onSend', async (_request, reply, payload) => {
    if (reply.statusCode === 401 || reply.statusCode === 403 || reply.statusCode === 429) {
      reply.header('Cache-Control', 'private, no-store');
    }
    if (reply.getHeader('Set-Cookie')) {
      reply.header('X-Session-Max-Age', String(sessionMaxAgeSeconds));
    }
    return payload;
  });

  await app.register(authRoutes, { prefix: '/api/v1/auth' });

  await app.register(administratorRoutes, { prefix: '/api/v1/admin' });

  await app.register(registerMcpRoutes, { prefix: '/api/v1' });

  return app;
}

function cryptoRandomRequestId(): string {
  return `dp_${crypto.randomUUID()}`;
}

import crypto from 'node:crypto';
