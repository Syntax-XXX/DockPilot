import { and, desc, eq, gte, lte, type SQL } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { aiCredentials, auditLogs } from '../db/schema.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { notFoundError, validationError } from '../lib/errors.js';
import type { AuditEvent, AuditEventQuery } from '@dockpilot/shared';

export interface ListAuditEventsInput extends AuditEventQuery {
  organizationId: string;
  executor?: DbExecutor;
}

interface AuditRow {
  id: string;
  occurredAt: Date;
  outcome: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  correlationId: string | null;
  aiCredentialId: string | null;
  aiCredentialName: string | null;
  agentIdentity: string | null;
  toolName: string | null;
  permissionUsed: string | null;
  targetType: string | null;
  targetId: string | null;
  approvalId: string | null;
  durationMs: number | null;
  sourceIp: string | null;
  userAgent: string | null;
  actorUserId: string | null;
  errorCategory: string | null;
  inputSummary: Record<string, unknown> | null;
  resultSummary: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

const auditColumns = {
  id: auditLogs.id,
  occurredAt: auditLogs.occurredAt,
  outcome: auditLogs.outcome,
  action: auditLogs.action,
  resourceType: auditLogs.resourceType,
  resourceId: auditLogs.resourceId,
  correlationId: auditLogs.correlationId,
  aiCredentialId: auditLogs.aiCredentialId,
  aiCredentialName: aiCredentials.name,
  agentIdentity: auditLogs.agentIdentity,
  toolName: auditLogs.toolName,
  permissionUsed: auditLogs.permissionUsed,
  targetType: auditLogs.targetType,
  targetId: auditLogs.targetId,
  approvalId: auditLogs.approvalId,
  durationMs: auditLogs.durationMs,
  sourceIp: auditLogs.sourceIp,
  userAgent: auditLogs.userAgent,
  actorUserId: auditLogs.actorUserId,
  errorCategory: auditLogs.errorCategory,
  inputSummary: auditLogs.inputSummary,
  resultSummary: auditLogs.resultSummary,
  metadata: auditLogs.metadata,
};

function toEvent(row: AuditRow): AuditEvent {
  return {
    id: row.id,
    occurredAt: row.occurredAt.toISOString(),
    outcome: row.outcome === 'failure' || row.outcome === 'denied' ? row.outcome : 'success',
    action: row.action,
    resourceType: row.resourceType,
    resourceId: row.resourceId,
    correlationId: row.correlationId,
    aiCredentialId: row.aiCredentialId,
    aiCredentialName: row.aiCredentialName,
    agentIdentity: row.agentIdentity,
    toolName: row.toolName,
    permissionUsed: row.permissionUsed,
    targetType: row.targetType,
    targetId: row.targetId,
    approvalId: row.approvalId,
    durationMs: row.durationMs,
    sourceIp: row.sourceIp,
    userAgent: row.userAgent,
    actorUserId: row.actorUserId,
    errorCategory: row.errorCategory,
    inputSummary: row.inputSummary,
    resultSummary: row.resultSummary,
    metadata: row.metadata,
  };
}

export async function listAuditEvents(
  input: ListAuditEventsInput,
): Promise<{ events: AuditEvent[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const filters: (SQL | undefined)[] = [
    eq(auditLogs.organizationId, input.organizationId),
    input.toolName ? eq(auditLogs.toolName, input.toolName) : undefined,
    input.action ? eq(auditLogs.action, input.action) : undefined,
    input.outcome ? eq(auditLogs.outcome, input.outcome) : undefined,
    input.aiCredentialId ? eq(auditLogs.aiCredentialId, input.aiCredentialId) : undefined,
    input.targetType ? eq(auditLogs.targetType, input.targetType) : undefined,
    input.targetId ? eq(auditLogs.targetId, input.targetId) : undefined,
    input.from ? gte(auditLogs.occurredAt, new Date(input.from)) : undefined,
    input.to ? lte(auditLogs.occurredAt, new Date(input.to)) : undefined,
    keysetAfter(auditLogs.occurredAt, auditLogs.id, cursor),
  ];

  const rows = await executor
    .select(auditColumns)
    .from(auditLogs)
    .leftJoin(aiCredentials, eq(aiCredentials.id, auditLogs.aiCredentialId))
    .where(and(...filters))
    .orderBy(desc(auditLogs.occurredAt), desc(auditLogs.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    events: page.map(toEvent),
    nextCursor: overflow && last ? encodeCursor([last.occurredAt.toISOString(), last.id]) : null,
  };
}

export async function getAuditEvent(input: {
  organizationId: string;
  eventId: string;
  executor?: DbExecutor;
}): Promise<AuditEvent> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select(auditColumns)
    .from(auditLogs)
    .leftJoin(aiCredentials, eq(aiCredentials.id, auditLogs.aiCredentialId))
    .where(and(eq(auditLogs.id, input.eventId), eq(auditLogs.organizationId, input.organizationId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw notFoundError('The audit event does not exist.');
  return toEvent(row);
}
