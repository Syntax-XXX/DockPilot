# Authentication testing

DockPilot uses one-time owner setup, Argon2id password hashing, revocable server-side sessions and cookie protections. Do not add or enable a frontend-only auth bypass. No bypass was added during the 2026-10-09 work.

## Isolated local test procedure

1. Start a disposable PostgreSQL service (the repository Compose service is loopback-only); confirm `DATABASE_URL` names only a development/test database.
2. Configure unique random `SESSION_SECRET` and `MCP_TOKEN_SECRET` locally. Keep `.env` untracked and never print tokens/passwords into logs or reports.
3. Apply migrations with `npm run db:migrate`.
4. Use the normal first-owner setup UI/API exactly once on an empty disposable DB, then login with the locally generated test password.
5. Verify `/api/v1/auth/me` is unauthenticated before login, authenticated after login, and unauthenticated after logout. Verify foreign-Origin mutations are rejected.
6. Test a protected admin route unauthenticated (401), authenticated as non-admin (403), and as owner/admin (permitted). Verify reload preserves a valid server-side session.
7. Use an isolated DB for integration tests: `npm run test:integration` truncates DockPilot data in the configured DB.
8. Remove test data only by explicitly retiring the disposable local environment; never use destructive commands against production.

## Current blocker

At 2026-10-09 browser testing, `/` showed owner setup and `/api/v1/auth/setup-status` initially returned 200, then repeated setup requests hit the configured 429 limit. The authenticated dashboard and complete browser login/logout flow could not be verified. Wait for the intended rate window or provision a fresh isolated test database through supported local setup; do not weaken or bypass server authentication.

Production must reject test-only auth settings if any are later added. For this project, prefer ordinary test accounts and full authorization checks over bypass mode.
