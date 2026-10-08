# Testing

## Unit tests

Unit tests cover:

- redaction,
- rate limiting,
- pagination cursors,
- permission ordering,
- token handling,
- structured errors,
- the MCP tool catalog,
- the MCP registry contract,
- tool input validation,
- discoverable tool definitions.

## Integration tests

The integration suite applies migrations against the configured database and drives the real HTTP surfaces. It includes:

- MCP authentication,
- tool discovery,
- authorized tool execution,
- denied and failed audit paths,
- rate limiting,
- audit log immutability,
- cross-organization isolation,
- privilege escalation,
- permission over-posting,
- secret non-disclosure,
- injection resistance,
- traversal resistance,
- no-generic-execution-surface assertions,
- transport hardening,
- credential abuse throttling,
- credential lifecycle,
- the full approval workflow.

## How to run

```sh
npm run db:up
npm run db:migrate
npm run test:unit
npm run test:integration
npm test
```

Unit tests do not require a database. Integration tests require the database to be up and migrated.

## Test database note

Integration tests truncate only DockPilot tables in the configured test database before each test. Configure `DATABASE_URL` to a dedicated test database when running tests against a non-development database.

## Build and checks

In addition to tests:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run format:check`
- `npm audit`

These are part of the normal verification flow for the repository.
