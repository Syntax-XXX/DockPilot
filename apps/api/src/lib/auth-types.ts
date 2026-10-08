import type { SafeUser } from '@dockpilot/shared';

declare module 'fastify' {
  interface FastifyRequest {
    dockpilotUser: SafeUser | null;
    sessionTokenHash: string | null;
  }
}
