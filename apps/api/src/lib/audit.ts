import type { Database } from '../db/index.js';
import { auditLogs } from '../db/schema.js';

type AuditTransaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export interface AuditEvent {
  organizationId: string;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome?: 'success' | 'failure' | 'denied';
  metadata?: Record<string, unknown> | null;
  requestId?: string | null;
}

export async function writeAuditEvent(
  transaction: AuditTransaction,
  event: AuditEvent,
): Promise<void> {
  await transaction.insert(auditLogs).values({
    ...event,
    resourceId: event.resourceId ?? null,
    outcome: event.outcome ?? 'success',
    metadata: event.metadata ?? null,
    requestId: event.requestId ?? null,
  });
}
