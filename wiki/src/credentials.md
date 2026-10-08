# AI credentials

AI credentials are how external agents authenticate to DockPilot. They are created by administrators and managed through the admin API and dashboard.

## Creating a credential

An administrator creates an AI credential with:

- a name,
- an optional description,
- an optional agent identity,
- a permission level,
- an optional expiry of 1 to 365 days,
- an optional metadata object.

The create response is the only place the raw token is ever returned.

## Token handling

- Tokens are 32 random bytes rendered as `dpai_` followed by 43 URL-safe characters.
- The raw token is returned exactly once and never stored in plaintext.
- Only an HMAC-SHA256 digest is persisted, keyed by `MCP_TOKEN_SECRET`.
- Token prefixes are stored so an administrator can identify a credential without seeing the secret.

## Lifecycle

Each credential records:

- `createdAt`
- `lastUsedAt`
- `expiresAt`
- `revokedAt`
- `disabledAt`

A credential can be revoked immediately, which rejects subsequent authentication. Expired and disabled credentials are also rejected.

## Permission scoping

Credentials are created with a permission level of `read`, `write`, or `destructive`. The stored permission level is what the server enforces on every MCP tool call. No tool accepts a permission, role, or scope parameter, so a credential cannot raise its own privilege.

## Operational guidance

- Treat each AI credential as a production secret.
- Grant the lowest permission level that works.
- Prefer expiries for temporary agents.
- Revoke credentials you no longer use.
- Keep `MCP_ENABLED=false` on instances where no agent should connect.
