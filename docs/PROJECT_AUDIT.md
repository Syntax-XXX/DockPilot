# DockPilot project audit

Audit date: 2026-10-09. Scope: current shared checkout, tracked source/config/docs, local dev browser, local PostgreSQL/Docker state. Git branch: `main`, initially clean at session start per prior transcript; pending edits include five source paths and eight newly created audit/backlog documents listed below. No commit or deployment performed.

## Verified architecture

- Private npm workspaces monorepo, Node >=20.19/npm; TypeScript, React 19 + Vite frontend (`apps/web`), Fastify API (`apps/api`), PostgreSQL 17 + Drizzle, shared Zod/schema contracts (`packages/shared`).
- Browser uses same-origin `/api/v1` and Vite proxy; API and web have separate dev servers.
- Human auth uses first-owner setup, Argon2id, server-side revocable sessions and Origin checks. AI credentials use separate bearer tokens; MCP is the Streamable HTTP/optional local stdio control plane.
- AI MCP tools are deliberately narrow, permissioned, audited, rate-limited; destructive operations require admin approval. Public shell, arbitrary SQL, generic execution and Docker socket tool are intentionally absent.
- `demo/` is a separate static, local-state simulation published under GitHub Pages `/demo/`. It is not a live backend environment.
- `infrastructure/compose.yaml` starts only loopback-bound Postgres, using persistent named volume. There are no application Dockerfiles in repo at audit time.
- Tests: Vitest unit/integration; integration tests use PostgreSQL; root scripts run typecheck, lint, format, build and tests. CI provisions Postgres and runs quality gates. Semgrep workflow exists and references optional Semgrep app token.

## Baseline and this run

- Local dev servers on 127.0.0.1:5173 and :4000 were already running. Static demo server at :8768 was already available; no new server was started.
- Docker Engine 29.7.2 available; project `postgres` container reports healthy, bound to 127.0.0.1:54329.
- After all source changes, `npm run typecheck`, `npm test`, `npm run build`, and `npm run lint` exited 0. Unit: 59 tests, integration: 62. The initial final format check flagged four new Markdown documents; they were formatted, and the final `npm run format:check` exited 0.
- `npm audit --omit=dev --audit-level=high` found 0 production dependency advisories. Full `npm audit --json` found 3 dev dependency advisories (2 moderate, 1 high: Vite/esbuild and VitePress chain); npm reports no automatic fix. A VitePress nested Vite override trial broke npm's dependency-tree validity and left findings, so it was reverted. See DP-SEC-004.
- Local test run applies migrations to configured dev DB and tests truncate DockPilot tables; do not point it at production or valuable data.
- Root browser page rendered first-owner setup. Existing setup API rate limit returned 429 after repeated previous local attempts; browser view shows connection/429 feedback instead of authenticated console. No authentication bypass was added.
- Static `/demo/` opened independently at 375px and desktop, displayed interactive demo overview/container list with sample data; page assets loaded with 200 and no captured app console errors. Document width did not overflow viewport. Navigation to Containers and search filtering to `paperless` worked (one row); keyboard focus on the filter select had visible native outline. A separate overview control click had bridge box-model failure; do not count that particular interaction as verified.

## Findings

### Verified useful behavior

- Production UI offers owner setup/login and an admin AI control surface.
- Available admin system-status values are now rendered from real API responses, polled every 30 seconds, with loading/unknown/unavailable states.
- Demo represents simulated Docker infrastructure, explicitly documented as browser-local and safe from production mutations.
- Existing security and auth tests cover Origin/CSRF, protected routes, AI permissions, secret non-disclosure, approvals and audit immutability.
- Docker library has bounded response/log handling; added socket type check now correctly recognizes Unix sockets.

### Confirmed limitations

- README explicitly states Docker hosts/agents/container APIs, orchestration, metrics, backup/restore, notifications, automation, multi-tenant management, recovery and retention are not implemented. Do not present them as live.
- Docker HTTP client code is not proof that host management is wired to authenticated routes or a host agent.
- Browser authenticated app/admin workflow could not be tested because current setup was rate limited.
- 21st.dev MCP is available for catalog metadata/search and component retrieval; AI generation disabled and 0 credits; two free code retrievals reported. Metadata search was used; no generated component was introduced because existing interfaces were specific, and the MCP indicated AI generation unavailable.
- Playwright MCP is configured (browser tools exposed), though native preview bridge was used for actual local browser inspection; one click failed at bridge coordinate computation.
- Docker MCP service-specific inspection was not found in queried tool catalog; native Docker CLI verified local Engine/container.

### Open investigations

- Resolve setup rate limit via safe isolated test account/DB and verify complete authenticated browser path; never disable backend auth.
- Determine route-level demo behavior in Vite versus static Pages demo; current `/demo` static route is separately served from `demo/` in browser testing. Documentation should clarify distinction.
- Complete API route-to-UI inventory and verify Docker operations are absent or correctly authorized.
- Evaluate Unix socket allowlist handling for symlinks and filesystem race/TOCTOU, plus log decoder complexity and timeout behavior.
- Verify all workflow actions pinning, Semgrep behavior without token, and full dev-dependency audit.
- Decide product scope before implementing generic AI agent/task execution or broad filesystem/terminal APIs; current project intentionally has none.

## Current changed source paths

- `apps/api/src/lib/docker.ts`: bounded Docker logs/HTTP errors and Unix socket detection.
- `apps/api/test/unit/control-layer.test.ts`: Docker log and socket behavior tests.
- `apps/web/src/pages/App.tsx`: authenticated overview now uses API status counts and honest state.
- `apps/web/src/styles/global.css`: workspace/status presentation.
- `demo/demo.css`: focused-state and responsive banner polish.

No user data reset, production operation, credential bypass, package addition, deployment, or commit occurred.
