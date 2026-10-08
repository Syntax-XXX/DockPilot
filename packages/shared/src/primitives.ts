import { z } from 'zod';

export const idSchema = z.uuid();
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const agentProtocolVersionSchema = z.literal(1);
export const memberRoleSchema = z.enum(['owner', 'admin', 'operator', 'viewer']);
