import type { SafeUser } from '@dockpilot/shared';

export type DockerCapability = 'read' | 'operate' | 'manage' | 'remove';

const capabilitiesByRole: Record<SafeUser['role'], readonly DockerCapability[]> = {
  viewer: ['read'],
  operator: ['read', 'operate'],
  admin: ['read', 'operate', 'manage', 'remove'],
  owner: ['read', 'operate', 'manage', 'remove'],
};

export function hasDockerCapability(role: SafeUser['role'], capability: DockerCapability): boolean {
  return capabilitiesByRole[role].includes(capability);
}
