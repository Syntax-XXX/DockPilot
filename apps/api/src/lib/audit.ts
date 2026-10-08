import type { DbExecutor } from '../db/index.js';
import { auditLogs } from '../db/schema.js';
import { redactRecord, redactText } from './redact.js';

export interface AuditEvent {
  organizationId: string;
  actorUserId?: string | null;
  aiCredentialId?: string | null;
  agentIdentity?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome?: 'success' | 'failure' | 'denied';
  toolName?: string | null;
  permissionUsed?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  approvalId?: string | null;
  errorCategory?: string | null;
  durationMs?: number | null;
  sourceIp?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  inputSummary?: Record<string, unknown> | null;
  resultSummary?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
}

export async function writeAuditEvent(executor: DbExecutor, event: AuditEvent): Promise<string> {
  const outcome = event.outcome ?? 'success';
  const [row] = await executor
    .insert(auditLogs)
    .values({
      organizationId: event.organizationId,
      actorUserId: event.actorUserId ?? null,
      aiCredentialId: event.aiCredentialId ?? null,
      agentIdentity: event.agentIdentity ?? null,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId ?? null,
      outcome,
      toolName: event.toolName ?? null,
      permissionUsed: event.permissionUsed ?? null,
      targetType: event.targetType ?? null,
      targetId: event.targetId ?? null,
      approvalId: event.approvalId ?? null,
      errorCategory:
        outcome === 'failure'
          ? (event.errorCategory ?? 'internal')
          : (event.errorCategory ?? (outcome === 'denied' ? 'authorization' : null)),
      durationMs: event.durationMs ?? null,
      sourceIp: event.sourceIp ?? null,
      userAgent:
        event.userAgent === null || event.userAgent === undefined
          ? null
          : redactText(event.userAgent, 255),
      correlationId: event.correlationId ?? null,
      inputSummary: redactRecord(event.inputSummary),
      resultSummary: redactRecord(event.resultSummary),
      metadata: redactRecord(event.metadata),
      requestId: event.requestId ?? null,
    })
    .returning({ id: auditLogs.id });

  if (!row) throw new Error('Audit event persistence failed.');
  return row.id;
}
