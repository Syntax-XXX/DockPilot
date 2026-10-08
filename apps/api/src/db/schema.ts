import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const memberRole = pgEnum('member_role', ['owner', 'admin', 'operator', 'viewer']);

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 254 }).notNull(),
    emailNormalized: varchar('email_normalized', { length: 254 }).notNull(),
    passwordHash: varchar('password_hash', { length: 512 }).notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    role: memberRole('role').notNull().default('viewer'),
    disabledAt: timestamp('disabled_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_email_normalized_uq').on(table.emailNormalized),
    index('users_organization_idx').on(table.organizationId),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_uq').on(table.tokenHash),
    index('sessions_user_expiry_idx').on(table.userId, table.expiresAt),
    check('sessions_token_hash_hex_chk', sql`${table.tokenHash} ~ '^[a-f0-9]{64}$'`),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    resourceType: varchar('resource_type', { length: 80 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 }),
    outcome: varchar('outcome', { length: 16 }).notNull().default('success'),
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    requestId: varchar('request_id', { length: 255 }),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_organization_time_idx').on(table.organizationId, table.occurredAt),
    check('audit_logs_outcome_chk', sql`${table.outcome} IN ('success', 'failure', 'denied')`),
  ],
);
