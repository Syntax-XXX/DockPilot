import type { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { describe, expect, it } from 'vitest';
import {
  mcpToolCatalog,
  mcpToolInputSchemas,
  mcpToolNames,
  mcpToolOutputSchemas,
  type McpToolName,
} from '@dockpilot/shared';
import { mcpToolRegistry } from '../../src/mcp/registry.js';
import { listToolDefinitions } from '../../src/mcp/server.js';

const sampleUuid = 'b7ba6c0e-e4d6-4b2c-88ee-8a7384f43128';
const sampleContainerId = 'a'.repeat(64);

const forbiddenToolNames = ['execute', 'shell', 'command', 'docker_exec', 'sql', 'run', 'admin'];

const validMinimalInputs: Record<McpToolName, Record<string, unknown>> = {
  dockpilot_health: {},
  dockpilot_system_status: {},
  dockpilot_list_users: {},
  dockpilot_list_sessions: {},
  dockpilot_list_ai_credentials: {},
  dockpilot_list_audit_events: {},
  dockpilot_get_audit_event: { eventId: sampleUuid },
  dockpilot_list_approvals: {},
  dockpilot_update_my_credential: {},
  dockpilot_request_session_revocation: {
    sessionId: sampleUuid,
    justification: 'rotate compromised access',
  },
  dockpilot_request_credential_revocation: {
    credentialId: sampleUuid,
    justification: 'rotate compromised access',
  },
  dockpilot_list_hosts: {},
  dockpilot_get_host: { hostId: sampleUuid },
  dockpilot_list_containers: { hostId: sampleUuid },
  dockpilot_get_container_logs: { containerId: sampleContainerId },
  dockpilot_sync_host_containers: { hostId: sampleUuid },
  dockpilot_create_host: { name: 'lab-host', endpoint: 'unix:///var/run/docker.sock' },
  dockpilot_update_host: { hostId: sampleUuid, name: 'renamed-host' },
  dockpilot_set_container_state: { containerId: sampleContainerId, action: 'start' },
  dockpilot_request_host_removal: {
    hostId: sampleUuid,
    justification: 'retire the host',
  },
  dockpilot_request_container_removal: {
    containerId: sampleContainerId,
    justification: 'retire the container',
  },
};

function parses(schema: z.ZodType, input: unknown): boolean {
  return schema.safeParse(input).success;
}

describe('MCP tool catalog', () => {
  it('describes every advertised tool with a consistent permission and rate category', () => {
    expect([...mcpToolNames].sort()).toEqual(Object.keys(mcpToolCatalog).sort());
    expect(mcpToolNames.length).toBeGreaterThan(0);

    for (const name of mcpToolNames) {
      const entry = mcpToolCatalog[name];
      expect(['read', 'write', 'destructive']).toContain(entry.permissionLevel);
      expect(entry.rateCategory).toBe(entry.permissionLevel);
      expect(entry.actionType.startsWith('mcp.')).toBe(true);
      expect(typeof entry.destructive).toBe('boolean');
    }
  });

  it('marks destructive and read-only tools unambiguously', () => {
    for (const name of mcpToolNames) {
      const entry = mcpToolCatalog[name];
      if (name.startsWith('dockpilot_request_')) expect(entry.destructive).toBe(true);
      if (entry.permissionLevel === 'read') expect(entry.destructive).toBe(false);
      if (entry.permissionLevel === 'destructive') expect(entry.destructive).toBe(true);
    }
  });

  it('exposes no generic execution, shell, Docker or SQL capability', () => {
    for (const forbidden of forbiddenToolNames) {
      expect(mcpToolNames).not.toContain(forbidden);
    }
    for (const name of mcpToolNames) {
      expect(name.startsWith('dockpilot_')).toBe(true);
      expect(forbiddenToolNames).not.toContain(name);
    }
  });
});

describe('MCP registry contract', () => {
  it('registers exactly the catalogued tools with matching security metadata', () => {
    expect(Object.keys(mcpToolRegistry).sort()).toEqual([...mcpToolNames].sort());

    for (const name of mcpToolNames) {
      const definition = mcpToolRegistry[name];
      const entry = mcpToolCatalog[name];
      expect(definition.name).toBe(name);
      expect(definition.permissionLevel).toBe(entry.permissionLevel);
      expect(definition.rateCategory).toBe(entry.rateCategory);
      expect(definition.actionType).toBe(entry.actionType);
      expect(definition.destructive).toBe(entry.destructive);
      expect(definition.readOnly).toBe(entry.permissionLevel === 'read');
      expect(definition.title.length).toBeGreaterThan(0);
      expect(definition.description.length).toBeGreaterThan(0);
      expect(definition.resourceType.length).toBeGreaterThan(0);
      if (entry.permissionLevel === 'read') expect(definition.mutates).toBe(false);
      if (entry.destructive) expect(definition.mutates).toBe(true);
    }
  });

  it('defines a validated input schema, output schema and handler for every tool', () => {
    for (const name of mcpToolNames) {
      const definition = mcpToolRegistry[name];
      expect(typeof definition.handler).toBe('function');
      expect(typeof definition.inputSchema.safeParse).toBe('function');
      expect(typeof definition.inputSchema.parse).toBe('function');
      expect(typeof definition.outputSchema.safeParse).toBe('function');
      expect(typeof definition.outputSchema.parse).toBe('function');
    }
  });

  it('keeps input and output schema keys aligned with the tool names', () => {
    expect(Object.keys(mcpToolInputSchemas).sort()).toEqual([...mcpToolNames].sort());
    expect(Object.keys(mcpToolOutputSchemas).sort()).toEqual([...mcpToolNames].sort());
  });
});

describe('MCP tool input validation', () => {
  it('accepts a minimal valid input for every tool', () => {
    for (const name of mcpToolNames) {
      const schema: z.ZodType = mcpToolInputSchemas[name];
      expect(parses(schema, validMinimalInputs[name])).toBe(true);
    }
  });

  it('rejects unexpected fields and non-object input for every tool', () => {
    for (const name of mcpToolNames) {
      const schema: z.ZodType = mcpToolInputSchemas[name];
      const minimal = validMinimalInputs[name];
      expect(parses(schema, { ...minimal, unexpected: 'value' })).toBe(false);
      expect(parses(schema, { ...minimal, permissionLevel: 'destructive' })).toBe(false);
      expect(parses(schema, null)).toBe(false);
      expect(parses(schema, 7)).toBe(false);
      expect(parses(schema, 'input')).toBe(false);
      expect(parses(schema, [])).toBe(false);
    }
  });

  it('rejects malformed identifiers, limits and justification text', () => {
    const auditEvent = mcpToolInputSchemas.dockpilot_get_audit_event;
    expect(parses(auditEvent, { eventId: 'not-a-uuid' })).toBe(false);
    expect(parses(auditEvent, {})).toBe(false);
    expect(parses(auditEvent, { eventId: sampleUuid })).toBe(true);

    const sessionRevocation = mcpToolInputSchemas.dockpilot_request_session_revocation;
    const traversal = { sessionId: '../../etc/passwd', justification: 'valid justification' };
    expect(parses(sessionRevocation, traversal)).toBe(false);
    const shortJustification = { sessionId: sampleUuid, justification: 'abc' };
    expect(parses(sessionRevocation, shortJustification)).toBe(false);

    const credentialRevocation = mcpToolInputSchemas.dockpilot_request_credential_revocation;
    expect(parses(credentialRevocation, { credentialId: sampleUuid })).toBe(false);

    const listUsers = mcpToolInputSchemas.dockpilot_list_users;
    expect(parses(listUsers, { limit: 0 })).toBe(false);
    expect(parses(listUsers, { limit: 101 })).toBe(false);
    expect(parses(listUsers, { limit: 1.5 })).toBe(false);
    expect(parses(listUsers, { limit: '10' })).toBe(false);
    expect(parses(listUsers, { limit: 1 })).toBe(true);
    expect(parses(listUsers, { limit: 100 })).toBe(true);
    expect(parses(listUsers, { cursor: 'x'.repeat(257) })).toBe(false);

    const auditEvents = mcpToolInputSchemas.dockpilot_list_audit_events;
    expect(parses(auditEvents, { outcome: 'unknown' })).toBe(false);
    expect(parses(auditEvents, { outcome: 'failure' })).toBe(true);
    expect(parses(auditEvents, { from: 'yesterday' })).toBe(false);
  });

  it('does not accept a caller-supplied permission or identity escalation field', () => {
    const updateOwn = mcpToolInputSchemas.dockpilot_update_my_credential;
    const escalation = {
      permissionLevel: 'destructive',
      credentialId: sampleUuid,
      organizationId: sampleUuid,
      toolName: 'dockpilot_request_session_revocation',
      tokenHash: 'a'.repeat(64),
    };
    expect(parses(updateOwn, escalation)).toBe(false);
  });
});

describe('discoverable MCP tool definitions', () => {
  it('advertises one strict JSON schema per catalogued tool', () => {
    const definitions = listToolDefinitions();
    expect(definitions.length).toBe(mcpToolNames.length);
    const byName = new Map<string, Tool>();
    for (const tool of definitions) byName.set(tool.name, tool);

    for (const name of mcpToolNames) {
      const tool = byName.get(name);
      const entry = mcpToolCatalog[name];
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.type).toBe('object');
      expect(tool?.outputSchema?.type).toBe('object');
      expect(tool?.inputSchema.additionalProperties).toBe(false);
      expect(tool?.outputSchema?.additionalProperties).toBe(false);
      expect(tool?.annotations?.readOnlyHint).toBe(entry.permissionLevel === 'read');
      expect(tool?.annotations?.destructiveHint).toBe(entry.destructive);
      expect(tool?.annotations?.title).toBe(mcpToolRegistry[name].title);
      expect(tool?.description).toBe(mcpToolRegistry[name].description);
    }
  });
});
