---
title: DockPilot wiki
description: A lightweight wiki for the DockPilot repository.
---

# DockPilot wiki

This is a lightweight wiki for the DockPilot repository. It is meant to help someone orient quickly without reading the whole codebase.

## What DockPilot is

A self-hosted Docker infrastructure control center with:

- a React dashboard,
- a Fastify API,
- PostgreSQL plus Drizzle ORM,
- owner setup and Argon2id authentication,
- revocable server-side sessions,
- an MCP control layer for external AI agents,
- admin-visible AI credentials, audit log, and approvals.

## Status

This is an **alpha**. Some parts are real, some parts are placeholders, and some expected features are not built yet. The dashboard is honest about what is missing instead of pretending Docker hosts are connected.

## What works right now

- Repository bootstrap, linting, formatting, typechecking, building, and tests.
- One-time owner setup and login.
- Session authentication with revocation.
- Administrator REST routes for system status, AI credentials, audit events, and approvals.
- MCP endpoint with dedicated AI credential authentication, scoped permissions, narrow tools, rate limiting, validation, correlation IDs, and append-only audit logging.
- Human approval flow for destructive requests.
- Adversarial MCP security tests.

## What is not implemented yet

- Docker hosts, agents, containers, images, volumes, networks, container logs, Docker Doctor.
- Agent enrollment and container operations.
- Metrics, backup/restore, notifications, update execution, integrations, automation.
- Multi-organization/multi-tenant administration.
- Password recovery.
- Automatic audit retention.

## Repository layout

- `apps/web` — React dashboard and same-origin API client.
- `apps/api` — Fastify API, database layer, Drizzle schema/migrations, auth, admin routes, MCP gateway, and shared services.
- `packages/shared` — strict schemas, protocol types, and the MCP tool contract.
- `infrastructure/compose.yaml` — local loopback-only PostgreSQL for development and tests.
- `docs/` — architecture and this wiki.
- `apps/api/drizzle/` — Drizzle migrations and metadata.

## Key services

- Web app: `apps/web`.
- API: `apps/api/src/server.ts`.
- MCP gateway: `apps/api/src/mcp`.
- Shared service layer: `apps/api/src/services`.
- MCP tool contract: `packages/shared/src/mcp.ts`.

## MCP control layer in one paragraph

External AI agents authenticate with dedicated `dpai_` bearer tokens, not browser sessions. The MCP endpoint is Streamable HTTP at `/api/v1/mcp`, registered only when `MCP_ENABLED` is not `false`. There is a local stdio entry point for development. Tools are narrow and named. There is no shell, SQL, Docker socket, or generic execute tool. Destructive actions do not execute directly; they create pending approvals that an administrator must decide. Every MCP call writes an audit event, even failures.

## Authentication model

- Humans authenticate with sessions.
- AI agents authenticate with AI credentials.
- Credentials are created by administrators through the admin API.
- The raw token is returned exactly once and never stored in plaintext.
- Only an HMAC-SHA256 digest is persisted, keyed by `MCP_TOKEN_SECRET`.
- Production refuses to start while MCP is enabled and `MCP_TOKEN_SECRET` is missing.

## Admin surface

Administrator-only routes are under `/api/v1/admin`:

- system status,
- AI credential create/list/revoke,
- audit event list/detail with filters and pagination,
- approval list and decision.

The dashboard has an AI control area with the same capabilities.

## Security notes

- Development Compose file and example passwords are not production deployment instructions.
- Production needs real PostgreSQL, real secrets, HTTPS, secret management, reviewed network policy, and backups.
- Never expose PostgreSQL or Docker sockets to a public interface.
- MCP credentials should be treated as production secrets.

## Tests

- Unit tests cover redaction, rate limiting, pagination, permission ordering, token handling, and the MCP tool contract.
- Integration tests cover real HTTP behavior, MCP authentication and tool execution, approval workflow, cross-organization isolation, privilege escalation, secret non-disclosure, injection resistance, traversal resistance, and audit immutability.

## Documentation pointers

- Project readme: [README.md](../README.md)
- Architecture and threat model: [ARCHITECTURE.md](ARCHITECTURE.md)
- This wiki: [WIKI_HANDOFF.md](WIKI_HANDOFF.md)
