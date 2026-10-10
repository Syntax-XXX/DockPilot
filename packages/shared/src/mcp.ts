import { z } from 'zod';
import type { AiPermissionLevel } from './control.js';

export const mcpContractVersion = 1;
export const mcpServerName = 'dockpilot';
export const mcpServerVersion = '0.2.0';

export const mcpRateCategorySchema = z.enum(['read', 'write', 'destructive']);
export type McpRateCategory = z.infer<typeof mcpRateCategorySchema>;

const boundedLimit = z.number().int().min(1).max(100);

export const mcpToolOutputSchemas = {
  dockpilot_health: z.strictObject({
    status: z.literal('ok'),
    service: z.literal('dockpilot-api'),
    protocolVersion: z.literal(1),
    mcpContractVersion: z.literal(mcpContractVersion),
    database: z.literal('reachable'),
    serverTime: z.string(),
  }),
  dockpilot_system_status: z.strictObject({
    setupRequired: z.boolean(),
    organizationId: z.string(),
    mcpEnabled: z.boolean(),
    users: z.number().int().nonnegative(),
    activeSessions: z.number().int().nonnegative(),
    activeAiCredentials: z.number().int().nonnegative(),
    revokedAiCredentials: z.number().int().nonnegative(),
    pendingApprovals: z.number().int().nonnegative(),
    auditEvents24h: z.number().int().nonnegative(),
    serverTime: z.string(),
  }),
  dockpilot_list_users: z.strictObject({
    users: z.array(
      z.strictObject({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.string(),
        disabled: z.boolean(),
        createdAt: z.string(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_list_sessions: z.strictObject({
    sessions: z.array(
      z.strictObject({
        id: z.string(),
        userId: z.string(),
        userEmail: z.string(),
        createdAt: z.string(),
        expiresAt: z.string(),
        lastSeenAt: z.string(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_list_ai_credentials: z.strictObject({
    credentials: z.array(
      z.strictObject({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        agentIdentity: z.string(),
        permissionLevel: z.string(),
        tokenPrefix: z.string(),
        createdAt: z.string(),
        lastUsedAt: z.string().nullable(),
        expiresAt: z.string().nullable(),
        revokedAt: z.string().nullable(),
        disabledAt: z.string().nullable(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_list_audit_events: z.strictObject({
    events: z.array(
      z.strictObject({
        id: z.string(),
        occurredAt: z.string(),
        outcome: z.string(),
        action: z.string(),
        toolName: z.string().nullable(),
        agentIdentity: z.string().nullable(),
        aiCredentialId: z.string().nullable(),
        targetType: z.string().nullable(),
        targetId: z.string().nullable(),
        correlationId: z.string().nullable(),
        durationMs: z.number().int().nonnegative().nullable(),
        approvalId: z.string().nullable(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_get_audit_event: z.strictObject({
    event: z.strictObject({
      id: z.string(),
      occurredAt: z.string(),
      outcome: z.string(),
      action: z.string(),
      resourceType: z.string(),
      resourceId: z.string().nullable(),
      correlationId: z.string().nullable(),
      aiCredentialId: z.string().nullable(),
      agentIdentity: z.string().nullable(),
      toolName: z.string().nullable(),
      permissionUsed: z.string().nullable(),
      targetType: z.string().nullable(),
      targetId: z.string().nullable(),
      approvalId: z.string().nullable(),
      durationMs: z.number().int().nonnegative().nullable(),
      errorCategory: z.string().nullable(),
      inputSummary: z.record(z.string(), z.unknown()).nullable(),
      resultSummary: z.record(z.string(), z.unknown()).nullable(),
    }),
  }),
  dockpilot_list_approvals: z.strictObject({
    approvals: z.array(
      z.strictObject({
        id: z.string(),
        toolName: z.string(),
        actionType: z.string(),
        targetType: z.string(),
        targetId: z.string(),
        status: z.string(),
        justification: z.string().nullable(),
        createdAt: z.string(),
        expiresAt: z.string(),
        decidedAt: z.string().nullable(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_update_my_credential: z.strictObject({
    credential: z.strictObject({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      agentIdentity: z.string(),
      permissionLevel: z.string(),
    }),
  }),
  dockpilot_request_session_revocation: z.strictObject({
    approvalRequired: z.literal(true),
    approvalId: z.string(),
    status: z.literal('pending'),
    targetType: z.literal('session'),
    targetId: z.string(),
    expiresAt: z.string(),
  }),
  dockpilot_request_credential_revocation: z.strictObject({
    approvalRequired: z.literal(true),
    approvalId: z.string(),
    status: z.literal('pending'),
    targetType: z.literal('ai_credential'),
    targetId: z.string(),
    expiresAt: z.string(),
  }),
  dockpilot_list_hosts: z.strictObject({
    hosts: z.array(
      z.strictObject({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        endpoint: z.string(),
        status: z.string(),
        dockerVersion: z.string().nullable(),
        lastError: z.string().nullable(),
        lastErrorAt: z.string().nullable(),
        lastSeenAt: z.string().nullable(),
        createdAt: z.string(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_get_host: z.strictObject({
    host: z.strictObject({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      endpoint: z.string(),
      status: z.string(),
      dockerVersion: z.string().nullable(),
      lastError: z.string().nullable(),
      lastErrorAt: z.string().nullable(),
      lastSeenAt: z.string().nullable(),
      createdAt: z.string(),
    }),
  }),
  dockpilot_list_containers: z.strictObject({
    containers: z.array(
      z.strictObject({
        id: z.string(),
        hostId: z.string(),
        containerId: z.string(),
        shortId: z.string().nullable(),
        name: z.string().nullable(),
        image: z.string(),
        state: z.string(),
        status: z.string(),
        syncedAt: z.string(),
      }),
    ),
    nextCursor: z.string().nullable(),
  }),
  dockpilot_get_container_logs: z.strictObject({
    log: z.strictObject({
      log: z.string(),
      tty: z.boolean(),
      tail: z.number().int().min(1).max(1000),
    }),
  }),
  dockpilot_sync_host_containers: z.strictObject({
    synced: z.number().int().nonnegative(),
  }),
  dockpilot_create_host: z.strictObject({
    host: z.strictObject({
      id: z.string(),
      name: z.string(),
      endpoint: z.string(),
      status: z.string(),
      dockerVersion: z.string().nullable(),
    }),
  }),
  dockpilot_update_host: z.strictObject({
    host: z.strictObject({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      endpoint: z.string(),
      status: z.string(),
      dockerVersion: z.string().nullable(),
    }),
  }),
  dockpilot_set_container_state: z.strictObject({
    container: z.strictObject({
      id: z.string(),
      hostId: z.string(),
      containerId: z.string(),
      name: z.string().nullable(),
      image: z.string(),
      state: z.string(),
      status: z.string(),
    }),
  }),
  dockpilot_request_host_removal: z.strictObject({
    approvalRequired: z.literal(true),
    approvalId: z.string(),
    status: z.literal('pending'),
    targetType: z.literal('host'),
    targetId: z.string(),
    expiresAt: z.string(),
  }),
  dockpilot_request_container_removal: z.strictObject({
    approvalRequired: z.literal(true),
    approvalId: z.string(),
    status: z.literal('pending'),
    targetType: z.literal('container'),
    targetId: z.string(),
    expiresAt: z.string(),
  }),
} as const;

export const mcpToolInputSchemas = {
  dockpilot_health: z.strictObject({}),
  dockpilot_system_status: z.strictObject({}),
  dockpilot_list_users: z.strictObject({
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_list_sessions: z.strictObject({
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_list_ai_credentials: z.strictObject({
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_list_audit_events: z.strictObject({
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
    outcome: z.enum(['success', 'failure', 'denied']).optional(),
    action: z.string().max(100).optional(),
    toolName: z.string().max(80).optional(),
    targetType: z.string().max(40).optional(),
    targetId: z.string().max(255).optional(),
    from: z.iso.datetime({ offset: true }).optional(),
    to: z.iso.datetime({ offset: true }).optional(),
  }),
  dockpilot_get_audit_event: z.strictObject({
    eventId: z.uuid(),
  }),
  dockpilot_list_approvals: z.strictObject({
    status: z.enum(['pending', 'approved', 'rejected', 'expired', 'executed', 'failed']).optional(),
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_update_my_credential: z.strictObject({
    description: z.string().trim().max(280).nullable().optional(),
    agentIdentity: z.string().trim().min(1).max(120).optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
  dockpilot_request_session_revocation: z.strictObject({
    sessionId: z.uuid(),
    justification: z.string().trim().min(4).max(500),
  }),
  dockpilot_request_credential_revocation: z.strictObject({
    credentialId: z.uuid(),
    justification: z.string().trim().min(4).max(500),
  }),
  dockpilot_list_hosts: z.strictObject({
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_get_host: z.strictObject({
    hostId: z.uuid(),
  }),
  dockpilot_list_containers: z.strictObject({
    hostId: z.uuid(),
    limit: boundedLimit.optional(),
    cursor: z.string().max(256).optional(),
  }),
  dockpilot_get_container_logs: z.strictObject({
    containerId: z.string().regex(/^[a-f0-9]{64}$/u, 'Invalid container identifier.'),
    tail: z.number().int().min(1).max(1000).optional(),
  }),
  dockpilot_sync_host_containers: z.strictObject({
    hostId: z.uuid(),
  }),
  dockpilot_create_host: z.strictObject({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(280).optional(),
    endpoint: z.string().trim().min(1).max(255),
  }),
  dockpilot_update_host: z.strictObject({
    hostId: z.uuid(),
    name: z.string().trim().min(1).max(80).optional(),
    description: z.string().trim().max(280).nullable().optional(),
  }),
  dockpilot_set_container_state: z.strictObject({
    containerId: z.string().regex(/^[a-f0-9]{64}$/u, 'Invalid container identifier.'),
    action: z.enum(['start', 'stop', 'restart']),
  }),
  dockpilot_request_host_removal: z.strictObject({
    hostId: z.uuid(),
    justification: z.string().trim().min(4).max(500),
  }),
  dockpilot_request_container_removal: z.strictObject({
    containerId: z.string().regex(/^[a-f0-9]{64}$/u, 'Invalid container identifier.'),
    justification: z.string().trim().min(4).max(500),
  }),
} as const;

export const mcpToolNameSchema = z.enum([
  'dockpilot_health',
  'dockpilot_system_status',
  'dockpilot_list_users',
  'dockpilot_list_sessions',
  'dockpilot_list_ai_credentials',
  'dockpilot_list_audit_events',
  'dockpilot_get_audit_event',
  'dockpilot_list_approvals',
  'dockpilot_update_my_credential',
  'dockpilot_request_session_revocation',
  'dockpilot_request_credential_revocation',
  'dockpilot_list_hosts',
  'dockpilot_get_host',
  'dockpilot_list_containers',
  'dockpilot_get_container_logs',
  'dockpilot_sync_host_containers',
  'dockpilot_create_host',
  'dockpilot_update_host',
  'dockpilot_set_container_state',
  'dockpilot_request_host_removal',
  'dockpilot_request_container_removal',
]);

export type McpToolName = z.infer<typeof mcpToolNameSchema>;

export const mcpToolNames = mcpToolNameSchema.options;

export interface McpToolSecurityMetadata {
  permissionLevel: AiPermissionLevel;
  rateCategory: McpRateCategory;
  actionType: string;
  destructive: boolean;
}

export const mcpToolCatalog: Record<McpToolName, McpToolSecurityMetadata> = {
  dockpilot_health: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.health',
    destructive: false,
  },
  dockpilot_system_status: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.system_status',
    destructive: false,
  },
  dockpilot_list_users: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_users',
    destructive: false,
  },
  dockpilot_list_sessions: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_sessions',
    destructive: false,
  },
  dockpilot_list_ai_credentials: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_ai_credentials',
    destructive: false,
  },
  dockpilot_list_audit_events: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_audit_events',
    destructive: false,
  },
  dockpilot_get_audit_event: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.get_audit_event',
    destructive: false,
  },
  dockpilot_list_approvals: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_approvals',
    destructive: false,
  },
  dockpilot_update_my_credential: {
    permissionLevel: 'write',
    rateCategory: 'write',
    actionType: 'mcp.update_own_credential',
    destructive: false,
  },
  dockpilot_request_session_revocation: {
    permissionLevel: 'destructive',
    rateCategory: 'destructive',
    actionType: 'mcp.request_session_revocation',
    destructive: true,
  },
  dockpilot_request_credential_revocation: {
    permissionLevel: 'destructive',
    rateCategory: 'destructive',
    actionType: 'mcp.request_credential_revocation',
    destructive: true,
  },
  dockpilot_list_hosts: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_hosts',
    destructive: false,
  },
  dockpilot_get_host: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.get_host',
    destructive: false,
  },
  dockpilot_list_containers: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.list_containers',
    destructive: false,
  },
  dockpilot_get_container_logs: {
    permissionLevel: 'read',
    rateCategory: 'read',
    actionType: 'mcp.get_container_logs',
    destructive: false,
  },
  dockpilot_sync_host_containers: {
    permissionLevel: 'write',
    rateCategory: 'write',
    actionType: 'mcp.sync_host_containers',
    destructive: false,
  },
  dockpilot_create_host: {
    permissionLevel: 'write',
    rateCategory: 'write',
    actionType: 'mcp.create_host',
    destructive: false,
  },
  dockpilot_update_host: {
    permissionLevel: 'write',
    rateCategory: 'write',
    actionType: 'mcp.update_host',
    destructive: false,
  },
  dockpilot_set_container_state: {
    permissionLevel: 'write',
    rateCategory: 'write',
    actionType: 'mcp.set_container_state',
    destructive: false,
  },
  dockpilot_request_host_removal: {
    permissionLevel: 'destructive',
    rateCategory: 'destructive',
    actionType: 'mcp.request_host_removal',
    destructive: true,
  },
  dockpilot_request_container_removal: {
    permissionLevel: 'destructive',
    rateCategory: 'destructive',
    actionType: 'mcp.request_container_removal',
    destructive: true,
  },
};

export const mcpToolCatalogSchema = z.strictObject({
  contractVersion: z.number().int(),
  tools: z.array(
    z.strictObject({
      name: mcpToolNameSchema,
      permissionLevel: z.enum(['read', 'write', 'destructive']),
      rateCategory: mcpRateCategorySchema,
      actionType: z.string(),
      destructive: z.boolean(),
    }),
  ),
});

export type McpToolCatalog = z.infer<typeof mcpToolCatalogSchema>;
