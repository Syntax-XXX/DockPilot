# DockPilot

**Docker, without the guessing.**

A self-hosted Docker infrastructure control center built around clear, actionable insight across hosts—not just buttons that issue container commands.

DockPilot is a web dashboard, a typed API, and an MCP control layer for external AI agents. It runs on your own server, stores everything in your own PostgreSQL database, and is designed to stay private by default.

> **Alpha release.** DockPilot is early software. Some parts work, some parts are placeholders, and some parts described in the roadmap are not built yet. The dashboard is honest about what is missing instead of faking infrastructure. If a feature is not implemented, it is not represented as working.

## What exists today

- A React dashboard and a Fastify API running as separate services.
- One-time owner setup and Argon2id password authentication.
- Revocable server-side sessions.
- A relational PostgreSQL schema with organization scoping, sessions, audit logs, AI credentials, and approval records.
- A secure MCP control layer so an external AI agent can inspect DockPilot and request narrowly scoped changes, with human approval required for destructive work.
- A Docker vertical slice: register a Docker host over an allowlisted socket, sync and browse its containers, read logs, sample live CPU/memory/network stats, and start, stop, or restart containers. Host images, volumes, and networks can be browsed (dangling images are flagged), and a read-only Docker Doctor runs connectivity, stopped-container, and storage checks against a host.
- Admin-visible AI credential management, AI activity logs, and an approval inbox.
- Rate limiting, input validation, correlation IDs, and append-only audit logging.
- A themed `install.sh` that verifies prerequisites, generates secrets, starts local PostgreSQL, migrates, and starts the stack.
- Automated unit and integration tests, including adversarial MCP security tests.

## What does not work yet

- Only Docker **hosts** registered over unix sockets are supported. There is no remote agent enrollment, no TLS-secured remote Docker endpoint, and no multi-host scheduling.
- Volume and network inventories are read-only; there is no create/remove/prune lifecycle for them. Image pulls/builds, exec into containers, backup/restore, notifications, update execution, integrations, and automation are future work. They are not implemented and are not presented as working features.
- The MCP tools operate on Docker hosts and DockPilot's own data. There is no shell execution tool, no arbitrary SQL tool, and no generic "execute anything" tool. Container removal, host removal, and image removal are never executed directly by an agent — they only create approvals.
- Destructive actions that can be approved and executed today: session revocation, AI credential revocation, container removal, host removal, and image removal.
- DockPilot still provisions a single organization with a single initial owner. Multi-tenant administration and finer-grained roles are not implemented.
- Audit retention is manual. There is no automatic pruning or archival.
- Password recovery is not implemented.

## Requirements

- Node.js **20.19+** and npm **10+**.
- Docker Engine and Docker Compose.
- No globally installed PostgreSQL required for local development. A loopback-only PostgreSQL instance runs in Compose.

## Quick start

The fastest path is the installer. It checks your toolchain, generates secrets, starts the local
PostgreSQL container, applies migrations, and offers to start the dev servers:

```sh
./install.sh
```

Add `--yes` for a non-interactive run, `--no-start` to install without launching servers, or
`--prod` to build production bundles. Use `./install.sh --help` for all options.

Prefer to do it by hand? The rest of this section is the equivalent manual flow.

```sh
npm install
cp .env.example .env
```

Generate two independent development secrets:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set the first result as `SESSION_SECRET` and a second, separately generated result as `MCP_TOKEN_SECRET` in `.env`.

The example values are deliberately rejected at startup, so the API will not run until you replace them. Keep `.env` secret. It is excluded from version control.

```sh
npm run db:up
npm run db:migrate
npm run dev
```

By default:

- Web dashboard: `http://127.0.0.1:5173`
- API health and setup status: `http://127.0.0.1:4000/api/v1/health`
- MCP endpoint: `http://127.0.0.1:4000/api/v1/mcp` (bearer-token authenticated; see the MCP section below)
- PostgreSQL listens **only on** `127.0.0.1:54329`. Database data persists in a named Compose volume.

The first run presents a setup form that creates one owner account and organization. After that, setup is permanently disabled through the public API. Do not expose the unauthenticated setup endpoint beyond a trusted loopback development environment.

## Architecture

DockPilot is an npm workspaces monorepo.

- `apps/web` — React dashboard and a same-origin typed API client.
- `apps/api` — Fastify API, PostgreSQL connection, Drizzle schema and migrations, authentication, authorization, administrator routes, the MCP gateway, and the shared service layer.
- `packages/shared` — strict runtime validation, the versioned client/agent protocol, and the MCP tool contract.
- `infrastructure/compose.yaml` — local loopback-only PostgreSQL for development and integration tests.

The browser never receives Docker credentials or performs Docker actions. The Docker agent is a separately deployable, planned component that will make allowlisted, validated API calls. It is not part of this release.

The MCP gateway is intentionally thin. It authenticates, rate limits, validates, authorizes, dispatches, and audits, then delegates to the same service layer the REST API uses. There is no second business logic implementation behind MCP.

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

## MCP control layer

DockPilot exposes a Model Context Protocol server so an external AI agent can read real DockPilot state and request narrowly scoped changes.

The control layer is deliberately conservative:

- It contains **no business logic of its own**. Every tool calls the same DockPilot service layer that the web API uses.
- There is **no shell execution tool, no arbitrary SQL tool, no Docker socket access, and no generic "execute anything" tool**. Each capability is a separate, named tool with its own input schema, permission level, and audit category.
- Docker and agent operations are **not implemented**, so no MCP tool claims to perform them. The tools that exist operate strictly on DockPilot's own data: users, sessions, AI credentials, approvals, and the audit log.
- Genuinely destructive requests do not execute. They create a pending **human approval request** that an administrator must decide.

### Transport

The MCP endpoint is a stateless **Streamable HTTP** endpoint that accepts `POST`, `GET`, and `DELETE` at `/api/v1/mcp` and answers with JSON responses. It is registered only when `MCP_ENABLED` is not `false`.

The endpoint authenticates with a bearer token, never with a browser cookie. Because the token is the entire credential, the MCP endpoint is exempt from the cookie-oriented Origin check that protects the rest of the API.

For local development, an optional **stdio** entry point is available. It authenticates once at startup from an environment variable and speaks MCP over stdin/stdout, logging only to stderr:

```sh
DOCKPILOT_MCP_TOKEN=dpai_replace_with_a_real_credential_token npm run mcp:stdio --workspace=@dockpilot/api
```

### AI credentials and authentication

External agents never reuse an administrator's browser session. They authenticate with a dedicated **AI credential**.

- Tokens are 32 random bytes rendered as `dpai_` followed by 43 URL-safe characters.
- The raw token is returned **exactly once**, in the create response. It is never stored in plaintext and never returned by any other endpoint.
- Only an HMAC-SHA256 digest is persisted, keyed by `MCP_TOKEN_SECRET`. In non-production the key falls back to a value derived from `SESSION_SECRET`. **Production refuses to start while MCP is enabled and `MCP_TOKEN_SECRET` is missing.**
- Each credential records a name, an optional description, an optional agent identity, a permission level, an optional expiry of 1 to 365 days, an optional metadata object, a token prefix for identification, and `createdAt`, `lastUsedAt`, `revokedAt`, and `disabledAt` timestamps.
- Credentials are revoked by an administrator and rejected immediately afterward. Unknown, malformed, revoked, disabled, and expired tokens all fail authentication.

`GET /api/v1/mcp` and `DELETE /api/v1/mcp` run the same credential check before the transport answers the request, so a probe can never bypass authentication.

### Permission levels

Permissions are ordered `read`, `write`, `destructive` from least to most privileged. They are enforced on the server for every tool call using the stored permission level of the authenticated credential. A credential can never raise its own permission level. No tool accepts a permission, role, or scope as input.

### Tools

- `dockpilot_health` — **read**. Reports API availability, the MCP contract version, and live database reachability.
- `dockpilot_system_status` — **read**. Returns organization-scoped counts for users, active sessions, AI credentials, pending approvals, and 24-hour audit volume.
- `dockpilot_list_users` — **read**. Lists organization users with bounded, keyset-paginated pages.
- `dockpilot_list_sessions` — **read**. Lists browser sessions belonging to organization users.
- `dockpilot_list_ai_credentials` — **read**. Lists AI credentials. Raw tokens are never returned.
- `dockpilot_list_audit_events` — **read**. Filters and pages audit events. Event summaries are redacted.
- `dockpilot_get_audit_event` — **read**. Returns a single redacted audit event.
- `dockpilot_list_approvals` — **read**. Lists approval requests, optionally filtered by status.
- `dockpilot_update_my_credential` — **write**. Updates only the calling credential's description, agent identity, and metadata.
- `dockpilot_list_hosts` — **read**. Lists registered Docker hosts with bounded, keyset-paginated pages.
- `dockpilot_get_host` — **read**. Returns a single registered Docker host.
- `dockpilot_list_containers` — **read**. Lists synced containers for a host.
- `dockpilot_get_container_logs` — **read**. Returns a bounded tail of a container's logs.
- `dockpilot_get_container_stats` — **read**. Returns one CPU, memory, network, and block I/O sample for a container.
- `dockpilot_list_images` — **read**. Lists the images present on a host.
- `dockpilot_list_volumes` — **read**. Lists the volumes present on a host.
- `dockpilot_list_networks` — **read**. Lists the networks present on a host.
- `dockpilot_run_host_diagnostics` — **read**. Runs read-only Docker Doctor checks against a host.
- `dockpilot_docker_summary` — **read**. Returns organization-scoped host and container counts.
- `dockpilot_create_host` — **write**. Registers a Docker host over an allowlisted socket.
- `dockpilot_update_host` — **write**. Updates a host's name, description, labels, metadata, or endpoint.
- `dockpilot_sync_host_containers` — **write**. Re-syncs a host's container inventory.
- `dockpilot_set_container_state` — **write**. Starts, stops, or restarts a container.
- `dockpilot_request_session_revocation` — **destructive**. Creates a pending approval to revoke a browser session. Requires a written justification.
- `dockpilot_request_credential_revocation` — **destructive**. Creates a pending approval to revoke an AI credential. Requires a written justification.
- `dockpilot_request_container_removal` — **destructive**. Creates a pending approval to remove a container. Requires a written justification.
- `dockpilot_request_host_removal` — **destructive**. Creates a pending approval to remove a Docker host. Requires a written justification.
- `dockpilot_request_image_removal` — **destructive**. Creates a pending approval to remove an image from a host. Requires a written justification.

Tool metadata lives in one place, `packages/shared/src/mcp.ts`, so the shared contract and the API tool registry cannot disagree about permission level, rate category, or action name. Every tool advertises a strict JSON Schema with `additionalProperties: false`, and inputs are re-validated strictly on the server before any handler runs.

Every failure is distinguishable and audited: unknown tool, invalid or malformed input, insufficient permission, rate limited, resource not found, conflict, and internal error.

### Rate limiting

In addition to the global per-IP API limit, MCP requests are limited per credential with fixed windows:

- **read** — 120 requests per minute.
- **write** — 20 requests per minute.
- **destructive** — 5 requests per 5 minutes.

Authentication attempts are limited separately to 20 per minute per client address, so credential guessing is throttled before it reaches the database. Credential-based limits mean one busy agent cannot exhaust another agent's budget.

### Human approval for destructive work

The destructive tools never perform the action they describe. They create a pending approval request that records the requesting credential, agent identity, tool, action type, target, and justification, and expires one hour after creation. An administrator then approves or rejects it.

Only on approval does DockPilot execute the action, inside a single database transaction that locks the approval row and writes the execution audit event. Rejected, expired, and already-decided requests cannot execute anything. Approving a request whose target has disappeared results in a recorded `failed` approval instead of a silent success. The executable action types are currently `session.revoke`, `ai_credential.revoke`, `container.remove`, `host.remove`, and `image.remove`. Any other action type is refused.

Read-only tools never require approval.

### Audit logging

Every MCP tool call produces an audit event, including calls that fail before any work happens: unknown tools, invalid input, insufficient permission, rate-limited attempts, and internal failures. Each event records the correlation ID, the AI credential ID and agent identity, the tool name, the action, the permission used, the target, a sanitized input summary, a result summary, the outcome, an error category, and the duration in milliseconds. Administrator-initiated credential and approval changes are audited with the administrator's user ID.

Key behaviors:

- **Append-only by construction.** A PostgreSQL trigger rejects `UPDATE` and `DELETE` on `audit_logs`, so no application path can rewrite or erase history.
- **Fail closed.** For mutating tools, the business write and the audit insert commit in the same transaction. If the audit record cannot be persisted, the change is rolled back and the tool returns an error.
- **Redacted before storage.** Values whose keys match patterns like password, secret, token, authorization, cookie, API key, private key, credential, hash, signature, or session are replaced with `[REDACTED]`. Payloads are capped at 4096 bytes, nested five levels deep, 20 array items, and 512 characters per string. Raw tool responses are not stored; array results are recorded as counts.
- **Correlation IDs.** A valid `X-Correlation-Id` request header is reused if it matches the expected shape; otherwise DockPilot generates one. The value is written to the audit event and echoed back on the response.

### Admin API and dashboard

Administrator-only REST routes, for roles `owner` and `admin`, live under `/api/v1/admin`:

- `GET /system-status`
- `GET /ai-credentials` and `POST /ai-credentials`
- `POST /ai-credentials/:id/revoke`
- `GET /audit-events` and `GET /audit-events/:id`
- `GET /approvals` and `POST /approvals/:id/decision`
- `GET /hosts` and `POST /hosts` — register and list Docker hosts.
- `GET /hosts/:id`, `PATCH /hosts/:id`, and `DELETE /hosts/:id` — read, update, or request removal through approval.
- `POST /hosts/:id/sync` — re-sync the host's containers.
- `GET /hosts/:id/containers` — list synced containers.
- `GET /hosts/:id/images` and `DELETE /hosts/:id/images` — list images, or request an image removal through approval.
- `GET /hosts/:id/diagnostics` — run read-only Docker Doctor checks.
- `GET /containers/:containerId/logs` — read a bounded log tail.
- `GET /containers/:containerId/stats` — one live stats sample.
- `POST /containers/:containerId/:action` — start, stop, or restart; `DELETE /containers/:containerId` requests removal through approval.
- `GET /docker-summary` — organization-scoped host and container counts.

The create credential response is the only place a token is ever returned.

All list endpoints use server-side keyset pagination with a bounded page size, so the browser never loads the whole log. Filters include credential, tool, action, outcome, target, and a time range. Stored values stay redacted when an administrator opens an individual event.

The dashboard exposes the same data through an **AI control area**: create and revoke AI credentials, review the audit log with filters, pagination, and per-event detail, and decide pending approvals. Destructive requests are presented as approvals to grant or refuse, never as actions already taken.

## Configuration

DockPilot is configured through environment variables. The relevant files are `.env.example` at the repository root and `apps/api/.env.example`.

Core variables include:

- `NODE_ENV` — `development`, `test`, or `production`.
- `DATABASE_URL` — PostgreSQL connection string.
- `SESSION_SECRET` — unique, high-entropy session key.
- `MCP_ENABLED` — set to `false` to serve no MCP endpoint at all.
- `MCP_TOKEN_SECRET` — independent HMAC key for AI credential tokens.
- `HOST`, `API_PORT`, `WEB_PORT`, `WEB_ORIGIN`, `API_PUBLIC_URL`, `TRUSTED_PROXY` — network and origin settings.
- `DOCKPILOT_DOCKER_SOCKETS` — comma-separated absolute `unix://` socket paths that Docker host registration may use. Defaults to `/var/run/docker.sock,/run/docker.sock`; endpoints outside the allowlist are rejected.

Production requires a unique, cryptographically generated `SESSION_SECRET` and, when MCP is enabled, an independent `MCP_TOKEN_SECRET`. The startup validation rejects placeholder values.

## Security model

The development Compose file and example passwords are **not production deployment instructions**.

A production installation needs:

- externally provisioned PostgreSQL,
- unique high-entropy secrets for `SESSION_SECRET` and `MCP_TOKEN_SECRET`,
- HTTPS,
- secure secret management,
- reviewed network and firewall policy,
- regular database backups.

Never expose PostgreSQL, the Docker socket, or an agent's Docker socket to a public interface. Never put a production secret in browser code, a checked-in `.env`, a Docker image, logs, or the agent registration UI. Reverse-proxy trust is disabled by default. Configure and review that boundary before deploying behind a proxy. Authentication and request validation do not replace TLS.

The MCP endpoint is a network-reachable, credential-authenticated interface. Treat each AI credential as a production secret. Grant the lowest permission level that works, prefer expiries, revoke credentials you no longer use, and keep `MCP_ENABLED=false` on instances where no agent should connect.

## Checks

```sh
npm run db:up
npm run db:migrate
npm run typecheck
npm run test:unit       # No database required.
npm run test:integration # Applies migrations; requires `npm run db:up`.
npm test                # Runs unit and integration suites.
npm run lint
npm run build
npm run format:check
```

Unit tests cover redaction, rate limiting, pagination cursors, permission ordering, and the tool catalog.

The integration suite applies migrations against the configured database and drives the real HTTP surfaces, including an MCP client test that authenticates, discovers tools, calls them, and checks the resulting audit records. Adversarial security tests attempt privilege escalation, credential reuse after revocation, cross-credential access, audit tampering, injection, and traversal.

The PostgreSQL schema is versioned in `apps/api/drizzle/`. Migrations are safe to re-run. Integration tests truncate only DockPilot tables in the configured test database before each test. Configure `DATABASE_URL` to a dedicated test database when running tests against a non-development database.

`npm run db:down` stops the development database but preserves its volume. `docker compose -f infrastructure/compose.yaml down --volumes` **deletes the local database and every local DockPilot account and record**. Do not run it if you want to keep that data.

## Documentation

Architecture and threat model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Status

This is an **alpha** release, not a finished product. It is meant to be usable, testable, and extensible, with honest placeholders where the real infrastructure work is not done yet.
