# What works and what is missing

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

## Current capability posture

DockPilot is usable as a small control plane for itself. It is not yet a connected Docker operations dashboard. The missing Docker pieces are intentionally not faked.
