import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Algorithm, hash, verify } from '@node-rs/argon2';
import { z } from 'zod';

const passwordHashOptions = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19_456,
  timeCost: 3,
  parallelism: 1,
};
const sessionTokenPattern = /^[A-Za-z0-9_-]{43}$/u;
const base64url256BitPattern = /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/u;

const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SESSION_SECRET: z
    .string()
    .min(32)
    .refine(
      (value) => !/example|change|replace|development-only/iu.test(value),
      'SESSION_SECRET must be a unique, randomly generated secret',
    ),
  WEB_ORIGIN: z.url().refine((value) => {
    const url = new URL(value);
    return (
      url.origin === value &&
      url.username === '' &&
      url.password === '' &&
      url.search === '' &&
      url.hash === ''
    );
  }, 'WEB_ORIGIN must be the canonical origin without a path, credentials, or query string'),
  TRUSTED_PROXY: z.enum(['true', 'false']).default('false'),
});

const parsedEnv = runtimeEnvSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error(`Unsafe or missing API configuration: ${z.prettifyError(parsedEnv.error)}`);
}
export const env = Object.freeze(parsedEnv.data);

if (env.NODE_ENV === 'production' && new URL(env.WEB_ORIGIN).protocol !== 'https:') {
  throw new Error('Production WEB_ORIGIN must use HTTPS.');
}

export const secureCookies = env.NODE_ENV === 'production';
export const sessionSecret = env.SESSION_SECRET;
export const cookieName = `${secureCookies ? '__Host-' : ''}dockpilot_session`;
export const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;
export const sessionMaxAgeMs = sessionMaxAgeSeconds * 1000;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, passwordHashOptions);
}

const dummyPasswordHash = await hash('randomized-unusable-timing-equalization-credential', {
  ...passwordHashOptions,
  salt: randomBytes(16),
});

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

export function createSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function isValidSessionToken(token: string): boolean {
  return sessionTokenPattern.test(token) && base64url256BitPattern.test(token);
}

export function hashSessionToken(token: string): string {
  return createHmac('sha256', sessionSecret).update(token).digest('hex');
}

export function timingSafeHashEqual(first: string, second: string): boolean {
  if (!/^[a-f0-9]{64}$/u.test(first) || !/^[a-f0-9]{64}$/u.test(second)) return false;
  return timingSafeEqual(Buffer.from(first, 'hex'), Buffer.from(second, 'hex'));
}

export function isTrustedOrigin(origin: string | undefined): boolean {
  if (!origin || origin === 'null') return false;
  try {
    const parsedOrigin = new URL(origin);
    return (
      parsedOrigin.origin === env.WEB_ORIGIN &&
      parsedOrigin.pathname === '/' &&
      parsedOrigin.search === '' &&
      parsedOrigin.hash === '' &&
      parsedOrigin.username === '' &&
      parsedOrigin.password === ''
    );
  } catch {
    return false;
  }
}

export const verifyMutationRequest = isTrustedOrigin;

export async function verifyPasswordOrBurnTime(
  password: string,
  passwordHash: string | null,
): Promise<boolean> {
  if (!passwordHash) {
    await verifyPassword(password, dummyPasswordHash);
    return false;
  }
  return verifyPassword(password, passwordHash);
}
