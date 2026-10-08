# DockPilot

**Docker, without the guessing.**

A self-hosted Docker infrastructure control center designed around clear, actionable insight across hosts—not just buttons that issue container commands.

> **Early, actively developed software.** Milestone 0 initializes the monorepo. Milestone 1 builds the real relational and human-authentication foundations. Docker hosts are not connected yet: the honest dashboard presents a meaningful empty state instead of fake infrastructure or mock containers.

## Requirements

- Node.js **20.19+** and npm **10+** (verify `npm --version`).
- Docker Engine and Docker Compose.
- No globally installed PostgreSQL required: development PostgreSQL runs in Compose.

## Quick start

```sh
npm install
cp .env.example .env
```

Generate a unique development session secret:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Set the resulting value as `SESSION_SECRET` in `.env`. Keep `.env` secret; it is excluded from version control.

```sh
npm run db:up
npm run db:migrate
npm run dev
```

- Web dashboard: http://127.0.0.1:5173
- API and setup status: http://127.0.0.1:4000/api/v1/health
- PostgreSQL listens **only on** 127.0.0.1:54329. Database data persists in its named Compose volume.

The dashboard has an explicit first-run setup and login form. The initial installation can register **one owner only**. Do not expose the unauthenticated setup endpoint beyond the trusted loopback development environment. Setup becomes permanently disabled once an owner is registered.

## Checks

```sh
npm run db:up
npm run db:migrate
npm run typecheck
npm run test:unit       # No database required.
npm run test:integration # Applies migrations; requires `npm run db:up`.
npm test               # Runs unit and integration suites.
npm run lint
npm run build
npm run format:check
```

The initial PostgreSQL schema is versioned in `apps/api/drizzle/`; migrations are safe to re-run. Integration tests use the configured test database, apply migrations before the suite, and truncate only that database's DockPilot tables before each test. Configure `DATABASE_URL` to a dedicated test database when running tests against a non-development database.

`npm run db:down` stops the development database but preserves its volume. `docker compose -f infrastructure/compose.yaml down --volumes` **deletes the local database and every local DockPilot account and record**. Do not run it if you want to keep that data.

## Production security boundary

**The development Compose file and example passwords are not production deployment instructions.** A production installation needs externally provisioned PostgreSQL, a unique high-entropy session secret, HTTPS, secure secret management, reviewed network/firewall policy and regular database backups. Never expose PostgreSQL, the Docker socket or an agent's Docker socket to a public interface. Never put a production secret in browser code, a checked-in `.env`, a Docker image, logs or the agent registration UI. Reverse-proxy trust is disabled by default; configure and review that boundary before deploying behind a proxy. Authentication and request validation do not replace TLS.

Agent enrollment, Docker operations, metrics, backup/restore, notifications, update execution, integrations and automation are **not implemented yet**; they are deliberately not represented as functioning features. Architecture and threat model: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
