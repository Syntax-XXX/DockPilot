import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { closeDatabase } from '../db/index.js';
import { authenticateAiToken, markAiCredentialUsed } from '../services/ai-credentials.js';
import { buildLocalSession } from './session.js';
import { createMcpServer } from './server.js';

const token = process.env.DOCKPILOT_MCP_TOKEN;

if (token === undefined || token.length === 0) {
  process.stderr.write(
    'DOCKPILOT_MCP_TOKEN must be set to a DockPilot AI credential token before starting the stdio MCP server.\n',
  );
  process.exit(1);
}

try {
  const identity = await authenticateAiToken(token);
  await markAiCredentialUsed(identity.credentialId);
  const server = createMcpServer(buildLocalSession(identity, 'dockpilot-mcp-stdio'));
  await server.connect(new StdioServerTransport());
  process.stderr.write(
    `DockPilot MCP stdio server ready for credential ${identity.credentialName}.\n`,
  );
} catch (error) {
  process.stderr.write(
    `DockPilot MCP stdio server failed to start: ${error instanceof Error ? error.message : 'unknown error'}\n`,
  );
  await closeDatabase();
  process.exit(1);
}
