import { and, desc, eq, inArray, lte, sql } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { aiApprovals, aiCredentials, auditLogs } from '../db/schema.js';
import { writeAuditEvent } from '../lib/audit.js';
import { conflictError, internalError, notFoundError, validationError } from '../lib/errors.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { revokeAiCredential } from './ai-credentials.js';
import { revokeSession } from './sessions.js';
import { removeHost } from './hosts.js';
import { removeContainer } from './containers.js';
import type { AiPermissionLevel, ApprovalStatus, ApprovalView } from '@dockpilot/shared';

export const approvalLifetimeMs = 60 * 60 * 1000;

const approvalColumns = {
  id: aiApprovals.id,
  toolName: aiApprovals.toolName,
  actionType: aiApprovals.actionType,
  permissionLevel: aiApprovals.permissionLevel,
  targetType: aiApprovals.targetType,
  targetId: aiApprovals.targetId,
  arguments: aiApprovals.arguments,
  justification: aiApprovals.justification,
  status: aiApprovals.status,
  requestedByCredentialId: aiApprovals.requestedByCredentialId,
  requestedByCredentialName: aiCredentials.name,
  requestedByAgentIdentity: aiCredentials.agentIdentity,
  decidedByUserId: aiApprovals.decidedByUserId,
  decidedAt: aiApprovals.decidedAt,
  decisionNote: aiApprovals.decisionNote,
  executionAuditEventId: aiApprovals.executionAuditEventId,
  expiresAt: aiApprovals.expiresAt,
  createdAt: aiApprovals.createdAt,
};

interface ApprovalRow {
  id: string;
  toolName: string;
  actionType: string;
  permissionLevel: AiPermissionLevel;
  targetType: string;
  targetId: string;
  arguments: Record<string, unknown>;
  justification: string | null;
  status: ApprovalStatus;
  requestedByCredentialId: string | null;
  requestedByCredentialName: string | null;
  requestedByAgentIdentity: string | null;
  decidedByUserId: string | null;
  decidedAt: Date | null;
  decisionNote: string | null;
  executionAuditEventId: string | null;
  expiresAt: Date;
  createdAt: Date;
}

function toView(row: ApprovalRow): ApprovalView {
  return {
    id: row.id,
    toolName: row.toolName,
    actionType: row.actionType,
    permissionLevel: row.permissionLevel,
    targetType: row.targetType,
    targetId: row.targetId,
    arguments: row.arguments,
    justification: row.justification,
    status: row.status,
    requestedByCredentialId: row.requestedByCredentialId,
    requestedByCredentialName: row.requestedByCredentialName,
    requestedByAgentIdentity: row.requestedByAgentIdentity,
    decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    decisionNote: row.decisionNote,
    executionAuditEventId: row.executionAuditEventId,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

async function loadApproval(
  executor: DbExecutor,
  organizationId: string,
  approvalId: string,
): Promise<ApprovalView> {
  const rows = await executor
    .select(approvalColumns)
    .from(aiApprovals)
    .leftJoin(aiCredentials, eq(aiCredentials.id, aiApprovals.requestedByCredentialId))
    .where(and(eq(aiApprovals.id, approvalId), eq(aiApprovals.organizationId, organizationId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw notFoundError('The approval request does not exist.');
  return toView(row);
}

export interface CreateApprovalInput {
  organizationId: string;
  requestedByCredentialId: string | null;
  toolName: string;
  actionType: string;
  permissionLevel: AiPermissionLevel;
  targetType: string;
  targetId: string;
  args: Record<string, unknown>;
  justification: string;
  executor?: DbExecutor;
}

export async function createApproval(input: CreateApprovalInput): Promise<ApprovalView> {
  const executor = input.executor ?? db;
  const expiresAt = new Date(Date.now() + approvalLifetimeMs);
  const inserted = await executor
    .insert(aiApprovals)
    .values({
      organizationId: input.organizationId,
      requestedByCredentialId: input.requestedByCredentialId,
      toolName: input.toolName,
      actionType: input.actionType,
      permissionLevel: input.permissionLevel,
      targetType: input.targetType,
      targetId: input.targetId,
      arguments: input.args,
      justification: input.justification,
      expiresAt,
    })
    .returning({ id: aiApprovals.id });

  const row = inserted[0];
  if (!row) throw internalError('The approval request could not be created.');
  return loadApproval(executor, input.organizationId, row.id);
}

export interface ListApprovalsInput {
  organizationId: string;
  status?: ApprovalStatus | undefined;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listApprovals(
  input: ListApprovalsInput,
): Promise<{ approvals: ApprovalView[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');
  await expireStaleApprovals(input.organizationId, executor);

  const rows = await executor
    .select(approvalColumns)
    .from(aiApprovals)
    .leftJoin(aiCredentials, eq(aiCredentials.id, aiApprovals.requestedByCredentialId))
    .where(
      and(
        eq(aiApprovals.organizationId, input.organizationId),
        input.status ? eq(aiApprovals.status, input.status) : undefined,
        keysetAfter(aiApprovals.createdAt, aiApprovals.id, cursor),
      ),
    )
    .orderBy(desc(aiApprovals.createdAt), desc(aiApprovals.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    approvals: page.map(toView),
    nextCursor: overflow && last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
  };
}

export async function expireStaleApprovals(
  organizationId: string,
  executor: DbExecutor = db,
): Promise<void> {
  const expired = await executor
    .update(aiApprovals)
    .set({ status: 'expired' })
    .where(
      and(
        eq(aiApprovals.organizationId, organizationId),
        eq(aiApprovals.status, 'pending'),
        lte(aiApprovals.expiresAt, new Date()),
      ),
    )
    .returning({ id: aiApprovals.id });

  if (expired.length === 0) return;
  await executor.insert(auditLogs).values(
    expired.map((approval) => ({
      organizationId,
      action: 'approval.expired',
      resourceType: 'ai_approval',
      resourceId: approval.id,
      outcome: 'success' as const,
      targetType: 'ai_approval',
      targetId: approval.id,
    })),
  );
}

export interface DecideApprovalInput {
  organizationId: string;
  approvalId: string;
  decidedByUserId: string;
  decision: 'approve' | 'reject';
  note?: string | undefined;
}

type DecisionOutcome =
  | { kind: 'expired' }
  | { kind: 'failed'; cause: unknown }
  | { kind: 'decided'; approval: ApprovalView };

export async function decideApproval(input: DecideApprovalInput): Promise<ApprovalView> {
  const outcome = await db.transaction<DecisionOutcome>(async (transaction) => {
    const locked = await transaction
      .select({
        id: aiApprovals.id,
        status: aiApprovals.status,
        actionType: aiApprovals.actionType,
        targetType: aiApprovals.targetType,
        targetId: aiApprovals.targetId,
        toolName: aiApprovals.toolName,
        requestedByCredentialId: aiApprovals.requestedByCredentialId,
        expiresAt: aiApprovals.expiresAt,
      })
      .from(aiApprovals)
      .where(
        and(
          eq(aiApprovals.id, input.approvalId),
          eq(aiApprovals.organizationId, input.organizationId),
        ),
      )
      .limit(1)
      .for('update');

    const approval = locked[0];
    if (!approval) throw notFoundError('The approval request does not exist.');
    if (approval.status !== 'pending') {
      throw conflictError('This approval request has already been decided.');
    }

    let agentIdentity: string | null = null;
    if (approval.requestedByCredentialId !== null) {
      const credentialRows = await transaction
        .select({ agentIdentity: aiCredentials.agentIdentity })
        .from(aiCredentials)
        .where(eq(aiCredentials.id, approval.requestedByCredentialId))
        .limit(1);
      agentIdentity = credentialRows[0]?.agentIdentity ?? null;
    }

    const now = new Date();
    if (approval.expiresAt.getTime() <= now.getTime()) {
      await transaction
        .update(aiApprovals)
        .set({ status: 'expired' })
        .where(eq(aiApprovals.id, approval.id));
      await writeAuditEvent(transaction, {
        organizationId: input.organizationId,
        actorUserId: input.decidedByUserId,
        aiCredentialId: approval.requestedByCredentialId,
        agentIdentity,
        action: 'approval.expired',
        resourceType: 'ai_approval',
        resourceId: approval.id,
        outcome: 'failure',
        toolName: approval.toolName,
        targetType: approval.targetType,
        targetId: approval.targetId,
        approvalId: approval.id,
        errorCategory: 'conflict',
      });
      return { kind: 'expired' };
    }

    if (input.decision === 'reject') {
      await transaction
        .update(aiApprovals)
        .set({
          status: 'rejected',
          decidedByUserId: input.decidedByUserId,
          decidedAt: now,
          decisionNote: input.note ?? null,
        })
        .where(eq(aiApprovals.id, approval.id));
      await writeAuditEvent(transaction, {
        organizationId: input.organizationId,
        actorUserId: input.decidedByUserId,
        aiCredentialId: approval.requestedByCredentialId,
        agentIdentity,
        action: 'approval.rejected',
        resourceType: 'ai_approval',
        resourceId: approval.id,
        outcome: 'denied',
        toolName: approval.toolName,
        targetType: approval.targetType,
        targetId: approval.targetId,
        approvalId: approval.id,
      });
      return {
        kind: 'decided',
        approval: await loadApproval(transaction, input.organizationId, approval.id),
      };
    }

    let execution: { action: string; resourceType: string; summary: Record<string, unknown> };
    try {
      execution = await executeApprovedAction(transaction, {
        organizationId: input.organizationId,
        actionType: approval.actionType,
        targetId: approval.targetId,
      });
    } catch (error) {
      await transaction
        .update(aiApprovals)
        .set({
          status: 'failed',
          decidedByUserId: input.decidedByUserId,
          decidedAt: now,
          decisionNote: input.note ?? null,
        })
        .where(eq(aiApprovals.id, approval.id));
      await writeAuditEvent(transaction, {
        organizationId: input.organizationId,
        actorUserId: input.decidedByUserId,
        aiCredentialId: approval.requestedByCredentialId,
        agentIdentity,
        action: 'approval.execution_failed',
        resourceType: 'ai_approval',
        resourceId: approval.id,
        outcome: 'failure',
        toolName: approval.toolName,
        targetType: approval.targetType,
        targetId: approval.targetId,
        approvalId: approval.id,
        errorCategory: 'internal',
        metadata: { actionType: approval.actionType },
      });
      return { kind: 'failed', cause: error };
    }

    const auditEventId = await writeAuditEvent(transaction, {
      organizationId: input.organizationId,
      actorUserId: input.decidedByUserId,
      aiCredentialId: approval.requestedByCredentialId,
      agentIdentity,
      action: execution.action,
      resourceType: execution.resourceType,
      resourceId: approval.targetId,
      outcome: 'success',
      toolName: approval.toolName,
      targetType: approval.targetType,
      targetId: approval.targetId,
      approvalId: approval.id,
      permissionUsed: 'destructive',
      resultSummary: execution.summary,
      metadata: { actionType: approval.actionType, decisionNote: input.note ?? null },
    });

    await transaction
      .update(aiApprovals)
      .set({
        status: 'executed',
        decidedByUserId: input.decidedByUserId,
        decidedAt: now,
        decisionNote: input.note ?? null,
        executionAuditEventId: auditEventId,
      })
      .where(eq(aiApprovals.id, approval.id));

    return {
      kind: 'decided',
      approval: await loadApproval(transaction, input.organizationId, approval.id),
    };
  });

  if (outcome.kind === 'expired') throw conflictError('This approval request has expired.');
  if (outcome.kind === 'failed') {
    throw internalError('The approved action could not be executed.', outcome.cause);
  }
  return outcome.approval;
}

async function executeApprovedAction(
  transaction: DbExecutor,
  input: { organizationId: string; actionType: string; targetId: string },
): Promise<{ action: string; resourceType: string; summary: Record<string, unknown> }> {
  switch (input.actionType) {
    case 'session.revoke': {
      const result = await revokeSession({
        organizationId: input.organizationId,
        sessionId: input.targetId,
        executor: transaction,
      });
      return {
        action: 'session.revoked',
        resourceType: 'session',
        summary: { sessionId: result.id },
      };
    }
    case 'ai_credential.revoke': {
      const result = await revokeAiCredential({
        organizationId: input.organizationId,
        credentialId: input.targetId,
        executor: transaction,
      });
      return {
        action: 'ai_credential.revoked',
        resourceType: 'ai_credential',
        summary: { credentialId: result.id },
      };
    }
    case 'host.remove': {
      await removeHost({
        organizationId: input.organizationId,
        hostId: input.targetId,
        executor: transaction,
      });
      return {
        action: 'host.removed',
        resourceType: 'host',
        summary: { hostId: input.targetId },
      };
    }
    case 'container.remove': {
      await removeContainer({
        organizationId: input.organizationId,
        containerId: input.targetId,
        executor: transaction,
      });
      return {
        action: 'container.removed',
        resourceType: 'container',
        summary: { containerId: input.targetId },
      };
    }
    default:
      throw conflictError('This approval action type cannot be executed.');
  }
}

export async function countPendingApprovals(
  organizationId: string,
  executor: DbExecutor = db,
): Promise<number> {
  const rows = await executor
    .select({ total: sql<number>`count(*)::int` })
    .from(aiApprovals)
    .where(and(eq(aiApprovals.organizationId, organizationId), eq(aiApprovals.status, 'pending')));
  return rows[0]?.total ?? 0;
}

export async function listPendingApprovalIdsForCredential(
  organizationId: string,
  credentialId: string,
  executor: DbExecutor = db,
): Promise<string[]> {
  const rows = await executor
    .select({ id: aiApprovals.id })
    .from(aiApprovals)
    .where(
      and(
        eq(aiApprovals.organizationId, organizationId),
        eq(aiApprovals.requestedByCredentialId, credentialId),
        inArray(aiApprovals.status, ['pending']),
      ),
    );
  return rows.map((row) => row.id);
}
