import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { mcpToolNameSchema } from '@dockpilot/shared';
import { db } from '../db/index.js';
import { writeAuditEvent } from '../lib/audit.js';
import { asAppError, authzErrors, rateLimitedError, validationError } from '../lib/errors.js';
import { hasPermission } from '../lib/identity.js';
import { mcpRateLimiter } from '../lib/rate-limit.js';
import { mcpToolRegistry, type McpToolDefinition } from './registry.js';
import { errorResult, successResult } from './results.js';
import type { McpSession } from './session.js';

interface AuditScope {
  toolName: string | null;
  action: string;
  resourceType: string;
  permissionUsed: string | null;
}

export async function executeToolCall(
  session: McpSession,
  toolName: unknown,
  rawArguments: unknown,
): Promise<CallToolResult> {
  const startedAt = Date.now();
  const parsedName = mcpToolNameSchema.safeParse(toolName);

  if (!parsedName.success) {
    await writeAuditEvent(db, {
      ...sessionScope(session),
      toolName: typeof toolName === 'string' ? toolName.slice(0, 80) : null,
      action: 'mcp.unknown_tool',
      resourceType: 'mcp_tool',
      outcome: 'denied',
      errorCategory: 'validation',
      durationMs: elapsedMs(startedAt),
      resultSummary: { reason: 'unknown_tool' },
    });
    return errorResult(validationError('The requested MCP tool does not exist.'));
  }

  const definition = mcpToolRegistry[parsedName.data];
  const scope: AuditScope = {
    toolName: definition.name,
    action: definition.actionType,
    resourceType: definition.resourceType,
    permissionUsed: definition.permissionLevel,
  };

  const decision = mcpRateLimiter.check(session.identity.credentialId, definition.rateCategory);
  if (!decision.allowed) {
    await writeAuditEvent(db, {
      ...sessionScope(session),
      ...scope,
      outcome: 'denied',
      errorCategory: 'rate_limited',
      durationMs: elapsedMs(startedAt),
      resultSummary: { retryAfterSeconds: decision.retryAfterSeconds },
    });
    return errorResult(rateLimitedError(decision.retryAfterSeconds));
  }

  const parsedInput = definition.inputSchema.safeParse(rawArguments ?? {});
  if (!parsedInput.success) {
    await writeAuditEvent(db, {
      ...sessionScope(session),
      ...scope,
      outcome: 'denied',
      errorCategory: 'validation',
      durationMs: elapsedMs(startedAt),
      resultSummary: { reason: 'invalid_input' },
    });
    return errorResult(
      validationError('The tool input was rejected. Check the tool input schema.'),
    );
  }

  if (!hasPermission(session.identity.permissionLevel, definition.permissionLevel)) {
    await writeAuditEvent(db, {
      ...sessionScope(session),
      ...scope,
      outcome: 'denied',
      errorCategory: 'authorization',
      durationMs: elapsedMs(startedAt),
      resultSummary: { requiredPermission: definition.permissionLevel },
    });
    return errorResult(authzErrors.insufficientPermission(definition.permissionLevel));
  }

  return runTool(session, definition, parsedInput.data, scope, startedAt);
}

async function runTool(
  session: McpSession,
  definition: McpToolDefinition,
  input: unknown,
  scope: AuditScope,
  startedAt: number,
): Promise<CallToolResult> {
  try {
    const output = await invoke(session, definition, input, scope, startedAt);
    return successResult(output);
  } catch (error) {
    const appError = asAppError(error);
    await writeAuditEvent(db, {
      ...sessionScope(session),
      ...scope,
      outcome: 'failure',
      errorCategory: appError.category,
      durationMs: elapsedMs(startedAt),
      inputSummary: summarizeInput(input),
      resultSummary: { message: appError.message },
    });
    return errorResult(appError);
  }
}

async function invoke(
  session: McpSession,
  definition: McpToolDefinition,
  input: unknown,
  scope: AuditScope,
  startedAt: number,
): Promise<Record<string, unknown>> {
  const toolContext = {
    identity: session.identity,
    request: session.request,
  };

  if (!definition.mutates) {
    const value = await definition.handler(input, { ...toolContext, executor: db });
    definition.outputSchema.parse(value);
    await writeAuditEvent(db, {
      ...sessionScope(session),
      ...scope,
      ...outputReference(value),
      outcome: 'success',
      durationMs: elapsedMs(startedAt),
      inputSummary: summarizeInput(input),
      resultSummary: summarizeOutput(value),
    });
    return value;
  }

  return db.transaction(async (transaction) => {
    const value = await definition.handler(input, { ...toolContext, executor: transaction });
    definition.outputSchema.parse(value);
    await writeAuditEvent(transaction, {
      ...sessionScope(session),
      ...scope,
      ...outputReference(value),
      outcome: 'success',
      durationMs: elapsedMs(startedAt),
      inputSummary: summarizeInput(input),
      resultSummary: summarizeOutput(value),
    });
    return value;
  });
}

function outputReference(output: Record<string, unknown>): {
  approvalId: string | null;
  targetType: string | null;
  targetId: string | null;
} {
  const approvalId = output.approvalId;
  const targetType = output.targetType;
  const targetId = output.targetId;
  return {
    approvalId: typeof approvalId === 'string' ? approvalId : null,
    targetType: typeof targetType === 'string' ? targetType : null,
    targetId: typeof targetId === 'string' ? targetId : null,
  };
}

function sessionScope(session: McpSession): {
  organizationId: string;
  aiCredentialId: string;
  agentIdentity: string;
  correlationId: string;
  sourceIp: string | null;
  userAgent: string | null;
  requestId: string | null;
} {
  return {
    organizationId: session.identity.organizationId,
    aiCredentialId: session.identity.credentialId,
    agentIdentity: session.identity.agentIdentity,
    correlationId: session.request.correlationId,
    sourceIp: session.request.sourceIp,
    userAgent: session.request.userAgent,
    requestId: session.request.requestId,
  };
}

function summarizeInput(input: unknown): Record<string, unknown> | null {
  return isRecord(input) ? input : null;
}

function summarizeOutput(output: Record<string, unknown>): Record<string, unknown> {
  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(output)) {
    if (Array.isArray(value)) {
      summary[`${key}Count`] = value.length;
      continue;
    }
    summary[key] = value;
  }
  return summary;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function elapsedMs(startedAt: number): number {
  return Math.max(0, Date.now() - startedAt);
}
