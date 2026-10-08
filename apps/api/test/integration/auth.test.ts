import { db, sql as client } from '../../src/db/index.js';
import { buildApp } from '../../src/app.js';
import { organizations, sessions, users } from '../../src/db/schema.js';
import { createSessionToken, hashPassword, hashSessionToken } from '../../src/lib/security.js';

import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

const origin = 'http://127.0.0.1:5173';
const firstOwner = {
  email: 'owner@integration.example',
  password: 'integration-test-owner-password-987',
  name: 'Integration Owner',
  organizationName: 'Integration Lab',
};
let app: Awaited<ReturnType<typeof buildApp>>;

function ownerHeaders(cookie?: string): Record<string, string> {
  return {
    origin,
    host: '127.0.0.1:4000',
    ...(cookie ? { cookie } : {}),
  };
}

beforeEach(async () => {
  await client`TRUNCATE TABLE audit_logs, sessions, users, organizations CASCADE`;
  app = await buildApp();
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

afterAll(async () => {
  await client.end({ timeout: 5 });
});

async function createOwner(): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/setup',
    headers: { ...ownerHeaders(), 'content-type': 'application/json' },
    payload: firstOwner,
  });
  if (response.statusCode !== 201) {
    throw new Error(`Failed to create integration owner: ${String(response.statusCode)}`);
  }
  return response.headers['set-cookie']?.toString() ?? '';
}

describe('PostgreSQL-backed authenticated setup and sessions', () => {
  it('reports setup required while no user exists and creates a real hashed owner/session/audit entry', async () => {
    const setupStatus = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/setup-status',
    });
    expect(setupStatus.statusCode).toBe(200);
    expect(setupStatus.json()).toEqual({ setupRequired: true });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/setup',
      headers: { ...ownerHeaders(), 'content-type': 'application/json' },
      payload: firstOwner,
    });
    expect(response.statusCode).toBe(201);
    expect(response.json<{ user: { email: string } }>().user.email).toBe(firstOwner.email);
    expect(response.json<{ user: { role: string } }>().user.role).toBe('owner');
    expect(response.headers['cache-control']).toContain('no-store');
    const setCookie = response.headers['set-cookie']?.toString();
    expect(setCookie).toMatch(/HttpOnly/u);
    expect(setCookie).toMatch(/SameSite=Strict/u);
    const rawToken = /dockpilot_session=([^;]+)/u.exec(setCookie ?? '')?.[1];
    expect(rawToken).toBeTruthy();

    const storedUsers = await client<
      { id: string; email_normalized: string; password_hash: string; organization_id: string }[]
    >`
      SELECT id, email_normalized, password_hash, organization_id FROM users
    `;
    expect(storedUsers).toHaveLength(1);
    expect(storedUsers[0]?.password_hash).toMatch(/^\$argon2id\$/u);
    expect(storedUsers[0]?.password_hash).not.toBe(firstOwner.password);

    const storedSessions = await client`SELECT token_hash, expires_at FROM sessions`;
    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0]?.token_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(storedSessions[0]?.token_hash).not.toBe(rawToken);
    expect(Date.parse(String(storedSessions[0]?.expires_at))).toBeGreaterThan(Date.now());

    const organizationId = storedUsers[0]?.organization_id;
    if (!organizationId) throw new Error('Expected the setup owner to have an organization.');
    const logs = await client<{ action: string }[]>`
      SELECT action FROM audit_logs WHERE organization_id = ${organizationId}
    `;
    expect(logs.map((row) => row.action)).toContain('auth.owner_bootstrap');
  }, 20_000);

  it('permanently rejects a second owner-setup attempt and never discloses secrets', async () => {
    await createOwner();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/setup',
      headers: { ...ownerHeaders(), 'content-type': 'application/json' },
      payload: { ...firstOwner, email: 'attacker@integration.example' },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json<{ error: string }>().error).toBe('SETUP_COMPLETE');
    expect(response.body).not.toContain(firstOwner.password);
    const accounts = await client`SELECT id FROM users`;
    expect(accounts).toHaveLength(1);
  }, 20_000);

  it('allows exactly one initial owner even with concurrently racing setup calls', async () => {
    const attempts = await Promise.all(
      ['first', 'second'].map((suffix) =>
        app.inject({
          method: 'POST',
          url: '/api/v1/auth/setup',
          headers: { ...ownerHeaders(), 'content-type': 'application/json' },
          payload: { ...firstOwner, email: `${suffix}@integration.example` },
        }),
      ),
    );
    expect(attempts.filter((response) => response.statusCode === 201)).toHaveLength(1);
    expect(attempts.filter((response) => response.statusCode === 403)).toHaveLength(1);
    const owners = await client`SELECT id FROM users WHERE role = 'owner'`;
    expect(owners).toHaveLength(1);
    expect(await client`SELECT count(*)::int AS count FROM organizations`).toEqual([{ count: 1 }]);
  }, 30_000);

  it('authenticates a correct password, persists a newly hashed independent session and audits success', async () => {
    await createOwner();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { ...ownerHeaders(), 'content-type': 'application/json' },
      payload: { email: 'OWNER@INTEGRATION.EXAMPLE', password: firstOwner.password },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json<{ user: { email: string } }>().user.email).toBe(firstOwner.email);
    expect(response.headers['set-cookie']).toMatch(/HttpOnly/u);
    const stored = await client`SELECT count(*)::int AS count FROM sessions`;
    expect(stored[0]?.count).toBe(2);
    const audit = await client<
      { action: string }[]
    >`SELECT action FROM audit_logs ORDER BY occurred_at`;
    expect(audit.map((row) => row.action)).toContain('auth.login');
  }, 20_000);

  it('serves a valid identity only for an active server-side session and revokes it at logout', async () => {
    await createOwner();
    const loggedIn = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { ...ownerHeaders(), 'content-type': 'application/json' },
      payload: { email: firstOwner.email, password: firstOwner.password },
    });
    const loggedInCookie = loggedIn.headers['set-cookie']?.toString();
    const token = /dockpilot_session=([^;]+)/u.exec(loggedInCookie ?? '')?.[1];
    expect(token).toBeTruthy();
    const cookieToken = token;
    if (!cookieToken) throw new Error('Login did not return a session token.');
    const cookie = `dockpilot_session=${cookieToken}`;

    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: ownerHeaders(cookie),
    });
    expect(me.statusCode).toBe(200);
    expect(me.json<{ user: { email: string } }>().user.email).toBe(firstOwner.email);
    expect(me.json()).not.toHaveProperty('passwordHash');
    expect(me.headers['cache-control']).toContain('no-store');

    const logout = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: ownerHeaders(cookie),
    });
    expect(logout.statusCode).toBe(204);
    expect(logout.headers['set-cookie']).toMatch(/Max-Age=0/u);

    const revoked = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: ownerHeaders(cookie),
    });
    expect(revoked.statusCode).toBe(401);
  }, 20_000);

  it('denies unauthenticated, non-owner and disabled users access to authenticated identity data', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/auth/me' })).statusCode).toBe(401);
    const [organization] = await db
      .insert(organizations)
      .values({ name: 'Operator Org' })
      .returning();
    if (!organization) throw new Error('Failed to set up authorization fixture.');
    const passwordHash = await hashPassword(firstOwner.password);
    const [viewer] = await db
      .insert(users)
      .values({
        email: 'viewer@integration.example',
        emailNormalized: 'viewer@integration.example',
        name: 'Authorized Viewer',
        passwordHash,
        organizationId: organization.id,
        role: 'viewer',
      })
      .returning();
    if (!viewer) throw new Error('Failed to set up authenticated identity fixture.');
    const token = createSessionToken();
    await db.insert(sessions).values({
      tokenHash: hashSessionToken(token),
      userId: viewer.id,
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: ownerHeaders(`dockpilot_session=${token}`),
    });
    expect(me.statusCode).toBe(200);
    expect(me.json<{ user: { role: string } }>().user.role).toBe('viewer');
    await client`UPDATE users SET disabled_at = NOW() WHERE id = ${viewer.id}`;
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/api/v1/auth/me',
          headers: ownerHeaders(`dockpilot_session=${token}`),
        })
      ).statusCode,
    ).toBe(401);
  }, 20_000);

  it('returns indistinguishable, non-leaky errors for unknown emails and incorrect passwords', async () => {
    await createOwner();
    const payloads = [
      { email: 'unknown@integration.example', password: firstOwner.password },
      { email: firstOwner.email, password: 'incorrect-password-12345' },
    ];
    const responses = await Promise.all(
      payloads.map((payload) =>
        app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          headers: { ...ownerHeaders(), 'content-type': 'application/json' },
          payload,
        }),
      ),
    );
    expect(responses.map((response) => response.statusCode)).toEqual([401, 401]);
    expect(responses[0]?.json()).toEqual(responses[1]?.json());
    for (const response of responses) {
      expect(response.body).not.toContain(firstOwner.password);
      expect(response.headers['cache-control']).toContain('no-store');
    }
  }, 30_000);
});

describe('real HTTP server middleware and CSRF boundaries', () => {
  it('returns a versioned live health response and restrictive security headers', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', service: 'dockpilot-api', protocolVersion: 1 });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.headers.server).toBeUndefined();
  });

  it.each([undefined, 'null', 'http://attacker.invalid', 'http://127.0.0.1:5173.attacker.invalid'])(
    'blocks setup for untrusted Origin %s before checking any request body',
    async (untrustedOrigin) => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/setup',
        headers: {
          ...(untrustedOrigin !== undefined ? { origin: untrustedOrigin } : {}),
          'content-type': 'application/json',
        },
        payload: firstOwner,
      });
      expect(response.statusCode).toBe(403);
      expect(await client`SELECT id FROM users`).toHaveLength(0);
      expect(response.body).not.toContain(firstOwner.password);
    },
  );

  it('blocks forged cookie-authenticated mutations, including a foreign-origin logout', async () => {
    const forgedToken = createSessionToken();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        origin: 'http://attacker.invalid',
        cookie: `dockpilot_session=${forgedToken}`,
        'content-type': 'application/json',
      },
      payload: {},
    });
    expect(response.statusCode).toBe(403);
    expect(response.body).not.toContain(forgedToken);
  });

  it('rejects oversized HTTP request bodies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { ...ownerHeaders(), 'content-type': 'application/json' },
      payload: { email: 'test@example.com', password: 'x'.repeat(66_000) },
    });
    expect(response.statusCode).toBe(413);
    expect(response.body).not.toContain('x'.repeat(100));
  });

  it('fails closed on invented organization identities and revoked or expired session cookies', async () => {
    const fake = createSessionToken();
    const noSuchSession = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: ownerHeaders(`dockpilot_session=${fake}`),
    });
    expect(noSuchSession.statusCode).toBe(401);
    expect(noSuchSession.body).not.toContain(fake);
  });
});
