# DockPilot architecture

**Product:** DockPilot — “Docker, without the guessing.”  
**Status:** milestones 0 and 1 complete; milestone 2, the secure MCP control layer, is a BETA.

## Technology decisions

This is a private npm-workspaces monorepo using TypeScript, Node.js 20+, React 19/Vite, Fastify 5, PostgreSQL 17, and Drizzle ORM. React and Fastify are separate workspaces: the browser never receives Docker credentials or performs Docker actions. The Docker agent is a separately deployable, planned component; it will make allowlisted, validated API calls, never accept arbitrary shell commands. PostgreSQL makes organization scoping, relational integrity, sessions, AI authorization and operational history explicit. The Vite development proxy keeps browser requests same-origin and avoids permissive API CORS. The MCP control layer is built on the official `@modelcontextprotocol/sdk` and reuses the same service layer as the REST API.

## Security model and first slice

- A single Docker Compose PostgreSQL service binds **only** to loopback and stores data in a named volume. The development password is intentionally unsuitable for production. Do not reuse it.
- A human-authenticated API trusts the browser's exact configured Origin; cookie-authenticated mutations without that Origin receive `403`. No reflected wildcard CORS or proxy trust by default.
- The initial unconfigured installation can create **one** owner account and organization. Concurrent setup requests are serialized by PostgreSQL advisory lock. Once an owner exists, setup is permanently disabled through the public API. Configure account recovery before exposing the service; no unauthenticated reset route is planned.
- Passwords are stored as Argon2id PHC hashes. Applications never log passwords. Sessions use independently generated opaque random tokens; only a keyed digest is stored, cookies are HttpOnly/SameSite, Secure in production, and application sessions have a fixed seven-day expiry and server-side revocation. TLS termination is mandatory for production.
- PostgreSQL transactions contain setup identity, organization membership, and append-only administrative audit events together. API database access always uses organization-scoped queries. Roles are defined centrally rather than inferred from client input.
- Body schemas are strict. Request sizes, security headers, login/bootstrap rate limits, and generic credential errors are enforced at the API boundary.
- Agent requests use a versioned, strict shared protocol. Protocol data is untrusted. Agent-specific mutual authentication and replay protection must be implemented before admitting agents; no dashboard action may execute arbitrary host commands.

## MCP control layer

An external AI agent talks to DockPilot over MCP. The gateway is deliberately thin: it authorizes, validates, rate limits, dispatches and audits, then delegates to the same services the web API uses. There is no second implementation of business logic behind MCP.

```text
AI agent
   |  MCP over Streamable HTTP (bearer token)  or  stdio (local development)
   v
DockPilot MCP gateway  (apps/api/src/mcp)
   |  authenticate -> rate limit -> strict validate -> authorize
   v
DockPilot service layer  (apps/api/src/services)
   |
   +-- PostgreSQL / Drizzle (users, sessions, AI credentials, approvals, audit log)
```

### Transport and authentication

The production transport is a stateless Streamable HTTP endpoint at `POST/GET/DELETE /api/v1/mcp`, mounted inside the authenticated API. A local stdio transport exists for development. Both require a dedicated **AI credential**; browser session cookies are never accepted on this endpoint, so an agent cannot borrow an administrator's session, and the endpoint is exempt from the cookie-oriented Origin check because the bearer token is the whole credential.

Credentials follow the same least-exposure principle as sessions: 32 random bytes rendered as `dpai_` plus 43 URL-safe characters, shown exactly once at creation, stored only as an HMAC-SHA256 digest keyed by `MCP_TOKEN_SECRET`. Production refuses to start while MCP is enabled and that key is missing; outside production it is derived from `SESSION_SECRET`. Credentials carry a permission level, an optional agent identity, optional metadata, an optional expiry and separate `revokedAt`/`disabledAt` state, so an operator can retire access without deleting history. Authentication distinguishes missing, malformed, unknown, revoked, disabled and expired credentials without revealing which check failed.

### Permissions and tool design

Permissions are ordered `read`, `write`, `destructive` from least to most privileged and are checked server-side from the stored credential, never from client input. No tool accepts a permission, role or scope parameter, so a credential cannot escalate itself. Tools are narrow and individually named; there is intentionally no shell, SQL, Docker-socket or catch-all execution tool. Tool metadata (permission level, rate category, action type, destructive flag) is declared once in `packages/shared/src/mcp.ts`, and the API registry derives from it, so contract and enforcement cannot drift. Input and output schemas use strict objects with `additionalProperties: false`; inputs are validated again in the dispatch layer so that malformed input is audited rather than silently dropped.

### Human approval for destructive actions

Requesting a destructive change and performing it are separate steps. A destructive tool records a pending `ai_approvals` row (requesting credential, agent identity, tool, action type, target, justification, one-hour expiry) and returns `approvalRequired`. An administrator approves or rejects it through the admin API. Approval executes the action inside a transaction that locks the approval row, writes the execution audit event and stores its id on the approval; rejection, expiry and any other action type execute nothing. This keeps irreversible work behind a human decision without adding friction to read-only use.

### Audit integrity and failure behavior

Every MCP call — successful, denied, rate limited, malformed or failed — writes an audit event carrying the correlation ID, credential and agent identity, tool, action, permission used, target, sanitized input, result summary, outcome, error category and duration. Three properties matter:

- **Append-only.** A `BEFORE UPDATE OR DELETE` trigger on `audit_logs` raises an exception, so no application code path can rewrite or erase history. Administrators read history; they cannot mutate it.
- **Fail closed.** Mutating tools perform the business write and the audit insert in one transaction. If the audit cannot be persisted, the change rolls back and the caller receives an error rather than an unlogged success.
- **Redacted at the boundary.** A recursive redactor replaces values whose keys look like secrets and enforces depth, array-length, string-length and total-payload limits before persistence. Responses are summarized rather than stored whole.

Correlation IDs come from a validated `X-Correlation-Id` header or are generated, and are echoed to the client so an operator can line up an agent request, its audit event and the backend work.

### Rate limiting and error model

Rate limits are per credential and keyed by rate category (read, write, destructive), with a separate per-address limiter in front of authentication so credential guessing is throttled before it touches the database. Errors are deterministic and safe: authentication failures return a JSON-RPC error with `401` and a `WWW-Authenticate` header, while tool-level failures return an `isError` result whose text names the category. Stack traces, SQL, filesystem paths, connection strings and secrets never cross the boundary; diagnostics stay in the server log.

### Administrator surface

Administrator-only REST routes under `/api/v1/admin` expose system status, AI credential lifecycle, audit events and approvals, all with server-side keyset pagination and bounded page sizes so no unbounded log ever reaches a browser. The dashboard's AI control area presents the same data: credential management, a filterable and paginated audit log with redacted event detail, and an approval inbox where destructive requests are granted or refused.

## Package layout

- `apps/web` — React dashboard and safe, same-origin typed API client.
- `apps/api` — Fastify API, PostgreSQL connection, Drizzle schema/migrations, authentication and authorization, the MCP gateway (`src/mcp`), administrator routes, and the shared service layer (`src/services`).
- `packages/shared` — strict runtime validation, the versioned client/agent protocol, and the MCP tool contract.
- `infrastructure/compose.yaml` — local, loopback-only PostgreSQL for development and integration tests.
- `agent/` — reserved for the small least-privilege Docker host agent, to be implemented after the central platform's API contracts stabilize.

## Deliberate milestones

0. Reproducible monorepo, threat model, architecture record and local database (implemented).
1. Relational foundations, one-time owner setup, Argon2id credentials, revocable sessions, RBAC boundaries, audit log, API tests (implemented).
2. Secure MCP control layer: dedicated AI credentials, narrow permissioned tools, human approval for destructive requests, complete append-only AI audit logging, administrator AI activity dashboard, rate limiting, adversarial tests (BETA).
3. Docker agent resource collectors and validated action allowlist.
4. Authenticated, encrypted, versioned and replay-resistant agent communication.
5. Live multi-host dashboard driven by real API/database state, with informative no-host empty state.
6. Safe container operations with explicit authorization and audit history.
7. Live health and resource monitoring.
8. Compose discovery and safe diff/preview.
9. Deterministic Docker Doctor security/reliability diagnostics.
10. Previewed, backup-protected image updates.
11. Acknowledgable and resolvable alerts.
12. Verified backups and tested restore flow.
13. Authorized declarative automation.
14. Security review and production hardening.
15. Documented containerized production deployment and migration procedure.
16. Accessibility, documentation and usability polish.

Each capability is driven by validated, real state; planned capabilities are not faked in the dashboard. A milestone is ready to ship only after automated checks, a local production build, documentation, and an explicit security review.

## Local development

See `README.md` for bootstrap, configuration, verification, and production boundaries. Never publish the local API or PostgreSQL port directly to the internet.
