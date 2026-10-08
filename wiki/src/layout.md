# Repository layout

- `apps/web` — React dashboard and same-origin API client.
- `apps/api` — Fastify API, database layer, Drizzle schema/migrations, auth, admin routes, MCP gateway, and shared services.
- `packages/shared` — strict schemas, protocol types, and the MCP tool contract.
- `infrastructure/compose.yaml` — local loopback-only PostgreSQL for development and tests.
- `docs/` — architecture and wiki source.
- `apps/api/drizzle/` — Drizzle migrations and metadata.
- `wiki/` — this wiki source and build output.

## Key services

- Web app: `apps/web`.
- API: `apps/api/src/server.ts`.
- MCP gateway: `apps/api/src/mcp`.
- Shared service layer: `apps/api/src/services`.
- MCP tool contract: `packages/shared/src/mcp.ts`.

## Top-level scripts

The repository uses npm workspaces. Common commands include:

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run db:up`
- `npm run db:migrate`
- `npm run format:check`

Run `npm run` to see the current script list.
