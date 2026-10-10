# DockPilot progress log

## 2026-10-09 — UI status, Docker log/socket guardrails, verification

### Follow-up implementation (same session)

- System-health panel in `apps/web/src/pages/App.tsx` now offers a manual admin refresh, last-success timestamp, visible stale/error notice with retry, and in-flight protection; API health indicator no longer presents a false green state while offline.
- `demo/demo.css` uses the main app’s charcoal/blue/spacing tokens and adjusts the demo notice for narrow screens without changing demo-only localStorage data or action behavior.
- `apps/api/src/lib/docker.ts` now parses Docker multiplexed logs in linear time by counting newlines incrementally, tracks output byte limits without UTF-16 character-count drift, accepts only stdout/stderr stream IDs, and retains TTY passthrough. Regression tests exercise 10,000 frames, unsupported IDs, partial frames, and TTY output; the 10,000-frame parser timing was <10 ms locally.
- `.github/workflows/ci.yml` now runs a production dependency audit and Gitleaks tracked-file secret scan with read-only repository permissions.
- Docker engine already present (29.7.2), Postgres service healthy; no application Dockerfiles exist, so no fake Docker service/image was created. Full app-in-Compose work remains open.
- Authenticated browser UI still awaits a regular test account; Playwright connector fails because its required `/opt/google/chrome/chrome` is absent. Installed Chromium verified static `/demo/` interactions and mobile overflow directly via CDP. No auth bypass used.
- Full dependency audit still exits nonzero with 3 development-tree findings; compatible published Vite/VitePress patches are not available in current tested ranges. Production audit passes (0 findings); remediation remains open.
- Full typecheck, production build, lint, format check and `npm test` rerun after the parser/workflow changes passed: 61 unit + 62 integration tests. Full integration suite ran against isolated local DB `dockpilot_task_test_20261009` (migration rerun was idempotent).

## 2026-10-09 — UI status, Docker log/socket guardrails, verification (previous pass)

### Changes in this checkout

- `apps/web/src/pages/App.tsx`: overview retrieves real admin system-status API values (active AI credentials, MCP setting, pending approvals, database availability) with loading/unknown/error representation and 30-second polling; replaces previous fake/missing infrastructure metrics with backend-supported data.
- `apps/web/src/styles/global.css`: workspace context and status presentation, mobile adjustments.
- `demo/demo.css`: keyboard focus-visible style, restrained control transitions, and narrow viewport banner bound.
- `apps/api/src/lib/docker.ts`: log tail/byte input validation, bounded streamed result, explicit Docker HTTP errors, timeout handling and correct Unix-socket file-type recognition.
- `apps/api/test/unit/control-layer.test.ts`: log error/oversize/input-limit and Unix socket-vs-file/missing-path tests.

### Verified

- `npm run typecheck`: passed before and after final socket fix.
- `npm test`: final full suite passed: 59 unit + 62 PostgreSQL integration tests, migrations applied.
- `npm run build`: passed (shared/API/web; Vite 1680 modules). Upstream Zod/Rollup pure-annotation warnings only.
- `npm run lint`: passed.
- `npm run format:check`: initially flagged four new Markdown files; formatted them with Prettier, and final rerun passed.
- `git diff --check`: passed.
- `npm audit --omit=dev --audit-level=high`: 0 prod findings.
- Docker Engine 29.7.2 available; current PostgreSQL container healthy, persistent local DB at 127.0.0.1:54329.
- Browser `/demo/`: static UI visible with 3 simulated hosts / 8 containers. At 375px width no horizontal overflow; desktop document width 1265 at 1280 viewport. Assets returned 200; no app console errors captured. Clicked Containers navigation; filtered `paperless` to one row. Keyboard tab focus on the select was visible.

### Limitations / blockers

- Main app root displayed the normal owner setup UI. Repeated local setup-status attempts encountered 429 throttling; actual authenticated console, admin operations, login/logout, and authenticated mobile responsive behavior could not be browser-tested. No auth bypass used.
- Preview bridge could not compute an element box for one overview action; that interaction is not counted as tested.
- Docker MCP connector was not found by tool discovery. Native Docker CLI verified local engine/db only; no application Dockerfile/Compose service exists beyond Postgres.
- 21st.dev search was used for UI reference; MCP reports AI generation unavailable, zero credits. Did not retrieve/paste paid components; existing bespoke React/CSS architecture is retained.
- Production dependency audit is clean. Full audit reports 3 dev dependency advisories (2 moderate, 1 high); npm offers no fix. A Vite override experiment was invalid for VitePress and left findings, so it was reverted. Remediation remains tracked in DP-SEC-004; hosted GitHub Actions/Semgrep run remains unverified.
- Existing full suite performs truncation in configured database; only run against isolated disposable DB.

### Continuation point

Start with `DP-AUTH-001` in `docs/IMPLEMENTATION_BACKLOG.md`: verify normal owner setup/login in an isolated disposable local database after rate-limit state is clear. Then run authenticated browser tests and revisit high-priority route inventory / Docker authorization scope. No production deploy, credential bypass, database-volume deletion, commit or push performed.
