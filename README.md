# DockPilot

**Docker, without the guessing.**

A self-hosted Docker infrastructure control center designed around clear, actionable insight across hosts—not just buttons that issue container commands.

> **Early, actively developed software.** Milestone 0 initializes the monorepo. Milestone 1 builds the real relational and human-authentication foundations. Milestone 2 adds a **secure MCP control layer** so that external AI agents can inspect DockPilot and, for genuinely destructive work, prepare changes that a human administrator must approve. Docker hosts are still not connected: the dashboard presents an honest empty state instead of fake infrastructure or mock containers.

## Requirements

- Node.js **20.19+** and npm **10+** (verify `npm --version`).
- Docker Engine and Docker Compose.
- No globally installed PostgreSQL required: development PostgreSQL runs in Compose.

## Quick start

```sh
npm install
cp .env.example .env
```

Generate two independent development secrets:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set the first result as `SESSION_SECRET` and a second, separately generated result as `MCP_TOKEN_SECRET` in `.env`.
The example values are deliberately rejected at startup, so the API will not run until you replace them.
Keep `.env` secret; it is excluded from version control.

```sh
npm run db:up
npm run db:migrate
npm run dev
```

- Web dashboard: http://127.0.0.1:5173
- API and setup status: http://127.0.0.1:4000/api/v1/health
- MCP endpoint: http://127.0.0.1:4000/api/v1/mcp (bearer-token authenticated; see below)
- PostgreSQL listens **only on** 127.0.0.1:54329. Database data persists in its named Compose volume.

The dashboard has an explicit first-run setup and login form. The initial installation can register **one owner only**. Do not expose the unauthenticated setup endpoint beyond the trusted loopback development environment. Setup becomes permanently disabled once an owner is registered.

## MCP control layer (BETA)

DockPilot exposes a Model Context Protocol server so an AI agent can read real DockPilot state and request narrowly scoped changes. The control layer is deliberately conservative:

- The MCP layer contains **no business logic of its own**. Every tool calls the same DockPilot service layer that the web API uses.
- There is **no shell execution tool, no arbitrary SQL tool, no Docker socket access and no generic "execute anything" tool**. Each capability is a separate, named tool with its own input schema, permission level and audit category.
- Docker and agent operations are **not implemented**, so no MCP tool claims to perform them. The tools that exist operate strictly on DockPilot's own data: users, sessions, AI credentials, approvals and the audit log.
- Genuinely destructive requests do not execute. They create a pending **human approval request** that an administrator must decide.

### Transport

The MCP endpoint is a stateless **Streamable HTTP** endpoint that accepts `POST`, `GET` and `DELETE` at `/api/v1/mcp` and answers with JSON responses. It is registered only when `MCP_ENABLED` is not `false`.

Because the endpoint authenticates with a bearer token and never with a browser cookie, it is exempt from the cookie-oriented Origin check that protects the rest of the API; the token is the entire credential.

For local development an optional **stdio** entry point is available. It authenticates once at startup from an environment variable and speaks MCP over stdin/stdout, logging only to stderr:

```sh
DOCKPILOT_MCP_TOKEN=dpai_replace_with_a_real_credential_token npm run mcp:stdio --workspace=@dockpilot/api
```

### AI credentials and authentication

External agents never reuse an administrator's browser session. They authenticate with a dedicated **AI credential**:

- Tokens are 32 random bytes rendered as `dpai_` followed by 43 URL-safe characters.
- The raw token is returned **exactly once**, in the create response. It is never stored in plaintext and never returned by any other endpoint.
- Only an HMAC-SHA256 digest is persisted, keyed by `MCP_TOKEN_SECRET`. In non-production the key falls back to a value derived from `SESSION_SECRET`; **production refuses to start while MCP is enabled and `MCP_TOKEN_SECRET` is missing**.
- Each credential records a name, an optional description, an optional agent identity, a permission level, an optional expiry (1–365 days), an optional metadata object, a token prefix for identification, and `createdAt`, `lastUsedAt`, `revokedAt` and `disabledAt` timestamps.
- Credentials are revoked by an administrator and rejected immediately afterwards. Unknown, malformed, revoked, disabled and expired tokens all fail authentication.

`GET /api/v1/mcp` and `DELETE /api/v1/mcp` run the same credential check before the transport answers the request, so a probe can never bypass authentication.

### Permission levels

Permissions are ordered `read`, `write`, `destructive` from least to most privileged, and are enforced on the server for every tool call using the stored permission level of the authenticated credential. A credential can never raise its own permission level: no tool accepts a permission, role or scope as input.

### Tools

- `dockpilot_health` — **read**. Reports API availability, the MCP contract version and live database reachability.
- `dockpilot_system_status` — **read**. Returns organization-scoped counts for users, active sessions, AI credentials, pending approvals and 24-hour audit volume.
- `dockpilot_list_users` — **read**. Lists organization users with bounded, keyset-paginated pages.
- `dockpilot_list_sessions` — **read**. Lists browser sessions belonging to organization users.
- `dockpilot_list_ai_credentials` — **read**. Lists AI credentials; raw tokens are never returned.
- `dockpilot_list_audit_events` — **read**. Filters and pages audit events; event summaries are redacted.
- `dockpilot_get_audit_event` — **read**. Returns a single redacted audit event.
- `dockpilot_list_approvals` — **read**. Lists approval requests, optionally filtered by status.
- `dockpilot_update_my_credential` — **write**. Updates only the calling credential's description, agent identity and metadata.
- `dockpilot_request_session_revocation` — **destructive**. Creates a pending approval to revoke a browser session; requires a written justification.
- `dockpilot_request_credential_revocation` — **destructive**. Creates a pending approval to revoke an AI credential; requires a written justification.

Tool metadata lives in one place, `packages/shared/src/mcp.ts`, so the shared contract and the API tool registry cannot disagree about permission level, rate category or action name. Every tool advertises a strict JSON Schema with `additionalProperties: false`, and inputs are re-validated strictly on the server before any handler runs.

Every failure is distinguishable and audited: unknown tool, invalid or malformed input, insufficient permission, rate limited, resource not found, conflict and internal error.

### Rate limiting

In addition to the global per-IP API limit, MCP requests are limited per credential with fixed windows:

- **read** — 120 requests per minute.
- **write** — 20 requests per minute.
- **destructive** — 5 requests per 5 minutes.

Authentication attempts are limited separately to 20 per minute per client address, so credential guessing is throttled before it reaches the database. Credential-based limits mean one busy agent cannot exhaust another agent's budget.

### Human approval for destructive work

The two destructive tools never perform the action they describe. They create a pending approval request that records the requesting credential, agent identity, tool, action type, target and justification, and expires one hour after creation. An administrator then approves or rejects it.

Only on approval does DockPilot execute the action, inside a single database transaction that locks the approval row and writes the execution audit event. Rejected, expired and already-decided requests cannot execute anything, and approving a request whose target has disappeared results in a recorded `failed` approval instead of a silent success. The executable action types are currently `session.revoke` and `ai_credential.revoke`; any other action type is refused.

Read-only tools never require approval.

### Audit logging

Every MCP tool call produces an audit event, including calls that fail before any work happens: unknown tools, invalid input, insufficient permission, rate-limited attempts and internal failures. Each event records the correlation ID, the AI credential ID and agent identity, the tool name, the action, the permission used, the target, a sanitized input summary, a result summary, the outcome, an error category and the duration in milliseconds. Administrator-initiated credential and approval changes are audited with the administrator's user id.

- **Append-only by construction.** A PostgreSQL trigger rejects `UPDATE` and `DELETE` on `audit_logs`, so no application path can rewrite or erase history.
- **Fail closed.** For mutating tools the business write and the audit insert commit in the same transaction. If the audit record cannot be persisted, the change is rolled back and the tool returns an error.
- **Redacted before storage.** Values whose keys match password, passphrase, secret, token, authorization, cookie, API key, private key, credential, hash, signature or session are replaced with `[REDACTED]`. Payloads are capped at 4096 bytes, nested five levels deep, 20 array items and 512 characters per string. Raw tool responses are not stored: array results are recorded as counts.
- **Correlation IDs.** A valid `X-Correlation-Id` request header is reused (8–64 URL-safe characters); otherwise DockPilot generates one. The value is written to the audit event and echoed back on the response.

### Admin API and dashboard

Administrator-only REST routes (roles `owner` and `admin`) live under `/api/v1/admin`:

- `GET /system-status`
- `GET /ai-credentials` and `POST /ai-credentials` (the create response is the only place a token is ever returned)
- `POST /ai-credentials/:id/revoke`
- `GET /audit-events` and `GET /audit-events/:id`
- `GET /approvals` and `POST /approvals/:id/decision`

All list endpoints use server-side keyset pagination with a bounded page size, so the browser never loads the whole log. Filters include credential, tool, action, outcome, target and a time range. Stored values stay redacted when an administrator opens an individual event.

The dashboard exposes the same data through an **AI control area**: create and revoke AI credentials, review the audit log with filters, pagination and per-event detail, and decide pending approvals. Destructive requests are presented as approvals to grant or refuse, never as actions already taken.

## Checks

```sh
npm run db:up
npm run db:migrate
npm run typecheck
npm run test:unit       # No database required.
npm run test:integration # Applies migrations; requires `npm run db:up`.
npm test               # Runs unit and integration suites.
npm run lint
npm run build
npm run format:check
```

Unit tests cover redaction, rate limiting, pagination cursors, permission ordering and the tool catalog. The integration suite applies migrations against the configured database and drives the real HTTP surfaces, including an MCP client test that authenticates, discovers tools, calls them, and checks the resulting audit records. Adversarial security tests attempt privilege escalation, credential reuse after revocation, cross-credential access, audit tampering, injection and traversal.

The PostgreSQL schema is versioned in `apps/api/drizzle/`; migrations are safe to re-run. Integration tests truncate only DockPilot tables in the configured test database before each test. Configure `DATABASE_URL` to a dedicated test database when running tests against a non-development database.

`npm run db:down` stops the development database but preserves its volume. `docker compose -f infrastructure/compose.yaml down --volumes` **deletes the local database and every local DockPilot account and record**. Do not run it if you want to keep that data.

## Production security boundary

**The development Compose file and example passwords are not production deployment instructions.** A production installation needs externally provisioned PostgreSQL, unique high-entropy secrets for `SESSION_SECRET` and `MCP_TOKEN_SECRET`, HTTPS, secure secret management, reviewed network/firewall policy and regular database backups. Never expose PostgreSQL, the Docker socket or an agent's Docker socket to a public interface. Never put a production secret in browser code, a checked-in `.env`, a Docker image, logs or the agent registration UI. Reverse-proxy trust is disabled by default; configure and review that boundary before deploying behind a proxy. Authentication and request validation do not replace TLS.

The MCP endpoint is a network-reachable, credential-authenticated interface. Treat each AI credential as a production secret, grant the lowest permission level that works, prefer expiries, revoke credentials you no longer use, and keep `MCP_ENABLED=false` on instances where no agent should connect.

## BETA limitations

- **Docker is not connected.** Hosts, agents, containers, images, volumes, networks, container logs and Docker Doctor diagnostics are not implemented. Milestone 2 deliberately ships a control layer over the data that actually exists rather than inventing container operations.
- **Agent enrollment and arbitrary container operations are future scope.** They will arrive as narrow, allowlisted service operations with authorization and auditing, never as shell or Docker command execution.
- **The stdio transport is for local development.** It reads one credential from the environment at startup and is not a multi-tenant transport.
- **Approvals cover two action types.** Only session revocation and AI credential revocation can be approved and executed today.
- **One organization.** DockPilot still provisions a single organization with a single initial owner; multi-tenant administration and role management are not implemented.
- **Audit retention is manual.** There is no automatic pruning or archival; events accumulate until an operator handles them.
- **No password recovery.** Password reset and account recovery are not implemented.

Agent enrollment, Docker operations, metrics, backup/restore, notifications, update execution, integrations and automation are **not implemented yet**; they are deliberately not represented as functioning features. Architecture and threat model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
