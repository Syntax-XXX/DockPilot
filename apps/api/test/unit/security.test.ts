import { generateKeySync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { setupAccountSchema, agentHelloSchema, healthResponseSchema } from '@dockpilot/shared';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isTrustedOrigin,
  isValidSessionToken,
  timingSafeHashEqual,
  verifyPassword,
} from '../../src/lib/security.js';

describe('session token cryptography', () => {
  it('generates unique 256-bit opaque URL-safe session tokens', () => {
    const first = createSessionToken();
    const second = createSessionToken();
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/u);
    expect(second).not.toBe(first);
    expect(isValidSessionToken(first)).toBe(true);
  });

  it.each(['', 'abcd', 'A'.repeat(42) + 'B', 'Bearer something', '../' + 'a'.repeat(40)])(
    'rejects forged session token %j',
    (token) => {
      expect(isValidSessionToken(token)).toBe(false);
    },
  );

  it('keys stored session hashes with the configured server-only secret', () => {
    const first = createSessionToken();
    const second = createSessionToken();
    expect(hashSessionToken(first)).toMatch(/^[a-f0-9]{64}$/u);
    expect(hashSessionToken(first)).not.toBe(first);
    expect(hashSessionToken(second)).not.toBe(hashSessionToken(first));
  });

  it('compares valid hex hashes without throwing on malformed or unequal input', () => {
    const secret = generateKeySync('hmac', { length: 256 }).export().toString('hex');
    const other = generateKeySync('hmac', { length: 256 }).export().toString('hex');
    expect(timingSafeHashEqual(secret, secret)).toBe(true);
    expect(timingSafeHashEqual(secret, other)).toBe(false);
    expect(timingSafeHashEqual('short', secret)).toBe(false);
  });
});

describe('secure password authentication', () => {
  it('hashes passwords with Argon2id and verifies only the right password', async () => {
    const hash = await hashPassword('correct horse battery staple 42');
    expect(hash).toMatch(/^\$argon2id\$/u);
    expect(hash).not.toContain('correct horse');
    expect(await verifyPassword('correct horse battery staple 42', hash)).toBe(true);
    expect(await verifyPassword('wrong password entirely', hash)).toBe(false);
    expect(await verifyPassword('wrong', 'malformed database credential')).toBe(false);
  }, 20_000);
});

describe('strict shared API and agent schemas', () => {
  it('rejects passwords shorter than the bootstrap minimum', () => {
    expect(
      setupAccountSchema.safeParse({
        email: 'valid@example.com',
        password: 'short',
        name: 'DockPilot',
        organizationName: 'Lab',
      }).success,
    ).toBe(false);
  });

  it('rejects strict-schema credential over-posting without echoing credential text', () => {
    const credential = 'very-secret-password-9999';
    const result = setupAccountSchema.safeParse({
      email: 'valid@example.com',
      password: credential,
      name: 'DockPilot',
      organizationName: 'Lab',
      role: 'owner',
      isAdmin: true,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes(credential))).toBe(false);
  });

  it('rejects invalid, control-character, oversized, and non-email setup data', () => {
    for (const password of ['password-password\nadmin', 'password-password\0', 'a'.repeat(129)]) {
      expect(
        setupAccountSchema.safeParse({
          email: 'valid@example.com',
          password,
          name: 'Owner',
          organizationName: 'Lab',
        }).success,
      ).toBe(false);
    }
    expect(
      setupAccountSchema.safeParse({
        email: 'not-an-email',
        password: 'a'.repeat(16),
        name: 'Owner',
        organizationName: 'Lab',
      }).success,
    ).toBe(false);
  });

  it('normalizes email identity consistently', () => {
    expect(
      setupAccountSchema.parse({
        email: 'OWNER@EXAMPLE.COM',
        password: 'a-unique-long-password',
        name: 'Owner',
        organizationName: 'Lab',
      }).email,
    ).toBe('owner@example.com');
  });

  it('requires the exact configured protocol version and rejects unknown commands', () => {
    expect(
      healthResponseSchema.safeParse({ status: 'ok', service: 'dockpilot-api', protocolVersion: 1 })
        .success,
    ).toBe(true);
    expect(
      healthResponseSchema.safeParse({ status: 'ok', service: 'dockpilot-api', protocolVersion: 2 })
        .success,
    ).toBe(false);
    expect(
      agentHelloSchema.safeParse({
        protocolVersion: 2,
        agentId: 'b7ba6c0e-e4d6-4b2c-88ee-8a7384f43128',
        hostId: 'c2a65b5c-441e-475a-bbb6-77c38e538be5',
        sequence: 0,
        timestamp: new Date().toISOString(),
        payload: {},
      }).success,
    ).toBe(false);
  });
});

describe('strict trusted-origin policy', () => {
  it.each([
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'https://evil.example',
    'null',
    '',
    'undefined',
    undefined,
  ])('rejects untrusted origin %s', (origin) => {
    expect(isTrustedOrigin(origin)).toBe(false);
  });

  it('accepts only the configured exact development origin', () => {
    expect(isTrustedOrigin('http://127.0.0.1:5173')).toBe(true);
    expect(isTrustedOrigin('http://127.0.0.1:5173.evil.example')).toBe(false);
    expect(isTrustedOrigin('http://127.0.0.1:5173/other-path')).toBe(false);
  });
});
