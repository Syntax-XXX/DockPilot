import { and, desc, eq } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { users } from '../db/schema.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { validationError } from '../lib/errors.js';
import type { UserSummary } from '@dockpilot/shared';

export interface ListUsersInput {
  organizationId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listUsers(
  input: ListUsersInput,
): Promise<{ users: UserSummary[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const rows = await executor
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      disabledAt: users.disabledAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      and(
        eq(users.organizationId, input.organizationId),
        keysetAfter(users.createdAt, users.id, cursor),
      ),
    )
    .orderBy(desc(users.createdAt), desc(users.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    users: page.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      disabled: row.disabledAt !== null,
      createdAt: row.createdAt.toISOString(),
    })),
    nextCursor: overflow && last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
  };
}
