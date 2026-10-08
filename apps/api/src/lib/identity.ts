import type { AiPermissionLevel } from '@dockpilot/shared';

export interface McpIdentity {
  credentialId: string;
  credentialName: string;
  agentIdentity: string;
  permissionLevel: AiPermissionLevel;
  organizationId: string;
}

export interface McpRequestContext {
  correlationId: string;
  sourceIp: string | null;
  userAgent: string | null;
  requestId: string | null;
}

export const permissionRank: Record<AiPermissionLevel, number> = {
  read: 1,
  write: 2,
  destructive: 3,
};

export function hasPermission(granted: AiPermissionLevel, required: AiPermissionLevel): boolean {
  return permissionRank[granted] >= permissionRank[required];
}
