# DockPilot implementation backlog

Status vocabulary: `TODO`, `IN_PROGRESS`, `BLOCKED`, `REVIEW_REQUIRED`, `DONE`, `CANCELLED`. `DONE` requires recorded verification. Priority: P0 critical security/data integrity; P1 core capability; P2 quality/reliability; P3 polish/docs.

The product is alpha. Scope below reflects README, architecture, current routes/services, package scripts, and CI. This is an actionable starter backlog, not a claim of comprehensive production readiness; add tasks as milestones expand.

## Verified completed in this run

### DP-DOCKER-001 — Bound and settle streamed Docker log retrieval

- Category: API / reliability · Priority: P1 · Status: `DONE`
- Description: Validate log-tail and byte bounds, reject Docker HTTP errors predictably, cap streaming response size, and settle timeout/network/stream failures once.
- Acceptance: Invalid limits fail before I/O; oversized logs return bounded 413; Docker HTTP errors reject without uncaught stream exceptions; request timeout rejects; bytes return on success.
- Dependencies: none · Files: `apps/api/src/lib/docker.ts`, `apps/api/test/unit/control-layer.test.ts`
- Verification/result: Unit suite passed including bounded log tests; full test suite and typecheck passed before final socket change. Re-run broader checks at acceptance.

### DP-DOCKER-002 — Check Docker Unix socket type correctly

- Category: Docker / security · Priority: P1 · Status: `DONE`
- Description: `socketExists` must verify the filesystem entry is a Unix socket, not a regular file.
- Acceptance: Existing socket returns true; regular file, directory and missing path return false; temporary test resources are cleaned.
- Dependencies: none · Files: `apps/api/src/lib/docker.ts`, `apps/api/test/unit/control-layer.test.ts`
- Verification/result: Targeted unit tests passed (59 total unit tests across 3 files); monorepo typecheck passed.

### DP-UI-001 — Display real API-backed system status

- Category: UI / API integration · Priority: P1 · Status: `DONE`
- Description: Replace empty/placeholder operational summary cards for available status signals with administrator-scoped system status, including refresh cadence and error/unknown states.
- Acceptance: Counts and MCP/database statuses come from the actual API; failed status fetch is not shown as healthy; refresh cleans up; unauthorized users do not trigger admin fetch.
- Dependencies: existing system status endpoint · Files: `apps/web/src/pages/App.tsx`, `apps/web/src/styles/global.css`
- Verification/result: Typecheck, production build, lint, full test suite passed. Browser rendered owner setup, but authenticated operator overview was not reachable due existing setup rate limit; authenticated visual state remains unverified.

### DP-DEMO-001 — Improve shared dark interaction and focus treatment in demo

- Category: demo / accessibility · Priority: P2 · Status: `DONE`
- Description: Bring demo controls in line with dark palette and visible keyboard focus and add bounded small viewport banner layout.
- Acceptance: Demo static route remains functional; small viewport does not introduce document horizontal overflow; controls expose focus treatment on keyboard.
- Dependencies: none · Files: `demo/demo.css`
- Verification/result: Browser opened `/demo/` at 375px and desktop, rendered overview and container table, document width did not overflow; clicked Containers nav and filtered to `paperless` (one row). Keyboard tab reached select with visible native focus outline. One overview control click hit a CDP box-model limitation, not counted. Console/network captured no app errors or failed page assets.

## In-scope open work

### DP-REPO-001 — Record verified architecture and active milestone facts

- Category: repository / docs · Priority: P2 · Status: `TODO`
- Description: Reconcile architecture milestone prose against actual Docker modules and clarify what is only a library versus a registered API capability.
- Acceptance: Every documented capability maps to code/tests or is marked planned; no inaccurate milestone completion claims.
- Dependencies: none · Files: `docs/ARCHITECTURE.md`, `apps/api/src/lib/docker.ts`, routes/services.
- Verification: Review references and run format check.

### DP-API-001 — Inventory API routes against frontend surfaces

- Category: API · Priority: P1 · Status: `TODO`
- Description: Map every registered route to auth/role/schema/service/UI coverage; identify frontend pages that lack actual data contracts.
- Acceptance: Route matrix records method/path/auth/input/output/tests; missing functionality is explicitly planned.
- Dependencies: none · Files: `apps/api/src/app.ts`, `apps/api/src/routes/*`, `apps/web/src/lib/api.ts`.
- Verification: Cross-check route registration and targeted integration tests.

### DP-AUTH-001 — Verify first-run owner setup after local rate-limit window

- Category: authentication / browser · Priority: P1 · Status: `BLOCKED`
- Description: Browser session hit 429 during previous local setup attempts. Retest ordinary setup/login with isolated local data or supported fresh test DB; do not add auth bypass.
- Acceptance: Setup once, login valid/invalid, reload, logout, protected route, and API unauthorized behavior verified with server auth enabled.
- Dependencies: safe fresh test identity/database and resettable local rate limit · Files: auth routes/tests, browser tests.
- Verification: authenticated Playwright flow. Blocker: current browser setup endpoint returned 429; no bypass enabled.

### DP-UI-002 — Browser-verify authenticated app screens at desktop/tablet/mobile

- Category: UI / browser · Priority: P1 · Status: `TODO`
- Description: Verify operator console and admin sections with a real test identity; include layout and navigation at several viewport sizes.
- Acceptance: No overflow, keyboard-usable controls, meaningful empty/loading/error states, no unexplained console/network errors.
- Dependencies: DP-AUTH-001 · Files: `apps/web/src/pages/App.tsx`, `apps/web/src/pages/AdminControl.tsx`, styles.
- Verification: Playwright snapshots/interactions at desktop and mobile.

### DP-UI-003 — Align app root branding and `/demo` route intent

- Category: UI / routing · Priority: P2 · Status: `TODO`
- Description: Determine and document whether static demo at GitHub Pages `/demo/` is separate from Vite app's `/demo` SPA fallback; ensure entry points are deliberately linked rather than implying route parity.
- Acceptance: Direct navigation/refresh behavior documented and verified for deployed static demo and local web app.
- Dependencies: none · Files: `apps/web/vite.config.ts`, `demo/index.html`, Pages workflow.
- Verification: serve production outputs and request direct routes.

### DP-DOCKER-003 — Expose only validated Docker capabilities through authorized routes

- Category: Docker / API / authorization · Priority: P1 · Status: `TODO`
- Description: Docker client utility code exists, but architecture declares host agent/operations planned. Confirm whether any route safely invokes it and implement only backed, permission-checked use cases.
- Acceptance: No public arbitrary socket path or unreviewed destructive action; calls are organization-scoped, audited, bounded and tested; unsupported features labeled unavailable.
- Dependencies: route inventory, threat model · Files: `apps/api/src/lib/docker.ts`, `apps/api/src/routes/*`, `apps/api/src/services/*`.
- Verification: adversarial endpoint tests and local Docker test fixture.

### DP-DOCKER-004 — Add reproducible API/web Docker build and run topology

- Category: Docker / deployment · Priority: P2 · Status: `TODO`
- Description: Existing Compose only defines local PostgreSQL; repo has no Dockerfile. Decide and implement reproducible application images only after service boundaries/env are reviewed.
- Acceptance: Build/start/health/migrations documented; no secrets in images; no privileged shell/Docker socket exposure; persistence and shutdown tested.
- Dependencies: operational deployment decision · Files: `infrastructure/compose.yaml`, new Dockerfiles, docs.
- Verification: actual compose build/up/health and restart.

### DP-DB-001 — Test migrations on clean isolated database and document safe migration procedure

- Category: database / reliability · Priority: P1 · Status: `TODO`
- Description: Current migrations rerun successfully on active local PostgreSQL, but a clean-from-zero database path is not verified here.
- Acceptance: Fresh database migrates in CI and local procedure is safe and repeatable; tests point only to test database.
- Dependencies: isolated test db · Files: `apps/api/drizzle`, `apps/api/src/db/migrate.ts`, CI.
- Verification: disposable Postgres service; never use a production URL.

### DP-AGENT-001 — Define persisted agent/task lifecycle before adding orchestration

- Category: agents / scheduler / database · Priority: P1 · Status: `TODO`
- Description: User request describes agent/task orchestration, while current README says no agents/worker lifecycle is implemented. Design minimal persisted model and lifecycle, reusing existing patterns.
- Acceptance: Document state transitions, idempotency, ownership, cancellation/retry and approval boundaries before implementation.
- Dependencies: product scope/security review · Files: shared schemas, DB schema/migrations, services.
- Verification: state-machine tests and migration review.

### DP-FS-001 — Keep remote filesystem and shell capabilities out of public MCP until safe workspace model exists

- Category: filesystem / terminal / security · Priority: P0 · Status: `DONE`
- Description: Preserve narrow MCP tool contract and no generic shell/filesystem execution until authenticated per-workspace sandboxing is designed.
- Acceptance: No public shell/SQL/Docker-socket escape capability; explicit allowlist and permissions tests remain green.
- Dependencies: none · Files: `packages/shared/src/mcp.ts`, `apps/api/src/mcp/*`, integration security tests.
- Verification/result: Existing adversarial MCP tests passed in full integration suite (62 tests).

### DP-MCP-001 — Verify MCP service contract and runtime failure boundaries

- Category: MCP / reliability · Priority: P1 · Status: `TODO`
- Description: Audit each declared tool against service behavior, result bounds, timeouts, audit persistence and permission matrix.
- Acceptance: Every tool has exact input/output schemas and success/denial/failure tests; no timeout leaks or secret exposure.
- Dependencies: none · Files: `packages/shared/src/mcp.ts`, `apps/api/src/mcp/*`, integration tests.
- Verification: MCP contract/security suites.

### DP-SEC-001 — Configure dependency/code scans with least privilege and actionable findings

- Category: security / CI · Priority: P2 · Status: `DONE`
- Description: CI runs a production dependency audit and tracked-file secret scan; the existing optional-token Semgrep workflow remains in place.
- Acceptance: push/PR checks run without privileged secrets; findings produce actionable output; no silent suppression.
- Dependencies: CI review · Files: `.github/workflows/ci.yml`, `.github/workflows/semgrep.yml`.
- Verification/result: `npm audit --omit=dev --audit-level=high` passed with zero production findings. Added Gitleaks GitHub Action to CI with read-only repository permissions; remote workflow execution remains unverified in this local session.

### DP-SEC-002 — Review third-party action references and permissions

- Category: security / CI · Priority: P2 · Status: `TODO`
- Description: Review all workflow actions for supported versions/immutable pinning and workflow scopes.
- Acceptance: Each action has documented trust/pin rationale and permissions are minimal.
- Dependencies: none · Files: `.github/workflows/*.yml`.
- Verification: static workflow review and CI.

### DP-SEC-003 — Reconcile semgrep CI mode with missing-token behavior

- Category: security / CI · Priority: P2 · Status: `TODO`
- Description: Workflow invokes `semgrep ci` with optional `SEMGREP_APP_TOKEN`; determine whether unauthenticated CI is useful/green and choose supported OSS scan command if it is not.
- Acceptance: scan reliably executes with documented credentials (if needed) or public rules; no token is logged; scheduled/PR behavior tested or limitation documented.
- Dependencies: scanner docs · Files: `.github/workflows/semgrep.yml`.
- Verification: run equivalent local command without service credentials.

### DP-SEC-004 — Remediate development dependency advisories

- Category: security / dependency · Priority: P1 · Status: `TODO`
- Description: Full `npm audit --json` reports 3 development dependency advisories: moderate esbuild (<=0.24.2), high Vite (<=6.4.2), and moderate VitePress (<=1.6.4). npm reports no automatic fix. Production-only audit reported zero. Trial override to lift VitePress nested Vite 5 to Vite 6 produced an invalid npm dependency tree and did not remove advisories, so it was reverted.
- Acceptance: Resolve by compatible, reviewed direct/transitive updates; preserve workspace lockfile; rerun web/wiki builds, test suite and full audit; document any unavoidable residual exposure.
- Dependencies: inspect dependency tree/declared ranges · Files: package manifests and lockfile.
- Verification: full npm audit has no high/critical and no unresolved exploitable moderate finding, plus build/tests.

### DP-TEST-001 — Add browser suite for first-run auth and administration workflows

- Category: test / browser · Priority: P1 · Status: `TODO`
- Description: No project browser automation suite is evidenced by package scripts; create minimal Playwright tests only if an existing dependency/convention supports it.
- Acceptance: Setup/login/logout and admin status/approval route interactions with isolated DB are repeatable in CI/local.
- Dependencies: DP-AUTH-001 · Files: test configuration, package scripts.
- Verification: headless browser run.

### DP-TEST-002 — Test production web output and route fallback

- Category: test / deployment · Priority: P2 · Status: `TODO`
- Description: Build passes, but production web artifact serving and refresh routing are not yet verified on the intended host.
- Acceptance: `/` and intended demo path serve usable content and assets under correct base path.
- Dependencies: Pages vs app route clarification · Files: Vite and Pages workflow.
- Verification: local static server and browser refresh.

### DP-ACC-001 — Audit core dashboard keyboard and contrast accessibility

- Category: accessibility · Priority: P2 · Status: `TODO`
- Description: Demo has focus-visible CSS; computed browser probe found a currently unfocused button has outline none, which is expected until focus. Verify actual keyboard focus and contrast for both app and demo.
- Acceptance: focus ring visible on keyboard focus, labels/dialog semantics verified, contrast issues fixed.
- Dependencies: authenticated app route · Files: web/demo CSS and components.
- Verification: keyboard test and accessibility review.

### DP-OBS-001 — Verify periodic status polling cleanup and concurrent request behavior

- Category: observability / reliability · Priority: P2 · Status: `TODO`
- Description: Overview fetches system status every 30 seconds. Add in-flight protection/abort strategy if overlapping slow requests are possible.
- Acceptance: no overlapping stale responses or updates after unmount; visible status age/error.
- Dependencies: DP-UI-001 · Files: `apps/web/src/pages/App.tsx`.
- Verification: fake-timer and deferred-fetch tests.

### DP-DOC-001 — Document auth test procedure without a bypass

- Category: docs / authentication · Priority: P2 · Status: `TODO`
- Description: Document isolated test DB/account setup, browser login/logout/protected route procedure and production guard expectations.
- Acceptance: Instructions never introduce a runtime bypass; credentials are generated locally and not committed.
- Dependencies: DP-AUTH-001 · Files: `docs/AUTHENTICATION_TESTING.md`, README.
- Verification: run documented steps in test environment.

### DP-DOC-002 — Document MCP integration and security contract

- Category: docs / MCP · Priority: P2 · Status: `TODO`
- Description: Consolidate transport, credentials, tool list, permissions, approvals, failure behavior and local stdio setup.
- Acceptance: Documentation matches shared tool metadata and current endpoint behavior.
- Dependencies: DP-MCP-001 · Files: `docs/MCP_INTEGRATIONS.md`, README.
- Verification: cross-check every documented operation against code/tests.

### DP-DOC-003 — Document Docker dev constraints and verified setup

- Category: docs / Docker · Priority: P2 · Status: `TODO`
- Description: Record current PostgreSQL-only Compose, loopback port, volume preservation, migration/test requirements, and app Docker images as future/blocked until built.
- Acceptance: Commands run safely and no app container/host integration is implied if absent.
- Dependencies: none · Files: `docs/DOCKER_DEVELOPMENT.md`, README.
- Verification: execute safe documented commands.

### DP-AUTH-002 — Preserve and regression-test server-side auth after test runs

- Category: auth / security · Priority: P1 · Status: `DONE`
- Description: No authentication bypass was introduced; auth coverage exercises actual PostgreSQL-backed sessions and protected identity.
- Acceptance: protected routes reject unauthenticated access; logout revokes session; production rejects insecure setup combinations.
- Dependencies: none · Files: auth implementation and integration tests.
- Verification/result: Existing full integration suite passed 62 tests, including authentication, Origin/CSRF and protected route tests. Browser authenticated end-to-end is still DP-AUTH-001.

### DP-REL-001 — Verify bounded Docker logs including timeout and stalled socket

- Category: Docker / reliability · Priority: P2 · Status: `TODO`
- Description: Existing added tests cover Docker error status and excessive bytes, but not timeout/stalled stream behavior.
- Acceptance: stalled server times out within bound, promise rejects exactly once, socket and temp resources close.
- Dependencies: none · Files: Docker library/unit tests.
- Verification: local Unix socket fixture with bounded timer.

### DP-REL-002 — Bound output processing complexity in Docker multiplexed logs

- Category: Docker / reliability · Priority: P2 · Status: `DONE`
- Description: Bound multiplexed log demultiplexing cost by counting line breaks incrementally instead of repeatedly splitting accumulated output; ignore unsupported stream IDs while preserving bounded stdout/stderr output.
- Acceptance: max log response work remains bounded and output semantics cover incomplete/invalid frames.
- Dependencies: none · Files: `apps/api/src/lib/docker.ts`, tests.
- Verification/result: 10,000 framed logs returned expected bounded output in under 500 ms; incomplete frame, stream ID and TTY behavior tests pass in unit suite.

### DP-CI-001 — Run full repeatable CI from clean checkout and verify migration/test DB isolation

- Category: CI / reliability · Priority: P2 · Status: `TODO`
- Description: Current CI provisions PostgreSQL and runs migration/build/typecheck/test/lint/format. Validate from clean CI equivalent, including secrets and optional MCP key configuration.
- Acceptance: full commands succeed in clean environment without local .env reliance.
- Dependencies: none · Files: workflow, test setup.
- Verification: reproduce with environment-controlled commands or CI run.

### DP-PROD-001 — Document production readiness gaps and explicit non-goals

- Category: deployment / security · Priority: P1 · Status: `TODO`
- Description: Keep Docker host agent, container operations, backups, metrics, notifications, password recovery, multi-tenant administration, and audit retention visibly marked unimplemented until actually delivered.
- Acceptance: UI/docs do not imply these capabilities are active; production checklist covers TLS, secret management, backups, permissions and threat model.
- Dependencies: route inventory · Files: README, architecture, admin overview.
- Verification: docs/UI cross-review.

## Backlog summary (this file)

- Total tasks: 31
- DONE: 8
- TODO: 22
- BLOCKED: 1
- IN_PROGRESS: 0
- REVIEW_REQUIRED: 0
- CANCELLED: 0
