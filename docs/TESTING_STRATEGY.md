# Testing strategy

## Existing automated checks

Run from repository root:

```sh
npm ci
npm run db:up                 # local Postgres only, loopback 127.0.0.1:54329
npm run db:migrate
npm run typecheck
npm run test:unit             # no DB
npm run test:integration      # applies migrations; DB required
npm run lint
npm run format:check
npm run build
```

`npm test` runs unit then integration tests. Vitest separates unit/integration projects. Integration setup truncates DockPilot tables; set `DATABASE_URL` only to a disposable/test database. Never point tests at production or valuable records.

## Verified in 2026-10-09 implementation pass

- Monorepo typecheck: passed before Docker socket update and again after it.
- Unit tests: 58 passed initially; after adding socket-type coverage, targeted unit run passed 59 tests across 3 test files.
- Integration: 62 tests across 4 files passed; migration applied successfully to configured development Postgres.
- Production build: passed; Vite built 1680 modules. Existing upstream Zod Rollup annotation warnings were emitted, bundle produced successfully.
- ESLint: passed with max warnings 0.
- Prettier check: passed.
- `git diff --check`: passed.
- Production dependency npm audit: no advisories. Full audit reports 3 dev dependency advisories (2 moderate, 1 high), with no automatic fix; remediation tracked as DP-SEC-004.

Final rerun after the socket test change completed successfully: 59 unit and 62 integration tests passed, and typecheck/build/lint/format checks all passed.

## Browser checks

- The root app at `http://127.0.0.1:5173/` rendered the one-time owner setup screen and health/setup requests responded. Repeated setup status requests were subsequently rate-limited (429); unauthenticated frontend therefore displayed its connection interruption screen. Authenticated application screens were not visually verified.
- The independently served `http://127.0.0.1:8768/demo/` rendered interactive overview and containers. At 375px: document width 375, no horizontal overflow. At desktop: document width 1265 at 1280 viewport, no overflow. CSS/JS assets returned 200; no application console errors were captured. Containers navigation and `paperless` search filtering worked (one row); keyboard focus was visible. A separate overview-control click was blocked by preview bridge box-model error and is not counted as passing.
- Direct `/demo` behavior must be verified against both Vite route and Pages static directory once route intent is clarified.

## Coverage gaps / next tests

- Complete isolated authenticated browser setup/login/logout and admin operations; do not disable auth.
- Add automated browser coverage only after selecting a supported existing Playwright package/runtime; no project browser-test script was identified.
- Docker log timeout/stalled socket and malformed multiplex frames need dedicated tests.
- Test migration from empty disposable database and CI parity.
- Test API routes for complete method/input/auth/scope/error matrix.
- Test responsive and keyboard focus interactions on the real authenticated console and `/demo` actions.
- Test Docker-dependent code against a disposable local container/socket fixture if host-operation endpoints become supported.
