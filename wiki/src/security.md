# Security notes

## Development is not production

The development Compose file and example passwords are **not production deployment instructions**.

## What a production install needs

- externally provisioned PostgreSQL,
- unique high-entropy secrets for `SESSION_SECRET` and `MCP_TOKEN_SECRET`,
- HTTPS,
- secure secret management,
- reviewed network and firewall policy,
- regular database backups.

## Boundaries to keep in mind

- Never expose PostgreSQL or Docker sockets to a public interface.
- Never put a production secret in browser code, a checked-in `.env`, a Docker image, logs, or the agent registration UI.
- Reverse-proxy trust is disabled by default. Configure and review that boundary before deploying behind a proxy.
- Authentication and request validation do not replace TLS.

## MCP-specific guidance

The MCP endpoint is a network-reachable, credential-authenticated interface.

- Treat each AI credential as a production secret.
- Grant the lowest permission level that works.
- Prefer expiries for temporary agents.
- Revoke credentials you no longer use.
- Keep `MCP_ENABLED=false` on instances where no agent should connect.

## Secret storage

- Passwords are stored as Argon2id hashes.
- Session tokens are stored only as keyed digests.
- AI credential tokens are stored only as HMAC-SHA256 digests.
- The raw AI token is returned once and never stored or returned again.

## Session behavior

- Sessions are server-side and revocable.
- Cookies are HttpOnly and SameSite.
- Cookies are Secure in production.
- Sessions have a fixed expiry.

## API boundaries

- The browser API trusts the exact configured Origin.
- Cookie-authenticated mutations without that Origin are rejected.
- There is no reflected wildcard CORS by default.
- Request sizes, security headers, and generic credential errors are enforced at the API boundary.

## Audit integrity

- `audit_logs` is append-only at the database level.
- No application path can rewrite or erase audit history.
- Sensitive values are redacted before storage.
