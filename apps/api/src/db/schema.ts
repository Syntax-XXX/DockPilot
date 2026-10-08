import {
  check,
  index,
  integer,
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

export const aiPermissionLevel = pgEnum('ai_permission_level', ['read', 'write', 'destructive']);

export const approvalStatus = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
  'expired',
  'executed',
  'failed',
]);

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

export const aiCredentials = pgTable(
  'ai_credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    name: varchar('name', { length: 80 }).notNull(),
    description: varchar('description', { length: 280 }),
    agentIdentity: varchar('agent_identity', { length: 120 }).notNull().default('unspecified'),
    permissionLevel: aiPermissionLevel('permission_level').notNull().default('read'),
    tokenPrefix: varchar('token_prefix', { length: 16 }).notNull(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true, mode: 'date' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    disabledAt: timestamp('disabled_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    uniqueIndex('ai_credentials_token_hash_uq').on(table.tokenHash),
    index('ai_credentials_organization_idx').on(table.organizationId),
    index('ai_credentials_active_idx').on(table.organizationId, table.revokedAt, table.disabledAt),
    check('ai_credentials_token_hash_hex_chk', sql`${table.tokenHash} ~ '^[a-f0-9]{64}$'`),
    check('ai_credentials_token_prefix_chk', sql`${table.tokenPrefix} ~ '^dpai_[A-Za-z0-9_-]{8}$'`),
  ],
);

export const aiApprovals = pgTable(
  'ai_approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    requestedByCredentialId: uuid('requested_by_credential_id')
      .notNull()
      .references(() => aiCredentials.id, { onDelete: 'restrict' }),
    toolName: varchar('tool_name', { length: 80 }).notNull(),
    actionType: varchar('action_type', { length: 60 }).notNull(),
    permissionLevel: aiPermissionLevel('permission_level').notNull(),
    targetType: varchar('target_type', { length: 40 }).notNull(),
    targetId: varchar('target_id', { length: 255 }).notNull(),
    arguments: jsonb('arguments').$type<Record<string, unknown>>().notNull(),
    justification: varchar('justification', { length: 500 }),
    status: approvalStatus('status').notNull().default('pending'),
    decidedByUserId: uuid('decided_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'date' }),
    decisionNote: varchar('decision_note', { length: 280 }),
    executionAuditEventId: uuid('execution_audit_event_id'),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('ai_approvals_pending_idx').on(table.organizationId, table.status, table.createdAt),
    index('ai_approvals_credential_idx').on(table.requestedByCredentialId, table.createdAt),
    index('ai_approvals_target_idx').on(table.targetType, table.targetId),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'restrict' }),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'restrict' }),
    aiCredentialId: uuid('ai_credential_id'),
    agentIdentity: varchar('agent_identity', { length: 120 }),
    action: varchar('action', { length: 100 }).notNull(),
    resourceType: varchar('resource_type', { length: 80 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 }),
    outcome: varchar('outcome', { length: 16 }).notNull().default('success'),
    toolName: varchar('tool_name', { length: 80 }),
    permissionUsed: varchar('permission_used', { length: 20 }),
    targetType: varchar('target_type', { length: 40 }),
    targetId: varchar('target_id', { length: 255 }),
    approvalId: uuid('approval_id'),
    errorCategory: varchar('error_category', { length: 40 }),
    durationMs: integer('duration_ms'),
    sourceIp: varchar('source_ip', { length: 64 }),
    userAgent: varchar('user_agent', { length: 255 }),
    correlationId: varchar('correlation_id', { length: 64 }),
    inputSummary: jsonb('input_summary').$type<Record<string, unknown> | null>(),
    resultSummary: jsonb('result_summary').$type<Record<string, unknown> | null>(),
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    requestId: varchar('request_id', { length: 255 }),
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_organization_time_idx').on(table.organizationId, table.occurredAt),
    index('audit_logs_correlation_idx').on(table.correlationId),
    index('audit_logs_ai_credential_time_idx').on(table.aiCredentialId, table.occurredAt),
    index('audit_logs_tool_time_idx').on(table.toolName, table.occurredAt),
    index('audit_logs_outcome_time_idx').on(table.outcome, table.occurredAt),
    index('audit_logs_target_idx').on(table.targetType, table.targetId),
    check('audit_logs_outcome_chk', sql`${table.outcome} IN ('success', 'failure', 'denied')`),
    check(
      'audit_logs_outcome_error_chk',
      sql`${table.outcome} <> 'failure' OR ${table.errorCategory} IS NOT NULL`,
    ),
  ],
);
