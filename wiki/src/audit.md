# Audit logging

Every MCP tool call produces an audit event, including calls that fail before any work happens.

## What is recorded

Each audit event records:

- the correlation ID,
- the AI credential ID and agent identity,
- the tool name,
- the action,
- the permission used,
- the target,
- a sanitized input summary,
- a result summary,
- the outcome,
- an error category,
- the duration in milliseconds.

Administrator-initiated credential and approval changes are audited with the administrator's user ID.

## Outcome types

- `success`
- `failure`
- `denied`

Failures include a non-null error category. Denials include authorization, validation, rate limiting, not found, conflict, and authentication cases.

## Integrity

- **Append-only by construction.** A PostgreSQL trigger rejects `UPDATE` and `DELETE` on `audit_logs`, so no application path can rewrite or erase history.
- **Fail closed.** For mutating tools, the business write and the audit insert commit in the same transaction. If the audit record cannot be persisted, the change is rolled back and the tool returns an error.
- **Redacted before storage.** Values whose keys match patterns like password, secret, token, authorization, cookie, API key, private key, credential, hash, signature, or session are replaced with `[REDACTED]`. Payloads are capped at 4096 bytes, nested five levels deep, 20 array items, and 512 characters per string. Raw tool responses are not stored; array results are recorded as counts.

## Correlation IDs

A valid `X-Correlation-Id` request header is reused if it matches the expected shape; otherwise DockPilot generates one. The value is written to the audit event and echoed back on the response.

## Admin access

The audit log is available through:

- `GET /api/v1/admin/audit-events`
- `GET /api/v1/admin/audit-events/:id`

Both support server-side keyset pagination with a bounded page size. Filters include credential, tool, action, outcome, target, and a time range. Stored values stay redacted when an administrator opens an individual event.

## Retention

Audit retention is manual. There is no automatic pruning or archival. Events accumulate until an operator handles them.
