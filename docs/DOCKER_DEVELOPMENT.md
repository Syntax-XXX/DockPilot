# DockPilot Docker development

The only checked-in Compose service is PostgreSQL 17 (`infrastructure/compose.yaml`), bound to `127.0.0.1:54329` with a persistent named volume and health check. No API, web, or agent image is currently defined. The sample password is local-only.

```sh
cp .env.example .env
# Set independent random SESSION_SECRET and MCP_TOKEN_SECRET locally.
npm run db:up
npm run db:migrate
npm run dev
```

`npm run db:down` stops Postgres but preserves data. `docker compose -f infrastructure/compose.yaml down --volumes` deletes the local database volume. Do not expose PostgreSQL or Docker sockets publicly.

Verified 2026-10-09: Docker Engine 29.7.2; local Postgres container healthy at loopback port 54329; migrations succeeded in the integration test command. Full app-in-Docker builds, worker execution, and restart/persistence across app services remain unverified because those services are not configured.
