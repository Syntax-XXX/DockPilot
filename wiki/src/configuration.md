# Configuration

DockPilot is configured through environment variables. The relevant files are `.env.example` at the repository root and `apps/api/.env.example`.

## Core variables

- `NODE_ENV` — `development`, `test`, or `production`.
- `DATABASE_URL` — PostgreSQL connection string.
- `SESSION_SECRET` — unique, high-entropy session key.
- `MCP_ENABLED` — set to `false` to serve no MCP endpoint at all.
- `MCP_TOKEN_SECRET` — independent HMAC key for AI credential tokens.
- `HOST`, `API_PORT`, `WEB_PORT`, `WEB_ORIGIN`, `API_PUBLIC_URL`, `TRUSTED_PROXY` — network and origin settings.

## Secrets

Production requires a unique, cryptographically generated `SESSION_SECRET` and, when MCP is enabled, an independent `MCP_TOKEN_SECRET`. The startup validation rejects placeholder values.

To generate a suitable secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Use two separately generated values for `SESSION_SECRET` and `MCP_TOKEN_SECRET`.

## Local development defaults

For local development, the Compose PostgreSQL service listens only on `127.0.0.1:54329`. Web and API dev servers default to loopback origins. The example `.env` values are deliberately rejected at startup until you replace the secrets.

## MCP control

- Set `MCP_ENABLED=false` to serve no MCP endpoint at all.
- When MCP is enabled, production requires `MCP_TOKEN_SECRET`.
- Outside production, `MCP_TOKEN_SECRET` falls back to a value derived from `SESSION_SECRET`.
- The stdio entry point is for local development only and authenticates from `DOCKPILOT_MCP_TOKEN`.
