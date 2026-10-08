import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import {
  setupAccountSchema,
  loginSchema,
  safeUserSchema,
  sessionResponseSchema,
} from '@dockpilot/shared';
import { db } from '../db/index.js';
import { organizations, sessions, users } from '../db/schema.js';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isTrustedOrigin,
  isValidSessionToken,
  sessionMaxAgeMs,
  verifyPasswordOrBurnTime,
  verifyMutationRequest,
} from '../lib/security.js';
import { writeAuditEvent } from '../lib/audit.js';
import { isMcpRequestUrl } from '../mcp/paths.js';
import { clearSessionCookie, readSessionCookie, setSessionCookie } from '../lib/cookie.js';
import type { SafeUser } from '@dockpilot/shared';

function csrfFailure(reply: FastifyReply): FastifyReply {
  return reply.code(403).send({ error: 'FORBIDDEN', message: 'Cross-origin request rejected.' });
}

export function authRoutes(app: FastifyInstance): void {
  app.get(
    '/setup-status',
    {
      config: { rateLimit: { max: 30, timeWindow: '15 minutes' } },
    },
    async () => {
      const result = await db.select({ id: users.id }).from(users).limit(1);
      return { setupRequired: result.length === 0 };
    },
  );

  app.post(
    '/setup',
    {
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    },
    async (request, reply) => {
      if (!verifyMutationRequest(request.headers.origin)) return csrfFailure(reply);
      const inputResult = setupAccountSchema.safeParse(request.body);
      if (!inputResult.success) {
        return reply.code(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Enter a valid name, email, and password of at least 12 characters.',
        });
      }

      const input = inputResult.data;
      const passwordHash = await hashPassword(input.password);
      const token = createSessionToken();
      const tokenHash = hashSessionToken(token);
      const result = await db.transaction(async (transaction) => {
        await transaction.execute(sql`SELECT pg_advisory_xact_lock(6361593284417021281)`);
        const existing = await transaction.select({ id: users.id }).from(users).limit(1);
        if (existing.length > 0) return null;

        const [organization] = await transaction
          .insert(organizations)
          .values({ name: input.organizationName })
          .returning({ id: organizations.id });
        if (!organization) throw new Error('Unable to create initial organization.');

        const [createdUser] = await transaction
          .insert(users)
          .values({
            email: input.email,
            emailNormalized: input.email,
            passwordHash,
            name: input.name,
            organizationId: organization.id,
            role: 'owner',
          })
          .returning();
        if (!createdUser) throw new Error('Unable to create initial account.');

        const expiresAt = new Date(Date.now() + sessionMaxAgeMs);
        const [session] = await transaction
          .insert(sessions)
          .values({ tokenHash, userId: createdUser.id, expiresAt })
          .returning({ id: sessions.id });
        if (!session) throw new Error('Unable to create authenticated setup session.');

        await writeAuditEvent(transaction, {
          organizationId: organization.id,
          actorUserId: createdUser.id,
          action: 'auth.owner_bootstrap',
          resourceType: 'user',
          resourceId: createdUser.id,
          metadata: { email: input.email },
          requestId: request.id,
        });

        return { organizationId: organization.id, createdUser };
      });

      if (!result)
        return reply
          .code(403)
          .send({ error: 'SETUP_COMPLETE', message: 'Initial setup has already been completed.' });

      const safeUser = safeUserSchema.parse({
        id: result.createdUser.id,
        email: result.createdUser.email,
        name: result.createdUser.name,
        organizationId: result.organizationId,
        role: result.createdUser.role,
      });
      const response = sessionResponseSchema.parse({ user: safeUser });
      setSessionCookie(reply, token);
      return reply.code(201).header('Cache-Control', 'private, no-store').send(response);
    },
  );

  app.post(
    '/login',
    {
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!verifyMutationRequest(request.headers.origin)) return csrfFailure(reply);
      const inputResult = loginSchema.safeParse(request.body);
      if (!inputResult.success) {
        return reply
          .code(400)
          .send({ error: 'VALIDATION_ERROR', message: 'Enter a valid email and password.' });
      }

      const input = inputResult.data;
      const [matchedUser] = await db
        .select()
        .from(users)
        .where(eq(users.emailNormalized, input.email))
        .limit(1);
      const passwordValid = await verifyPasswordOrBurnTime(
        input.password,
        matchedUser?.passwordHash ?? null,
      );

      if (!matchedUser || matchedUser.disabledAt || !passwordValid) {
        return reply
          .code(401)
          .send({ error: 'INVALID_CREDENTIALS', message: 'The email or password is incorrect.' });
      }

      const token = createSessionToken();
      const tokenHash = hashSessionToken(token);
      const expiresAt = new Date(Date.now() + sessionMaxAgeMs);
      await db.transaction(async (transaction) => {
        await transaction.insert(sessions).values({ tokenHash, userId: matchedUser.id, expiresAt });
        await writeAuditEvent(transaction, {
          organizationId: matchedUser.organizationId,
          actorUserId: matchedUser.id,
          action: 'auth.login',
          resourceType: 'session',
          metadata: { email: matchedUser.email },
          requestId: request.id,
        });
      });

      const user = safeUserSchema.parse({
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        organizationId: matchedUser.organizationId,
        role: matchedUser.role,
      });
      setSessionCookie(reply, token);
      return reply
        .header('Cache-Control', 'private, no-store')
        .send(sessionResponseSchema.parse({ user }));
    },
  );

  app.post(
    '/logout',
    { config: { rateLimit: { max: 20, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      if (!verifyMutationRequest(request.headers.origin)) return csrfFailure(reply);
      const tokenHash = request.sessionTokenHash;
      const authenticatedUser = request.dockpilotUser;
      if (tokenHash && authenticatedUser) {
        await db.transaction(async (transaction) => {
          await transaction.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
          await writeAuditEvent(transaction, {
            organizationId: authenticatedUser.organizationId,
            actorUserId: authenticatedUser.id,
            action: 'auth.logout',
            resourceType: 'session',
            requestId: request.id,
          });
        });
      }
      clearSessionCookie(reply);
      return reply.code(204).header('Cache-Control', 'no-store').send();
    },
  );

  app.get('/me', async (request, reply) => {
    if (!request.dockpilotUser) {
      return reply
        .code(401)
        .header('Cache-Control', 'private, no-store')
        .send({ error: 'UNAUTHENTICATED', message: 'Sign in to continue.' });
    }
    return reply
      .header('Cache-Control', 'private, no-store')
      .send(sessionResponseSchema.parse({ user: request.dockpilotUser }));
  });
}

export function installSessionAuthentication(app: FastifyInstance): void {
  app.decorateRequest('dockpilotUser', null);
  app.decorateRequest('sessionTokenHash', null);

  app.addHook('onRequest', async (request, reply) => {
    if (isMcpRequestUrl(request.url)) return;
    if (
      request.url.startsWith('/api/v1/health') ||
      request.url.startsWith('/api/v1/auth/setup-status')
    )
      return;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      if (!isTrustedOrigin(request.headers.origin)) {
        csrfFailure(reply);
        return reply;
      }
    }

    const token = readSessionCookie(request);
    if (!token || !isValidSessionToken(token)) return;

    const tokenHash = hashSessionToken(token);
    const [session] = await db
      .select({
        sessionId: sessions.id,
        userId: users.id,
        email: users.email,
        name: users.name,
        organizationId: users.organizationId,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          gt(sessions.expiresAt, new Date()),
          isNull(users.disabledAt),
        ),
      )
      .limit(1);

    if (!session) {
      if (request.url.startsWith('/api/v1/auth/')) return;
      clearSessionCookie(reply);
      return;
    }

    request.dockpilotUser = {
      id: session.userId,
      email: session.email,
      name: session.name,
      organizationId: session.organizationId,
      role: session.role,
    } satisfies SafeUser;
    request.sessionTokenHash = tokenHash;

    if (request.method === 'GET' && request.headers['cache-control'] !== 'no-store') {
      void db
        .update(sessions)
        .set({ lastSeenAt: new Date() })
        .where(eq(sessions.id, session.sessionId))
        .catch((error: unknown) => {
          request.log.error({ err: error }, 'Failed to update session activity');
        });
    }
  });
}
