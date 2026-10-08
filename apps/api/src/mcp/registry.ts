import type { z } from 'zod';
import { sql } from 'drizzle-orm';
import {
  mcpContractVersion,
  mcpToolCatalog,
  mcpToolInputSchemas,
  mcpToolOutputSchemas,
  type AiPermissionLevel,
  type McpRateCategory,
  type McpToolName,
} from '@dockpilot/shared';
import type { DbExecutor } from '../db/index.js';
import type { McpIdentity, McpRequestContext } from '../lib/identity.js';
import { notFoundError } from '../lib/errors.js';
import { getSystemStatus } from '../services/system-status.js';
import { listUsers } from '../services/users.js';
import { listSessions, sessionExistsInOrganization } from '../services/sessions.js';
import {
  getAiCredential,
  listAiCredentials,
  updateOwnAiCredential,
} from '../services/ai-credentials.js';
import { getAuditEvent, listAuditEvents } from '../services/audit-events.js';
import { createApproval, listApprovals } from '../services/approvals.js';

export const defaultToolPageSize = 25;

export interface ToolContext {
  identity: McpIdentity;
  request: McpRequestContext;
  executor: DbExecutor;
}

export interface McpToolDefinition {
  name: McpToolName;
  title: string;
  description: string;
  permissionLevel: AiPermissionLevel;
  rateCategory: McpRateCategory;
  actionType: string;
  destructive: boolean;
  readOnly: boolean;
  mutates: boolean;
  resourceType: string;
  inputSchema: z.ZodType;
  outputSchema: z.ZodType;
  handler: (input: unknown, context: ToolContext) => Promise<Record<string, unknown>>;
}

interface ToolSpec {
  name: McpToolName;
  title: string;
  description: string;
  mutates: boolean;
  resourceType: string;
  outputSchema: z.ZodType;
  handler: (input: unknown, context: ToolContext) => Promise<Record<string, unknown>>;
}

function createTool(spec: ToolSpec): McpToolDefinition {
  const security = mcpToolCatalog[spec.name];
  return {
    ...spec,
    permissionLevel: security.permissionLevel,
    rateCategory: security.rateCategory,
    actionType: security.actionType,
    destructive: security.destructive,
    readOnly: security.permissionLevel === 'read',
    inputSchema: mcpToolInputSchemas[spec.name],
  };
}

export const mcpToolRegistry = {
  dockpilot_health: createTool({
    name: 'dockpilot_health',
    title: 'DockPilot health',
    description:
      'Reports DockPilot API availability, the MCP contract version and live database reachability.',
    mutates: false,
    resourceType: 'system',
    outputSchema: mcpToolOutputSchemas.dockpilot_health,
    handler: async (_input, context) => {
      await context.executor.execute(sql`SELECT 1`);
      return {
        status: 'ok',
        service: 'dockpilot-api',
        protocolVersion: 1,
        mcpContractVersion,
        database: 'reachable',
        serverTime: new Date().toISOString(),
      };
    },
  }),

  dockpilot_system_status: createTool({
    name: 'dockpilot_system_status',
    title: 'DockPilot system status',
    description:
      'Returns organization-scoped counts for users, active sessions, AI credentials, pending approvals and audit volume.',
    mutates: false,
    resourceType: 'system',
    outputSchema: mcpToolOutputSchemas.dockpilot_system_status,
    handler: async (_input, context) => {
      const status = await getSystemStatus({
        organizationId: context.identity.organizationId,
        executor: context.executor,
      });
      return {
        setupRequired: status.setupRequired,
        organizationId: context.identity.organizationId,
        mcpEnabled: status.mcpEnabled,
        users: status.counts.users,
        activeSessions: status.counts.activeSessions,
        activeAiCredentials: status.counts.activeAiCredentials,
        revokedAiCredentials: status.counts.revokedAiCredentials,
        pendingApprovals: status.counts.pendingApprovals,
        auditEvents24h: status.counts.auditEvents24h,
        serverTime: status.serverTime,
      };
    },
  }),

  dockpilot_list_users: createTool({
    name: 'dockpilot_list_users',
    title: 'List DockPilot users',
    description: 'Lists users in the authenticated organization with a bounded page size.',
    mutates: false,
    resourceType: 'user',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_users,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_users.parse(input);
      const page = await listUsers({
        organizationId: context.identity.organizationId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return { users: page.users, nextCursor: page.nextCursor };
    },
  }),

  dockpilot_list_sessions: createTool({
    name: 'dockpilot_list_sessions',
    title: 'List DockPilot sessions',
    description:
      'Lists active and expired browser sessions for users in the authenticated organization.',
    mutates: false,
    resourceType: 'session',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_sessions,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_sessions.parse(input);
      const page = await listSessions({
        organizationId: context.identity.organizationId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return { sessions: page.sessions, nextCursor: page.nextCursor };
    },
  }),

  dockpilot_list_ai_credentials: createTool({
    name: 'dockpilot_list_ai_credentials',
    title: 'List AI credentials',
    description:
      'Lists AI credentials in the authenticated organization. Raw credential tokens are never returned.',
    mutates: false,
    resourceType: 'ai_credential',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_ai_credentials,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_ai_credentials.parse(input);
      const page = await listAiCredentials({
        organizationId: context.identity.organizationId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return {
        credentials: page.credentials.map((credential) => ({
          id: credential.id,
          name: credential.name,
          description: credential.description,
          agentIdentity: credential.agentIdentity,
          permissionLevel: credential.permissionLevel,
          tokenPrefix: credential.tokenPrefix,
          createdAt: credential.createdAt,
          lastUsedAt: credential.lastUsedAt,
          expiresAt: credential.expiresAt,
          revokedAt: credential.revokedAt,
          disabledAt: credential.disabledAt,
        })),
        nextCursor: page.nextCursor,
      };
    },
  }),

  dockpilot_list_audit_events: createTool({
    name: 'dockpilot_list_audit_events',
    title: 'List audit events',
    description:
      'Lists audit events for the authenticated organization using server-side keyset pagination and redacted summaries.',
    mutates: false,
    resourceType: 'audit_log',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_audit_events,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_audit_events.parse(input);
      const page = await listAuditEvents({
        organizationId: context.identity.organizationId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        outcome: parsed.outcome,
        action: parsed.action,
        toolName: parsed.toolName,
        targetType: parsed.targetType,
        targetId: parsed.targetId,
        from: parsed.from,
        to: parsed.to,
        executor: context.executor,
      });
      return { events: page.events.map(toAuditEventSummary), nextCursor: page.nextCursor };
    },
  }),

  dockpilot_get_audit_event: createTool({
    name: 'dockpilot_get_audit_event',
    title: 'Get audit event',
    description: 'Returns a single redacted audit event by identifier.',
    mutates: false,
    resourceType: 'audit_log',
    outputSchema: mcpToolOutputSchemas.dockpilot_get_audit_event,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_get_audit_event.parse(input);
      const event = await getAuditEvent({
        organizationId: context.identity.organizationId,
        eventId: parsed.eventId,
        executor: context.executor,
      });
      return {
        event: {
          id: event.id,
          occurredAt: event.occurredAt,
          outcome: event.outcome,
          action: event.action,
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          correlationId: event.correlationId,
          aiCredentialId: event.aiCredentialId,
          agentIdentity: event.agentIdentity,
          toolName: event.toolName,
          permissionUsed: event.permissionUsed,
          targetType: event.targetType,
          targetId: event.targetId,
          approvalId: event.approvalId,
          durationMs: event.durationMs,
          errorCategory: event.errorCategory,
          inputSummary: event.inputSummary,
          resultSummary: event.resultSummary,
        },
      };
    },
  }),

  dockpilot_list_approvals: createTool({
    name: 'dockpilot_list_approvals',
    title: 'List approval requests',
    description:
      'Lists human approval requests for destructive DockPilot operations, optionally filtered by status.',
    mutates: false,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_approvals,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_approvals.parse(input);
      const page = await listApprovals({
        organizationId: context.identity.organizationId,
        status: parsed.status,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return {
        approvals: page.approvals.map((approval) => ({
          id: approval.id,
          toolName: approval.toolName,
          actionType: approval.actionType,
          targetType: approval.targetType,
          targetId: approval.targetId,
          status: approval.status,
          justification: approval.justification,
          createdAt: approval.createdAt,
          expiresAt: approval.expiresAt,
          decidedAt: approval.decidedAt,
        })),
        nextCursor: page.nextCursor,
      };
    },
  }),

  dockpilot_update_my_credential: createTool({
    name: 'dockpilot_update_my_credential',
    title: 'Update own AI credential metadata',
    description:
      'Updates only the non-security metadata (description, agent identity, metadata) of the calling AI credential. Permission level and token cannot be changed.',
    mutates: true,
    resourceType: 'ai_credential',
    outputSchema: mcpToolOutputSchemas.dockpilot_update_my_credential,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_update_my_credential.parse(input);
      const credential = await updateOwnAiCredential({
        identity: context.identity,
        description: parsed.description,
        agentIdentity: parsed.agentIdentity,
        metadata: parsed.metadata,
        executor: context.executor,
      });
      return {
        credential: {
          id: credential.id,
          name: credential.name,
          description: credential.description,
          agentIdentity: credential.agentIdentity,
          permissionLevel: credential.permissionLevel,
        },
      };
    },
  }),

  dockpilot_request_session_revocation: createTool({
    name: 'dockpilot_request_session_revocation',
    title: 'Request session revocation',
    description:
      'Creates a pending human approval request to revoke a browser session. The session is not revoked until an administrator approves the request.',
    mutates: true,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_request_session_revocation,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_request_session_revocation.parse(input);
      const exists = await sessionExistsInOrganization({
        organizationId: context.identity.organizationId,
        sessionId: parsed.sessionId,
        executor: context.executor,
      });
      if (!exists) throw notFoundError('The session does not exist.');
      const approval = await createApproval({
        organizationId: context.identity.organizationId,
        requestedByCredentialId: context.identity.credentialId,
        toolName: 'dockpilot_request_session_revocation',
        actionType: 'session.revoke',
        permissionLevel: 'destructive',
        targetType: 'session',
        targetId: parsed.sessionId,
        args: { sessionId: parsed.sessionId },
        justification: parsed.justification,
        executor: context.executor,
      });
      return {
        approvalRequired: true,
        approvalId: approval.id,
        status: 'pending',
        targetType: 'session',
        targetId: approval.targetId,
        expiresAt: approval.expiresAt,
      };
    },
  }),

  dockpilot_request_credential_revocation: createTool({
    name: 'dockpilot_request_credential_revocation',
    title: 'Request AI credential revocation',
    description:
      'Creates a pending human approval request to revoke an AI credential in the organization. The credential is not revoked until an administrator approves the request.',
    mutates: true,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_request_credential_revocation,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_request_credential_revocation.parse(input);
      await getAiCredential({
        organizationId: context.identity.organizationId,
        credentialId: parsed.credentialId,
        executor: context.executor,
      });
      const approval = await createApproval({
        organizationId: context.identity.organizationId,
        requestedByCredentialId: context.identity.credentialId,
        toolName: 'dockpilot_request_credential_revocation',
        actionType: 'ai_credential.revoke',
        permissionLevel: 'destructive',
        targetType: 'ai_credential',
        targetId: parsed.credentialId,
        args: { credentialId: parsed.credentialId },
        justification: parsed.justification,
        executor: context.executor,
      });
      return {
        approvalRequired: true,
        approvalId: approval.id,
        status: 'pending',
        targetType: 'ai_credential',
        targetId: approval.targetId,
        expiresAt: approval.expiresAt,
      };
    },
  }),
} satisfies Record<McpToolName, McpToolDefinition>;

function toAuditEventSummary(event: {
  id: string;
  occurredAt: string;
  outcome: string;
  action: string;
  toolName: string | null;
  agentIdentity: string | null;
  aiCredentialId: string | null;
  targetType: string | null;
  targetId: string | null;
  correlationId: string | null;
  durationMs: number | null;
  approvalId: string | null;
}): Record<string, unknown> {
  return {
    id: event.id,
    occurredAt: event.occurredAt,
    outcome: event.outcome,
    action: event.action,
    toolName: event.toolName,
    agentIdentity: event.agentIdentity,
    aiCredentialId: event.aiCredentialId,
    targetType: event.targetType,
    targetId: event.targetId,
    correlationId: event.correlationId,
    durationMs: event.durationMs,
    approvalId: event.approvalId,
  };
}
