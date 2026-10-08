import { and, desc, eq, inArray } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { sessions, users } from '../db/schema.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { notFoundError, validationError } from '../lib/errors.js';
import type { SessionSummary } from '@dockpilot/shared';

export interface ListSessionsInput {
  organizationId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export interface RevokeSessionInput {
  organizationId: string;
  sessionId: string;
  executor?: DbExecutor;
}

export async function listSessions(
  input: ListSessionsInput,
): Promise<{ sessions: SessionSummary[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const rows = await executor
    .select({
      id: sessions.id,
      userId: sessions.userId,
      userEmail: users.email,
      createdAt: sessions.createdAt,
      expiresAt: sessions.expiresAt,
      lastSeenAt: sessions.lastSeenAt,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(users.organizationId, input.organizationId),
        keysetAfter(sessions.createdAt, sessions.id, cursor),
      ),
    )
    .orderBy(desc(sessions.createdAt), desc(sessions.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    sessions: page.map((row) => ({
      id: row.id,
      userId: row.userId,
      userEmail: row.userEmail,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
    })),
    nextCursor: overflow && last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
  };
}

export async function sessionExistsInOrganization(input: {
  organizationId: string;
  sessionId: string;
  executor?: DbExecutor;
}): Promise<boolean> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select({ id: sessions.id })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, input.sessionId), eq(users.organizationId, input.organizationId)))
    .limit(1);
  return rows.length > 0;
}

export async function revokeSession(input: RevokeSessionInput): Promise<{ id: string }> {
  const executor = input.executor ?? db;
  const deleted = await executor
    .delete(sessions)
    .where(
      and(
        eq(sessions.id, input.sessionId),
        inArray(
          sessions.userId,
          executor
            .select({ id: users.id })
            .from(users)
            .where(eq(users.organizationId, input.organizationId)),
        ),
      ),
    )
    .returning({ id: sessions.id });

  const row = deleted[0];
  if (!row) throw notFoundError('The session does not exist.');
  return { id: row.id };
}
