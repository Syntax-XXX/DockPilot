import { z } from 'zod';

export const idSchema = z.uuid();
export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const agentProtocolVersionSchema = z.literal(1);

export const healthResponseSchema = z
  .object({
    status: z.literal('ok'),
    service: z.literal('dockpilot-api'),
    protocolVersion: agentProtocolVersionSchema,
  })
  .strict();

export const bootstrapStatusSchema = z
  .object({
    setupRequired: z.boolean(),
  })
  .strict();

export const setupAccountSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(12)
      .max(128)
      .refine(
        (password) => BufferlessNoControlChars(password),
        'Password must not contain control characters',
      ),
    name: z.string().trim().min(1).max(80),
    organizationName: z.string().trim().min(1).max(100),
  })
  .strict();

function BufferlessNoControlChars(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f)) return false;
  }
  return true;
}

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

export const safeUserSchema = z
  .object({
    id: idSchema,
    email: emailSchema,
    name: z.string(),
    organizationId: idSchema,
    role: z.enum(['owner', 'admin', 'operator', 'viewer']),
  })
  .strict();

export const sessionResponseSchema = z
  .object({
    user: safeUserSchema,
  })
  .strict();

export const agentHelloSchema = z
  .object({
    protocolVersion: agentProtocolVersionSchema,
    agentId: idSchema,
    hostId: idSchema,
    sequence: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    timestamp: z.iso.datetime({ offset: true }),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export type SetupAccountInput = z.infer<typeof setupAccountSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SafeUser = z.infer<typeof safeUserSchema>;
export type AgentHello = z.infer<typeof agentHelloSchema>;
