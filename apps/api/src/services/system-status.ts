import { sql } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { mcpEnabled } from '../lib/security.js';
import type { SystemStatus } from '@dockpilot/shared';

export interface SystemStatusInput {
  organizationId: string;
  executor?: DbExecutor;
}

interface CountRow extends Record<string, unknown> {
  users: number;
  global_users: number;
  active_sessions: number;
  active_ai_credentials: number;
  revoked_ai_credentials: number;
  pending_approvals: number;
  audit_events_24h: number;
}

export async function getSystemStatus(input: SystemStatusInput): Promise<SystemStatus> {
  const executor = input.executor ?? db;
  const rows = await executor.execute<CountRow>(sql`
    SELECT
      (SELECT count(*)::int FROM users WHERE organization_id = ${input.organizationId}) AS users,
      (SELECT count(*)::int FROM users) AS global_users,
      (SELECT count(*)::int FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE u.organization_id = ${input.organizationId}
          AND s.expires_at > now()
          AND u.disabled_at IS NULL) AS active_sessions,
      (SELECT count(*)::int FROM ai_credentials
        WHERE organization_id = ${input.organizationId}
          AND revoked_at IS NULL
          AND disabled_at IS NULL
          AND (expires_at IS NULL OR expires_at > now())) AS active_ai_credentials,
      (SELECT count(*)::int FROM ai_credentials
        WHERE organization_id = ${input.organizationId} AND revoked_at IS NOT NULL) AS revoked_ai_credentials,
      (SELECT count(*)::int FROM ai_approvals
        WHERE organization_id = ${input.organizationId} AND status = 'pending') AS pending_approvals,
      (SELECT count(*)::int FROM audit_logs
        WHERE organization_id = ${input.organizationId}
          AND occurred_at > now() - interval '24 hours') AS audit_events_24h
  `);

  const counts = rows[0];
  if (!counts) throw new Error('System status could not be read.');

  return {
    setupRequired: counts.global_users === 0,
    service: 'dockpilot-api',
    protocolVersion: 1,
    database: 'reachable',
    mcpEnabled,
    counts: {
      users: counts.users,
      activeSessions: counts.active_sessions,
      activeAiCredentials: counts.active_ai_credentials,
      revokedAiCredentials: counts.revoked_ai_credentials,
      pendingApprovals: counts.pending_approvals,
      auditEvents24h: counts.audit_events_24h,
    },
    serverTime: new Date().toISOString(),
  };
}
