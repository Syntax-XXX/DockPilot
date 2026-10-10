# MCP integrations

## DockPilot runtime MCP

DockPilot includes its own MCP control server in `apps/api/src/mcp`, using shared tool contracts in `packages/shared/src/mcp.ts`. Streamable HTTP endpoint is `/api/v1/mcp`; local stdio is available for development. AI agents authenticate with dedicated `dpai_` bearer credentials, distinct from browser sessions. Stored credential digests are keyed; raw credentials are returned once.

Tools are narrow and permission-declared (`read`, `write`, `destructive`). They call the existing service layer; destructive session/credential revocation requests require human approval. MCP is not required for human UI/API use. No shell, arbitrary SQL, Docker socket or generic execute tool is exposed. Preserve this boundary.

Configuration: `MCP_ENABLED`, `MCP_TOKEN_SECRET`, `SESSION_SECRET`; see root and API `.env.example` plus README. Production requires the independent MCP secret when enabled. Do not copy tokens into documentation or browser code.

## Agent MCP clients

No third-party MCP server connections or model-provider orchestration were verified in this repository. Current MCP capability is an inbound DockPilot server for authorized external clients. Do not describe it as a general outbound MCP server manager or AI task scheduler.

## Local coding environment MCP availability

- 21st.dev catalog search and component-code retrieval are available; metadata search was used. Usage endpoint reported free tier, two code retrievals/day and AI generation disabled with zero credits. No Magic AI-generated component was available/used.
- Playwright browser MCP tools are configured; native preview browser was used for route checks. One demo-button click could not be computed by the preview bridge.
- Shell/terminal and filesystem tools are available natively. Native Docker CLI works; queried MCP service list did not reveal Docker-specific runtime inspection tools.
- No PostgreSQL MCP or GitHub MCP operation was used/verified. Native integration tests and local GitHub Actions files provided project evidence.

## Verification

`npm test` exercises MCP tool discovery/invocation and security boundaries, including permission escalation prevention, cross-organization isolation, audit immutability, authentication failures and secret non-disclosure. Final full run passed 59 unit and 62 integration tests.
