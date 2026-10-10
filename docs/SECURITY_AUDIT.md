# Security audit

Date: 2026-10-09. This is a development-checkout review, not a formal penetration test or production certification.

## Verified controls in repository/tests

- Passwords use Argon2id; sessions are random opaque values stored as keyed digests and revocable server-side.
- One-time owner setup is serialized and closes after first owner. Cookie mutations require trusted Origin; security headers/body limits and auth/bootstrap rate limiting are applied.
- Human admin routes enforce server-side owner/admin access and organization scope. AI credentials are separate, returned once, persisted only as keyed digest, permission-ranked and revocable.
- MCP input schemas are strict; tool metadata and permission levels share one contract; per-credential/IP throttles, bounded/redacted results, audit events, and approval-gated destructive actions exist.
- Audit log database trigger prevents update/delete. Integration tests exercise authorization denials, cross-organization isolation, privilege escalation, secret non-disclosure, traversal/injection attempts, append-only behavior and Origin/CSRF checks.
- There is no generic shell, SQL, Docker socket, or arbitrary execution MCP capability. Preserve this boundary until an explicit sandbox and authorization model exists.
- Demo documentation describes local simulated state only; its actions do not call production API.
- Docker socket endpoints are allowlisted in client library; `socketExists` now tests socket file type, and log collection is byte/tail bounded.
- Local status: `npm audit --omit=dev --audit-level=high` reported 0 production advisories. Full audit reports 3 dev dependency advisories (2 moderate, 1 high: Vite/esbuild and VitePress chain); npm says no automatic fix. A trial override to force nested Vite 6 was invalid for VitePress and was reverted. Existing Semgrep workflow invokes `semgrep ci` with optional token; actual workflow run was not performed.

## Current verification

- Full integration suite passed (62 tests), with DB migration command succeeding against configured local development Postgres; tests intentionally truncate application tables in configured DB, therefore only use isolated development/test DB.
- After the socket validation regression test was added, the final complete `npm test` passed 59 unit and 62 integration tests. Typecheck, build, lint, and formatting also passed.
- No temporary auth bypass or test-only environment override was introduced.
- Browser auth proof remains incomplete: setup endpoint returned 429 following existing local attempts. No privileged or unsafe remedy attempted.

## Remaining security work (prioritized)

1. Remediate/triage the three known dev dependency advisories (DP-SEC-004), especially high-severity Vite finding; npm does not provide an automatic fix.
2. Review every GitHub Actions third-party action, permissions and pull-request secret exposure; decide immutable pinning.
3. Test `semgrep ci` without `SEMGREP_APP_TOKEN` and replace with supported local OSS scan mode if needed.
4. Review Docker Unix-socket allowlist/symlink/race behavior and restrict socket access to an operator-controlled deployment boundary.
5. Map all route authn/authz and check object scope; exercise an authenticated browser with isolated data.
6. Keep agent filesystem/shell/execution capabilities unavailable until workspace isolation, path/symlink policy, approvals, cancellation, timeout and auditing are specified and tested.
7. Production readiness still requires HTTPS, external secret management, backups/restore validation, reviewed proxy/network policy, and operational incident procedures.

No secrets, tokens, or credentials are included in this document.
