# Admin surface

Administrator-only REST routes, for roles `owner` and `admin`, live under `/api/v1/admin`.

## System status

- `GET /system-status`

Returns organization-scoped counts for users, active sessions, AI credentials, pending approvals, and 24-hour audit volume.

## AI credentials

- `GET /ai-credentials`
- `POST /ai-credentials`
- `POST /ai-credentials/:id/revoke`

The create response is the only place a token is ever returned.

## Audit events

- `GET /audit-events`
- `GET /audit-events/:id`

Filtering and pagination are supported. Stored values stay redacted when an administrator opens an individual event.

## Approvals

- `GET /approvals`
- `POST /approvals/:id/decision`

An approval decision is either `approve` or `reject`, with an optional note.

## Dashboard equivalent

The dashboard exposes the same data through an **AI control area**:

- create and revoke AI credentials,
- review the audit log with filters, pagination, and per-event detail,
- decide pending approvals.

Destructive requests are presented as approvals to grant or refuse, never as actions already taken.
