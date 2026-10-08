import type { FastifyRequest } from 'fastify';
import { db } from '../db/index.js';
import { writeAuditEvent } from '../lib/audit.js';
import { authErrors, type AppError } from '../lib/errors.js';
import {
  authenticateAiTokenResult,
  type AiTokenAuthenticationResult,
} from '../services/ai-credentials.js';
import type { McpIdentity, McpRequestContext } from '../lib/identity.js';

const bearerTokenPattern = /^Bearer (dpai_[A-Za-z0-9_-]{43})$/u;

export function readBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (typeof header !== 'string') return null;
  const match = bearerTokenPattern.exec(header.trim());
  return match?.[1] ?? null;
}

export async function authenticateAiRequest(
  request: FastifyRequest,
  context: McpRequestContext,
): Promise<McpIdentity> {
  const token = readBearerToken(request);
  if (token === null) throw authErrors.missingCredential();

  const result = await authenticateAiTokenResult(token);
  if (result.outcome === 'authenticated') return result.identity;

  if (result.outcome === 'denied') {
    await writeAuditEvent(db, {
      organizationId: result.identity.organizationId,
      aiCredentialId: result.identity.credentialId,
      agentIdentity: result.identity.agentIdentity,
      action: 'mcp.authentication_denied',
      resourceType: 'ai_credential',
      resourceId: result.identity.credentialId,
      outcome: 'denied',
      errorCategory: 'authentication',
      correlationId: context.correlationId,
      sourceIp: context.sourceIp,
      userAgent: context.userAgent,
      requestId: context.requestId,
      metadata: { reason: result.reason },
    });
  }

  throw authenticationError(result);
}

function authenticationError(result: AiTokenAuthenticationResult): AppError {
  if (result.outcome === 'unknown') return authErrors.invalidCredential();
  if (result.outcome === 'denied') {
    if (result.reason === 'revoked') return authErrors.revokedCredential();
    if (result.reason === 'expired') return authErrors.expiredCredential();
    return authErrors.disabledCredential();
  }
  return authErrors.invalidCredential();
}
