import { z } from 'zod';
import { emailSchema, idSchema, memberRoleSchema } from './primitives.js';

export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const aiPermissionLevelSchema = z.enum(['read', 'write', 'destructive']);
export const aiPermissionLevels = ['read', 'write', 'destructive'] as const;

export const auditOutcomeSchema = z.enum(['success', 'failure', 'denied']);
export const approvalStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'expired',
  'executed',
  'failed',
]);

export const auditErrorCategorySchema = z.enum([
  'none',
  'authentication',
  'authorization',
  'validation',
  'not_found',
  'conflict',
  'rate_limited',
  'approval_required',
  'internal',
]);

export const aiCredentialViewSchema = z
  .object({
    id: idSchema,
    name: z.string(),
    description: z.string().nullable(),
    agentIdentity: z.string(),
    permissionLevel: aiPermissionLevelSchema,
    tokenPrefix: z.string(),
    createdByUserId: idSchema.nullable(),
    createdAt: isoDateTimeSchema,
    lastUsedAt: isoDateTimeSchema.nullable(),
    expiresAt: isoDateTimeSchema.nullable(),
    revokedAt: isoDateTimeSchema.nullable(),
    disabledAt: isoDateTimeSchema.nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
  })
  .strict();

export const createAiCredentialInputSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(280).optional(),
    agentIdentity: z.string().trim().min(1).max(120).optional(),
    permissionLevel: aiPermissionLevelSchema,
    expiresInDays: z.number().int().min(1).max(365).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const createAiCredentialResponseSchema = z
  .object({
    credential: aiCredentialViewSchema,
    token: z.string(),
  })
  .strict();

export const aiCredentialListResponseSchema = z
  .object({
    credentials: z.array(aiCredentialViewSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const revokeAiCredentialResponseSchema = z
  .object({
    credential: aiCredentialViewSchema,
  })
  .strict();

export const disableAiCredentialResponseSchema = z
  .object({
    credential: aiCredentialViewSchema,
  })
  .strict();

export const enableAiCredentialResponseSchema = z
  .object({
    credential: aiCredentialViewSchema,
  })
  .strict();

export const rotateAiCredentialResponseSchema = z
  .object({
    credential: aiCredentialViewSchema,
    token: z.string(),
  })
  .strict();

export const systemStatusSchema = z
  .object({
    setupRequired: z.boolean(),
    service: z.literal('dockpilot-api'),
    protocolVersion: z.literal(1),
    database: z.literal('reachable'),
    mcpEnabled: z.boolean(),
    counts: z
      .object({
        users: z.number().int().nonnegative(),
        activeSessions: z.number().int().nonnegative(),
        activeAiCredentials: z.number().int().nonnegative(),
        revokedAiCredentials: z.number().int().nonnegative(),
        pendingApprovals: z.number().int().nonnegative(),
        auditEvents24h: z.number().int().nonnegative(),
      })
      .strict(),
    serverTime: isoDateTimeSchema,
  })
  .strict();

export const userSummarySchema = z
  .object({
    id: idSchema,
    email: emailSchema,
    name: z.string(),
    role: memberRoleSchema,
    disabled: z.boolean(),
    createdAt: isoDateTimeSchema,
  })
  .strict();

export const sessionSummarySchema = z
  .object({
    id: idSchema,
    userId: idSchema,
    userEmail: emailSchema,
    createdAt: isoDateTimeSchema,
    expiresAt: isoDateTimeSchema,
    lastSeenAt: isoDateTimeSchema,
  })
  .strict();

export const auditEventSchema = z
  .object({
    id: idSchema,
    occurredAt: isoDateTimeSchema,
    outcome: auditOutcomeSchema,
    action: z.string(),
    resourceType: z.string(),
    resourceId: z.string().nullable(),
    correlationId: z.string().nullable(),
    aiCredentialId: idSchema.nullable(),
    aiCredentialName: z.string().nullable(),
    agentIdentity: z.string().nullable(),
    toolName: z.string().nullable(),
    permissionUsed: z.string().nullable(),
    targetType: z.string().nullable(),
    targetId: z.string().nullable(),
    approvalId: idSchema.nullable(),
    durationMs: z.number().int().nonnegative().nullable(),
    sourceIp: z.string().nullable(),
    userAgent: z.string().nullable(),
    actorUserId: idSchema.nullable(),
    errorCategory: z.string().nullable(),
    inputSummary: z.record(z.string(), z.unknown()).nullable(),
    resultSummary: z.record(z.string(), z.unknown()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
  })
  .strict();

export const auditEventListResponseSchema = z
  .object({
    events: z.array(auditEventSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const auditEventQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    cursor: z.string().max(256).optional(),
    aiCredentialId: idSchema.optional(),
    toolName: z.string().max(80).optional(),
    action: z.string().max(100).optional(),
    outcome: auditOutcomeSchema.optional(),
    targetType: z.string().max(40).optional(),
    targetId: z.string().max(255).optional(),
    from: isoDateTimeSchema.optional(),
    to: isoDateTimeSchema.optional(),
  })
  .strict();

export const approvalViewSchema = z
  .object({
    id: idSchema,
    toolName: z.string(),
    actionType: z.string(),
    permissionLevel: aiPermissionLevelSchema,
    targetType: z.string(),
    targetId: z.string(),
    arguments: z.record(z.string(), z.unknown()),
    justification: z.string().nullable(),
    status: approvalStatusSchema,
    requestedByCredentialId: idSchema.nullable(),
    requestedByCredentialName: z.string().nullable(),
    requestedByAgentIdentity: z.string().nullable(),
    decidedByUserId: idSchema.nullable(),
    decidedAt: isoDateTimeSchema.nullable(),
    decisionNote: z.string().nullable(),
    executionAuditEventId: idSchema.nullable(),
    expiresAt: isoDateTimeSchema,
    createdAt: isoDateTimeSchema,
  })
  .strict();

export const approvalListResponseSchema = z
  .object({
    approvals: z.array(approvalViewSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const approvalDecisionInputSchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    note: z.string().trim().max(280).optional(),
  })
  .strict();

export const approvalDecisionResponseSchema = z
  .object({
    approval: approvalViewSchema,
  })
  .strict();

export const approvalRequestResponseSchema = z
  .object({
    approval: approvalViewSchema,
  })
  .strict();

export type AiPermissionLevel = z.infer<typeof aiPermissionLevelSchema>;
export type AiCredentialView = z.infer<typeof aiCredentialViewSchema>;
export type CreateAiCredentialInput = z.infer<typeof createAiCredentialInputSchema>;
export type CreateAiCredentialResponse = z.infer<typeof createAiCredentialResponseSchema>;
export type SystemStatus = z.infer<typeof systemStatusSchema>;
export type UserSummary = z.infer<typeof userSummarySchema>;
export type SessionSummary = z.infer<typeof sessionSummarySchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type AuditEventQuery = z.infer<typeof auditEventQuerySchema>;
export type AuditOutcome = z.infer<typeof auditOutcomeSchema>;
export type AuditErrorCategory = z.infer<typeof auditErrorCategorySchema>;
export type ApprovalView = z.infer<typeof approvalViewSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionInputSchema>;

export const hostStatusSchema = z.enum(['healthy', 'unhealthy', 'disabled', 'error']);

export const hostViewSchema = z
  .object({
    id: idSchema,
    organizationId: idSchema,
    createdByUserId: idSchema.nullable(),
    name: z.string(),
    description: z.string().nullable(),
    endpoint: z.string(),
    status: hostStatusSchema,
    lastErrorAt: isoDateTimeSchema.nullable(),
    lastError: z.string().nullable(),
    dockerVersion: z.string().nullable(),
    labels: z.record(z.string(), z.string()).nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    lastSeenAt: isoDateTimeSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .strict();

export const createHostInputSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(280).optional(),
    endpoint: z.string().trim().min(1).max(255),
    labels: z.record(z.string(), z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const createHostResponseSchema = z
  .object({
    host: hostViewSchema,
    token: z.string(),
  })
  .strict();

export const hostListResponseSchema = z
  .object({
    hosts: z.array(hostViewSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const updateHostInputSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(280).nullable().optional(),
    endpoint: z.string().trim().min(1).max(255).optional(),
    labels: z.record(z.string(), z.string()).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const updateHostResponseSchema = z
  .object({
    host: hostViewSchema,
  })
  .strict();

export const containerStateSchema = z.enum([
  'created',
  'running',
  'paused',
  'restarting',
  'removing',
  'exited',
  'dead',
  'unknown',
]);

export const containerViewSchema = z
  .object({
    id: idSchema,
    hostId: idSchema,
    containerId: z.string(),
    shortId: z.string().nullable(),
    name: z.string().nullable(),
    image: z.string(),
    state: containerStateSchema,
    status: z.string(),
    created: z.string(),
    labels: z.record(z.string(), z.string()).nullable(),
    ports: z.array(z.unknown()).nullable(),
    syncedAt: isoDateTimeSchema,
  })
  .strict();

export const containerLogViewSchema = z
  .object({
    log: z.string(),
    tty: z.boolean(),
    tail: z.number().int().min(1).max(1000),
  })
  .strict();

export const containerListResponseSchema = z
  .object({
    containers: z.array(containerViewSchema),
    nextCursor: z.string().nullable(),
  })
  .strict();

export const containerLogResponseSchema = z
  .object({
    log: containerLogViewSchema,
  })
  .strict();

export const containerViewResponseSchema = z
  .object({
    container: containerViewSchema,
  })
  .strict();

export const containerActionResponseSchema = z
  .object({
    container: containerViewSchema,
  })
  .strict();

export type HostView = z.infer<typeof hostViewSchema>;
export type HostStatus = z.infer<typeof hostStatusSchema>;
export type CreateHostInput = z.infer<typeof createHostInputSchema>;
export type CreateHostResponse = z.infer<typeof createHostResponseSchema>;
export type UpdateHostInput = z.infer<typeof updateHostInputSchema>;
export type HostListResponse = z.infer<typeof hostListResponseSchema>;
export type ContainerView = z.infer<typeof containerViewSchema>;
export type ContainerLogView = z.infer<typeof containerLogViewSchema>;
export type ContainerListResponse = z.infer<typeof containerListResponseSchema>;
