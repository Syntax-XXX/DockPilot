# DockPilot architecture

**Product:** DockPilot — “Docker, without the guessing.”  
**Status:** milestone 0 complete; milestone 1 foundation in progress.

## Technology decisions

This is a fresh repository. The application is a private npm-workspaces monorepo using TypeScript, Node.js 20+, React 19/Vite, Fastify 5, PostgreSQL 17, and Drizzle ORM. React and Fastify are separate workspaces: the browser never receives Docker credentials or performs Docker actions. The Docker agent is a separately deployable, planned component; it will make allowlisted, validated API calls, never accept arbitrary shell commands. PostgreSQL makes organization scoping, relational integrity, sessions and future operational history explicit. The Vite development proxy keeps browser requests same-origin and avoids permissive API CORS.

## Security model and first slice

- A single Docker Compose PostgreSQL service binds **only** to loopback and stores data in a named volume. The development password is intentionally unsuitable for production. Do not reuse it.
- A human-authenticated API trusts the browser's exact configured Origin; cookie-authenticated mutations without that Origin receive `403`. No reflected wildcard CORS or proxy trust by default.
- The initial unconfigured installation can create **one** owner account and organization. Concurrent setup requests are serialized by PostgreSQL advisory lock. Once an owner exists, setup is permanently disabled through the public API. Configure account recovery before exposing the service; no unauthenticated reset route is planned.
- Passwords are stored as Argon2id PHC hashes. Applications never log passwords. Sessions use independently generated opaque random tokens; only a keyed digest is stored, cookies are HttpOnly/SameSite, Secure in production, and application sessions have a fixed seven-day expiry and server-side revocation. TLS termination is mandatory for production.
- PostgreSQL transactions contain setup identity, organization membership, and append-only administrative audit events together. API database access always uses organization-scoped queries. Roles are defined centrally rather than inferred from client input.
- Body schemas are strict. Request sizes, security headers, login/bootstrap rate limits, and generic credential errors are enforced at the API boundary.
- Agent requests use a versioned, strict shared protocol. Protocol data is untrusted. Agent-specific mutual authentication and replay protection must be implemented before admitting agents; no dashboard action may execute arbitrary host commands.

## Package layout

- `apps/web` — React dashboard and safe, same-origin typed API client.
- `apps/api` — Fastify API, PostgreSQL connection, Drizzle schema/migrations, authentication and authorization.
- `packages/shared` — strict runtime validation and versioned client/agent protocol.
- `infrastructure/compose.yaml` — local, loopback-only PostgreSQL for development and integration tests.
- `agent/` — reserved for the small least-privilege Docker host agent, to be implemented after the central platform's API contracts stabilize.

## Deliberate milestones

0. Reproducible monorepo, threat model, architecture record and local database (implemented first).
1. Relational foundations, one-time owner setup, Argon2id credentials, revocable sessions, RBAC boundaries, audit log, API tests.
2. Docker agent resource collectors and validated action allowlist.
3. Authenticated, encrypted, versioned and replay-resistant agent communication.
4. Live multi-host dashboard driven by real API/database state, with informative no-host empty state.
5. Safe container operations with explicit authorization and audit history.
6. Live health and resource monitoring.
7. Compose discovery and safe diff/preview.
8. Deterministic Docker Doctor security/reliability diagnostics.
9. Previewed, backup-protected image updates.
10. Acknowledgable and resolvable alerts.
11. Verified backups and tested restore flow.
12. Authorized declarative automation.
13. Security review and production hardening.
14. Documented containerized production deployment and migration procedure.
15. Accessibility, documentation and usability polish.

Each capability is driven by validated, real state; planned capabilities are not faked in the dashboard. A milestone is ready to ship only after automated checks, a local production build, documentation, and an explicit security review.

## Local development

See `README.md` for bootstrap, configuration, verification, and production boundaries. Never publish the local API or PostgreSQL port directly to the internet.
