import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { mcpServerName, mcpServerVersion, mcpToolCatalog, mcpToolNames } from '@dockpilot/shared';
import { mcpToolRegistry } from './registry.js';
import { executeToolCall } from './dispatch.js';
import type { McpSession } from './session.js';

export function createMcpServer(session: McpSession): McpServer {
  const mcpServer = new McpServer(
    { name: mcpServerName, version: mcpServerVersion },
    { capabilities: { tools: {} } },
  );
  const protocolServer = mcpServer.server;

  protocolServer.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: listToolDefinitions(),
  }));

  protocolServer.setRequestHandler(CallToolRequestSchema, async (request) =>
    executeToolCall(session, request.params.name, request.params.arguments),
  );

  return mcpServer;
}

export function listToolDefinitions(): Tool[] {
  return mcpToolNames.map((name) => {
    const definition = mcpToolRegistry[name];
    const security = mcpToolCatalog[name];
    return {
      name: definition.name,
      description: definition.description,
      inputSchema: toJsonSchema(definition.inputSchema),
      outputSchema: toJsonSchema(definition.outputSchema),
      annotations: {
        title: definition.title,
        readOnlyHint: definition.readOnly,
        destructiveHint: security.destructive,
        idempotentHint: security.permissionLevel === 'read',
        openWorldHint: false,
      },
    };
  });
}

function toJsonSchema(schema: z.ZodType): Tool['inputSchema'] {
  const json = z.toJSONSchema(schema);
  const properties: Record<string, object> = {};
  for (const [key, value] of Object.entries(json.properties ?? {})) {
    if (typeof value === 'object') properties[key] = value;
  }
  return {
    type: 'object',
    properties,
    required: json.required ?? [],
    additionalProperties: false,
  };
}
