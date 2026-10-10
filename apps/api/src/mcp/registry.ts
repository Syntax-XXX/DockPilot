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
import {
  createHost,
  getHost,
  hostExists,
  listHosts,
  syncHostContainers,
  updateHost,
} from '../services/hosts.js';
import {
  containerLog,
  getContainer,
  listContainers,
  restartContainer,
  startContainer,
  stopContainer,
} from '../services/containers.js';
import {
  containerStats,
  getDockerSummary,
  listImages,
  listNetworks,
  listVolumes,
  runHostDiagnostics,
} from '../services/docker-insights.js';

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

  dockpilot_list_hosts: createTool({
    name: 'dockpilot_list_hosts',
    title: 'List Docker hosts',
    description:
      'Lists the Docker hosts registered in the authenticated organization with bounded, keyset-paginated pages.',
    mutates: false,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_hosts,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_hosts.parse(input);
      const page = await listHosts({
        organizationId: context.identity.organizationId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return { hosts: page.hosts.map(toHostSummary), nextCursor: page.nextCursor };
    },
  }),

  dockpilot_get_host: createTool({
    name: 'dockpilot_get_host',
    title: 'Get Docker host',
    description: 'Returns a single registered Docker host from the authenticated organization.',
    mutates: false,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_get_host,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_get_host.parse(input);
      const host = await getHost({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        executor: context.executor,
      });
      return { host: toHostSummary(host) };
    },
  }),

  dockpilot_list_containers: createTool({
    name: 'dockpilot_list_containers',
    title: 'List host containers',
    description:
      'Lists the containers known for a registered Docker host in the authenticated organization.',
    mutates: false,
    resourceType: 'container',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_containers,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_containers.parse(input);
      const page = await listContainers({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return { containers: page.containers.map(toContainerSummary), nextCursor: page.nextCursor };
    },
  }),

  dockpilot_get_container_logs: createTool({
    name: 'dockpilot_get_container_logs',
    title: 'Get container logs',
    description:
      'Returns the most recent log lines for a container. The Docker socket allowlist is enforced and output is bounded.',
    mutates: false,
    resourceType: 'container',
    outputSchema: mcpToolOutputSchemas.dockpilot_get_container_logs,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_get_container_logs.parse(input);
      const log = await containerLog({
        organizationId: context.identity.organizationId,
        containerId: parsed.containerId,
        tail: parsed.tail,
        executor: context.executor,
      });
      return { log };
    },
  }),

  dockpilot_sync_host_containers: createTool({
    name: 'dockpilot_sync_host_containers',
    title: 'Sync host containers',
    description:
      'Reads the container list from the Docker host and reconciles DockPilot’s stored container records for that host.',
    mutates: true,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_sync_host_containers,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_sync_host_containers.parse(input);
      const result = await syncHostContainers({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        executor: context.executor,
      });
      return { synced: result.synced };
    },
  }),

  dockpilot_create_host: createTool({
    name: 'dockpilot_create_host',
    title: 'Register Docker host',
    description:
      'Registers a Docker host by unix socket endpoint. Only endpoints in the operator allowlist are accepted.',
    mutates: true,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_create_host,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_create_host.parse(input);
      const created = await createHost({
        name: parsed.name,
        description: parsed.description,
        endpoint: parsed.endpoint,
        organizationId: context.identity.organizationId,
        createdByUserId: null,
        executor: context.executor,
      });
      return {
        host: {
          id: created.host.id,
          name: created.host.name,
          endpoint: created.host.endpoint,
          status: created.host.status,
          dockerVersion: created.host.dockerVersion,
        },
      };
    },
  }),

  dockpilot_update_host: createTool({
    name: 'dockpilot_update_host',
    title: 'Update Docker host',
    description: 'Updates the name or description of a registered Docker host.',
    mutates: true,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_update_host,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_update_host.parse(input);
      const host = await updateHost({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        name: parsed.name,
        description: parsed.description ?? undefined,
        executor: context.executor,
      });
      return {
        host: {
          id: host.id,
          name: host.name,
          description: host.description,
          endpoint: host.endpoint,
          status: host.status,
          dockerVersion: host.dockerVersion,
        },
      };
    },
  }),

  dockpilot_set_container_state: createTool({
    name: 'dockpilot_set_container_state',
    title: 'Start, stop or restart a container',
    description:
      'Starts, stops or restarts a container on its registered Docker host. The action is executed against the host and audited.',
    mutates: true,
    resourceType: 'container',
    outputSchema: mcpToolOutputSchemas.dockpilot_set_container_state,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_set_container_state.parse(input);
      const args = {
        organizationId: context.identity.organizationId,
        containerId: parsed.containerId,
        executor: context.executor,
      };
      const container =
        parsed.action === 'start'
          ? await startContainer(args)
          : parsed.action === 'stop'
            ? await stopContainer(args)
            : await restartContainer(args);
      return { container: toContainerActionResult(container) };
    },
  }),

  dockpilot_request_host_removal: createTool({
    name: 'dockpilot_request_host_removal',
    title: 'Request host removal',
    description:
      'Creates a pending human approval request to remove a registered Docker host. The host is not removed until an administrator approves the request.',
    mutates: true,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_request_host_removal,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_request_host_removal.parse(input);
      const exists = await hostExists({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        executor: context.executor,
      });
      if (!exists) throw notFoundError('The host does not exist.');
      const approval = await createApproval({
        organizationId: context.identity.organizationId,
        requestedByCredentialId: context.identity.credentialId,
        toolName: 'dockpilot_request_host_removal',
        actionType: 'host.remove',
        permissionLevel: 'destructive',
        targetType: 'host',
        targetId: parsed.hostId,
        args: { hostId: parsed.hostId },
        justification: parsed.justification,
        executor: context.executor,
      });
      return {
        approvalRequired: true,
        approvalId: approval.id,
        status: 'pending',
        targetType: 'host',
        targetId: approval.targetId,
        expiresAt: approval.expiresAt,
      };
    },
  }),

  dockpilot_request_container_removal: createTool({
    name: 'dockpilot_request_container_removal',
    title: 'Request container removal',
    description:
      'Creates a pending human approval request to remove a container. The container is not removed until an administrator approves the request.',
    mutates: true,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_request_container_removal,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_request_container_removal.parse(input);
      const container = await getContainer({
        organizationId: context.identity.organizationId,
        containerId: parsed.containerId,
        executor: context.executor,
      });
      const approval = await createApproval({
        organizationId: context.identity.organizationId,
        requestedByCredentialId: context.identity.credentialId,
        toolName: 'dockpilot_request_container_removal',
        actionType: 'container.remove',
        permissionLevel: 'destructive',
        targetType: 'container',
        targetId: container.containerId,
        args: { containerId: container.containerId },
        justification: parsed.justification,
        executor: context.executor,
      });
      return {
        approvalRequired: true,
        approvalId: approval.id,
        status: 'pending',
        targetType: 'container',
        targetId: approval.targetId,
        expiresAt: approval.expiresAt,
      };
    },
  }),

  dockpilot_get_container_stats: createTool({
    name: 'dockpilot_get_container_stats',
    title: 'Get container stats',
    description:
      'Returns a single CPU, memory, network and block I/O sample for a container on its host.',
    mutates: false,
    resourceType: 'container',
    outputSchema: mcpToolOutputSchemas.dockpilot_get_container_stats,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_get_container_stats.parse(input);
      const result = await containerStats({
        organizationId: context.identity.organizationId,
        containerId: parsed.containerId,
        executor: context.executor,
      });
      return {
        stats: {
          containerId: result.container.containerId,
          name: result.container.name,
          cpuPercent: result.stats.cpuPercent,
          memoryUsedBytes: result.stats.memoryUsedBytes,
          memoryLimitBytes: result.stats.memoryLimitBytes,
          memoryPercent: result.stats.memoryPercent,
          networkRxBytes: result.stats.networkRxBytes,
          networkTxBytes: result.stats.networkTxBytes,
          pids: result.stats.pids,
          capturedAt: result.stats.capturedAt,
        },
      };
    },
  }),

  dockpilot_run_host_diagnostics: createTool({
    name: 'dockpilot_run_host_diagnostics',
    title: 'Run host diagnostics',
    description:
      'Runs DockPilot Doctor checks against a registered Docker host and returns findings.',
    mutates: false,
    resourceType: 'host',
    outputSchema: mcpToolOutputSchemas.dockpilot_run_host_diagnostics,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_run_host_diagnostics.parse(input);
      const diagnostics = await runHostDiagnostics({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        executor: context.executor,
      });
      return { diagnostics };
    },
  }),

  dockpilot_list_images: createTool({
    name: 'dockpilot_list_images',
    title: 'List host images',
    description: 'Lists the images present on a registered Docker host.',
    mutates: false,
    resourceType: 'image',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_images,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_images.parse(input);
      const page = await listImages({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return {
        images: page.images.map((image) => ({
          id: image.id,
          repoTags: image.repoTags,
          sizeBytes: image.sizeBytes,
          containerCount: image.containerCount,
          dangling: image.dangling,
          createdAt: image.createdAt,
        })),
        nextCursor: page.nextCursor,
      };
    },
  }),

  dockpilot_list_volumes: createTool({
    name: 'dockpilot_list_volumes',
    title: 'List host volumes',
    description: 'Lists the Docker volumes present on a registered Docker host.',
    mutates: false,
    resourceType: 'volume',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_volumes,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_volumes.parse(input);
      const page = await listVolumes({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return {
        volumes: page.volumes.map((volume) => ({
          name: volume.name,
          driver: volume.driver,
          mountpoint: volume.mountpoint,
          scope: volume.scope,
          createdAt: volume.createdAt,
        })),
        nextCursor: page.nextCursor,
      };
    },
  }),

  dockpilot_list_networks: createTool({
    name: 'dockpilot_list_networks',
    title: 'List host networks',
    description: 'Lists the Docker networks present on a registered Docker host.',
    mutates: false,
    resourceType: 'network',
    outputSchema: mcpToolOutputSchemas.dockpilot_list_networks,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_list_networks.parse(input);
      const page = await listNetworks({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        limit: parsed.limit ?? defaultToolPageSize,
        cursor: parsed.cursor,
        executor: context.executor,
      });
      return {
        networks: page.networks.map((network) => ({
          id: network.id,
          name: network.name,
          driver: network.driver,
          scope: network.scope,
          internal: network.internal,
          attachable: network.attachable,
          containerCount: network.containerCount,
        })),
        nextCursor: page.nextCursor,
      };
    },
  }),

  dockpilot_request_image_removal: createTool({
    name: 'dockpilot_request_image_removal',
    title: 'Request image removal',
    description:
      'Creates a pending human approval request to remove an image from a host. The image is not removed until an administrator approves the request.',
    mutates: true,
    resourceType: 'ai_approval',
    outputSchema: mcpToolOutputSchemas.dockpilot_request_image_removal,
    handler: async (input, context) => {
      const parsed = mcpToolInputSchemas.dockpilot_request_image_removal.parse(input);
      const host = await getHost({
        organizationId: context.identity.organizationId,
        hostId: parsed.hostId,
        executor: context.executor,
      });
      const approval = await createApproval({
        organizationId: context.identity.organizationId,
        requestedByCredentialId: context.identity.credentialId,
        toolName: 'dockpilot_request_image_removal',
        actionType: 'image.remove',
        permissionLevel: 'destructive',
        targetType: 'image',
        targetId: parsed.imageId,
        args: { hostId: host.id, imageId: parsed.imageId },
        justification: parsed.justification,
        executor: context.executor,
      });
      return {
        approvalRequired: true,
        approvalId: approval.id,
        status: 'pending',
        targetType: 'image',
        targetId: approval.targetId,
        expiresAt: approval.expiresAt,
      };
    },
  }),

  dockpilot_docker_summary: createTool({
    name: 'dockpilot_docker_summary',
    title: 'Get Docker summary',
    description:
      'Returns organization-scoped counts for Docker hosts and the containers DockPilot has synced.',
    mutates: false,
    resourceType: 'container',
    outputSchema: mcpToolOutputSchemas.dockpilot_docker_summary,
    handler: async (_input, context) => {
      return await getDockerSummary({
        organizationId: context.identity.organizationId,
        executor: context.executor,
      });
    },
  }),
} satisfies Record<McpToolName, McpToolDefinition>;

function toHostSummary(host: {
  id: string;
  name: string;
  description: string | null;
  endpoint: string;
  status: string;
  dockerVersion: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}): Record<string, unknown> {
  return {
    id: host.id,
    name: host.name,
    description: host.description,
    endpoint: host.endpoint,
    status: host.status,
    dockerVersion: host.dockerVersion,
    lastError: host.lastError,
    lastErrorAt: host.lastErrorAt,
    lastSeenAt: host.lastSeenAt,
    createdAt: host.createdAt,
  };
}

function toContainerSummary(container: {
  id: string;
  hostId: string;
  containerId: string;
  shortId: string | null;
  name: string | null;
  image: string;
  state: string;
  status: string;
  syncedAt: string;
}): Record<string, unknown> {
  return {
    id: container.id,
    hostId: container.hostId,
    containerId: container.containerId,
    shortId: container.shortId,
    name: container.name,
    image: container.image,
    state: container.state,
    status: container.status,
    syncedAt: container.syncedAt,
  };
}

function toContainerActionResult(container: {
  id: string;
  hostId: string;
  containerId: string;
  name: string | null;
  image: string;
  state: string;
  status: string;
}): Record<string, unknown> {
  return {
    id: container.id,
    hostId: container.hostId,
    containerId: container.containerId,
    name: container.name,
    image: container.image,
    state: container.state,
    status: container.status,
  };
}

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
