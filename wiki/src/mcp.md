# MCP control layer

DockPilot exposes a Model Context Protocol server so an external AI agent can read real DockPilot state and request narrowly scoped changes.

## Transport

The MCP endpoint is a stateless **Streamable HTTP** endpoint that accepts `POST`, `GET`, and `DELETE` at `/api/v1/mcp` and answers with JSON responses. It is registered only when `MCP_ENABLED` is not `false`.

For local development, an optional **stdio** entry point is available. It authenticates once at startup from an environment variable and speaks MCP over stdin/stdout, logging only to stderr.

## Authentication

External agents never reuse an administrator's browser session. They authenticate with a dedicated **AI credential**.

- Tokens are 32 random bytes rendered as `dpai_` followed by 43 URL-safe characters.
- The raw token is returned **exactly once**, in the create response. It is never stored in plaintext and never returned by any other endpoint.
- Only an HMAC-SHA256 digest is persisted, keyed by `MCP_TOKEN_SECRET`. In non-production the key falls back to a value derived from `SESSION_SECRET`. **Production refuses to start while MCP is enabled and `MCP_TOKEN_SECRET` is missing.**
- Credentials carry a name, an optional description, an optional agent identity, a permission level, an optional expiry of 1 to 365 days, an optional metadata object, a token prefix for identification, and `createdAt`, `lastUsedAt`, `revokedAt`, and `disabledAt` timestamps.
- Credentials are revoked by an administrator and rejected immediately afterward. Unknown, malformed, revoked, disabled, and expired tokens all fail authentication.

`GET /api/v1/mcp` and `DELETE /api/v1/mcp` run the same credential check before the transport answers the request, so a probe can never bypass authentication.

## Permissions

Permissions are ordered `read`, `write`, `destructive` from least to most privileged. They are enforced on the server for every tool call using the stored permission level of the authenticated credential. A credential can never raise its own permission level. No tool accepts a permission, role, or scope as input.

## Tools

- `dockpilot_health` — **read**. Reports API availability, the MCP contract version, and live database reachability.
- `dockpilot_system_status` — **read**. Returns organization-scoped counts for users, active sessions, AI credentials, pending approvals, and 24-hour audit volume.
- `dockpilot_list_users` — **read**. Lists organization users with bounded, keyset-paginated pages.
- `dockpilot_list_sessions` — **read**. Lists browser sessions belonging to organization users.
- `dockpilot_list_ai_credentials` — **read**. Lists AI credentials. Raw tokens are never returned.
- `dockpilot_list_audit_events` — **read**. Filters and pages audit events. Event summaries are redacted.
- `dockpilot_get_audit_event` — **read**. Returns a single redacted audit event.
- `dockpilot_list_approvals` — **read**. Lists approval requests, optionally filtered by status.
- `dockpilot_update_my_credential` — **write**. Updates only the calling credential's description, agent identity, and metadata.
- `dockpilot_request_session_revocation` — **destructive**. Creates a pending approval to revoke a browser session. Requires a written justification.
- `dockpilot_request_credential_revocation` — **destructive**. Creates a pending approval to revoke an AI credential. Requires a written justification.

Tool metadata lives in one place, `packages/shared/src/mcp.ts`, so the shared contract and the API tool registry cannot disagree about permission level, rate category, or action name. Every tool advertises a strict JSON Schema with `additionalProperties: false`, and inputs are re-validated strictly on the server before any handler runs.

There is **no shell execution tool, no arbitrary SQL tool, no Docker socket access, and no generic "execute anything" tool**.

## Rate limiting

In addition to the global per-IP API limit, MCP requests are limited per credential with fixed windows:

- **read** — 120 requests per minute.
- **write** — 20 requests per minute.
- **destructive** — 5 requests per 5 minutes.

Authentication attempts are limited separately to 20 per minute per client address, so credential guessing is throttled before it reaches the database.

## Human approval for destructive work

The two destructive tools never perform the action they describe. They create a pending approval request that records the requesting credential, agent identity, tool, action type, target, and justification, and expires one hour after creation. An administrator then approves or rejects it.

Only on approval does DockPilot execute the action, inside a single database transaction that locks the approval row and writes the execution audit event. Rejected, expired, and already-decided requests cannot execute anything. Approving a request whose target has disappeared results in a recorded `failed` approval instead of a silent success. The executable action types are currently `session.revoke` and `ai_credential.revoke`. Any other action type is refused.

Read-only tools never require approval.

## Audit logging

Every MCP tool call produces an audit event, including calls that fail before any work happens: unknown tools, invalid input, insufficient permission, rate-limited attempts, and internal failures. Each event records the correlation ID, the AI credential ID and agent identity, the tool name, the action, the permission used, the target, a sanitized input summary, a result summary, the outcome, an error category, and the duration in milliseconds. Administrator-initiated credential and approval changes are audited with the administrator's user ID.

Key behaviors:

- **Append-only by construction.** A PostgreSQL trigger rejects `UPDATE` and `DELETE` on `audit_logs`, so no application path can rewrite or erase history.
- **Fail closed.** For mutating tools, the business write and the audit insert commit in the same transaction. If the audit record cannot be persisted, the change is rolled back and the tool returns an error.
- **Redacted before storage.** Values whose keys match patterns like password, secret, token, authorization, cookie, API key, private key, credential, hash, signature, or session are replaced with `[REDACTED]`. Payloads are capped at 4096 bytes, nested five levels deep, 20 array items, and 512 characters per string. Raw tool responses are not stored; array results are recorded as counts.
- **Correlation IDs.** A valid `X-Correlation-Id` request header is reused if it matches the expected shape; otherwise DockPilot generates one. The value is written to the audit event and echoed back on the response.
