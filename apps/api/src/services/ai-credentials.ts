import { and, desc, eq, isNull } from 'drizzle-orm';
import { db, type DbExecutor } from '../db/index.js';
import { aiCredentials } from '../db/schema.js';
import { createAiToken, hashAiToken, isAiTokenShape } from '../lib/ai-token.js';
import { keysetAfter } from '../lib/keyset.js';
import { decodeCursor, encodeCursor } from '../lib/pagination.js';
import { authErrors, conflictError, notFoundError, validationError } from '../lib/errors.js';
import type { McpIdentity } from '../lib/identity.js';
import type {
  AiCredentialView,
  CreateAiCredentialInput,
  CreateAiCredentialResponse,
  AiPermissionLevel,
} from '@dockpilot/shared';

interface CredentialRow {
  id: string;
  name: string;
  description: string | null;
  agentIdentity: string;
  permissionLevel: AiPermissionLevel;
  tokenPrefix: string;
  createdByUserId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  disabledAt: Date | null;
}

const credentialColumns = {
  id: aiCredentials.id,
  name: aiCredentials.name,
  description: aiCredentials.description,
  agentIdentity: aiCredentials.agentIdentity,
  permissionLevel: aiCredentials.permissionLevel,
  tokenPrefix: aiCredentials.tokenPrefix,
  createdByUserId: aiCredentials.createdByUserId,
  metadata: aiCredentials.metadata,
  createdAt: aiCredentials.createdAt,
  updatedAt: aiCredentials.updatedAt,
  lastUsedAt: aiCredentials.lastUsedAt,
  expiresAt: aiCredentials.expiresAt,
  revokedAt: aiCredentials.revokedAt,
  disabledAt: aiCredentials.disabledAt,
};

function toView(row: CredentialRow): AiCredentialView {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    agentIdentity: row.agentIdentity,
    permissionLevel: row.permissionLevel,
    tokenPrefix: row.tokenPrefix,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    disabledAt: row.disabledAt?.toISOString() ?? null,
    metadata: row.metadata,
  };
}

export interface CreateAiCredentialServiceInput extends CreateAiCredentialInput {
  organizationId: string;
  createdByUserId: string;
  executor?: DbExecutor;
}

export async function createAiCredential(
  input: CreateAiCredentialServiceInput,
): Promise<CreateAiCredentialResponse> {
  const executor = input.executor ?? db;
  const generated = createAiToken();
  const expiresAt =
    input.expiresInDays === undefined
      ? null
      : new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000);

  const inserted = await executor
    .insert(aiCredentials)
    .values({
      organizationId: input.organizationId,
      createdByUserId: input.createdByUserId,
      name: input.name,
      description: input.description ?? null,
      agentIdentity: input.agentIdentity ?? 'unspecified',
      permissionLevel: input.permissionLevel,
      tokenPrefix: generated.tokenPrefix,
      tokenHash: generated.tokenHash,
      metadata: input.metadata ?? null,
      expiresAt,
    })
    .returning(credentialColumns);

  const row = inserted[0];
  if (!row) throw new Error('AI credential creation failed.');

  return { credential: toView(row), token: generated.token };
}

export interface ListAiCredentialsInput {
  organizationId: string;
  limit: number;
  cursor?: string | undefined;
  executor?: DbExecutor;
}

export async function listAiCredentials(
  input: ListAiCredentialsInput,
): Promise<{ credentials: AiCredentialView[]; nextCursor: string | null }> {
  const executor = input.executor ?? db;
  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (input.cursor && !cursor) throw validationError('The pagination cursor is not valid.');

  const rows = await executor
    .select(credentialColumns)
    .from(aiCredentials)
    .where(
      and(
        eq(aiCredentials.organizationId, input.organizationId),
        keysetAfter(aiCredentials.createdAt, aiCredentials.id, cursor),
      ),
    )
    .orderBy(desc(aiCredentials.createdAt), desc(aiCredentials.id))
    .limit(input.limit + 1);

  const page = rows.slice(0, input.limit);
  const last = page.at(-1);
  const overflow = rows.length > input.limit;

  return {
    credentials: page.map(toView),
    nextCursor: overflow && last ? encodeCursor([last.createdAt.toISOString(), last.id]) : null,
  };
}

export async function getAiCredential(input: {
  organizationId: string;
  credentialId: string;
  executor?: DbExecutor;
}): Promise<AiCredentialView> {
  const executor = input.executor ?? db;
  const rows = await executor
    .select(credentialColumns)
    .from(aiCredentials)
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) throw notFoundError('The AI credential does not exist.');
  return toView(row);
}

export async function revokeAiCredential(input: {
  organizationId: string;
  credentialId: string;
  executor?: DbExecutor;
}): Promise<AiCredentialView> {
  const executor = input.executor ?? db;
  const updated = await executor
    .update(aiCredentials)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
        isNull(aiCredentials.revokedAt),
      ),
    )
    .returning(credentialColumns);

  const row = updated[0];
  if (row) return toView(row);

  const existing = await executor
    .select({ revokedAt: aiCredentials.revokedAt })
    .from(aiCredentials)
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
      ),
    )
    .limit(1);
  if (!existing[0]) throw notFoundError('The AI credential does not exist.');
  throw conflictError('This AI credential has already been revoked.');
}

export interface DisableAiCredentialInput {
  organizationId: string;
  credentialId: string;
  executor?: DbExecutor;
}

export async function disableAiCredential(input: DisableAiCredentialInput): Promise<AiCredentialView> {
  const executor = input.executor ?? db;
  const updated = await executor
    .update(aiCredentials)
    .set({ disabledAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
        isNull(aiCredentials.revokedAt),
        isNull(aiCredentials.disabledAt),
      ),
    )
    .returning(credentialColumns);

  const row = updated[0];
  if (row) return toView(row);

  const existing = await executor
    .select({ revokedAt: aiCredentials.revokedAt, disabledAt: aiCredentials.disabledAt })
    .from(aiCredentials)
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
      ),
    )
    .limit(1);
  if (!existing[0]) throw notFoundError('The AI credential does not exist.');
  throw conflictError('This AI credential cannot be disabled.');
}

export interface EnableAiCredentialInput {
  organizationId: string;
  credentialId: string;
  executor?: DbExecutor;
}

export async function enableAiCredential(input: EnableAiCredentialInput): Promise<AiCredentialView> {
  const executor = input.executor ?? db;
  const updated = await executor
    .update(aiCredentials)
    .set({ disabledAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
        isNull(aiCredentials.revokedAt),
      ),
    )
    .returning(credentialColumns);

  const row = updated[0];
  if (row) return toView(row);

  throw conflictError('This AI credential cannot be enabled.');
}

export interface RotateAiCredentialInput {
  organizationId: string;
  credentialId: string;
  executor?: DbExecutor;
}

export async function rotateAiCredential(input: RotateAiCredentialInput): Promise<CreateAiCredentialResponse> {
  const executor = input.executor ?? db;
  const generated = createAiToken();
  const updated = await executor
    .update(aiCredentials)
    .set({
      tokenHash: generated.tokenHash,
      tokenPrefix: generated.tokenPrefix,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(aiCredentials.id, input.credentialId),
        eq(aiCredentials.organizationId, input.organizationId),
        isNull(aiCredentials.revokedAt),
      ),
    )
    .returning(credentialColumns);

  const row = updated[0];
  if (!row) throw new Error('AI credential rotation failed.');

  return { credential: toView(row), token: generated.token };
}

export interface UpdateOwnCredentialInput {
  identity: McpIdentity;
  description?: string | null | undefined;
  agentIdentity?: string | undefined;
  metadata?: Record<string, unknown> | null | undefined;
  executor?: DbExecutor;
}

export async function updateOwnAiCredential(
  input: UpdateOwnCredentialInput,
): Promise<AiCredentialView> {
  const executor = input.executor ?? db;
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (input.description !== undefined) patch.description = input.description;
  if (input.agentIdentity !== undefined) patch.agentIdentity = input.agentIdentity;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const updated = await executor
    .update(aiCredentials)
    .set(patch)
    .where(
      and(
        eq(aiCredentials.id, input.identity.credentialId),
        eq(aiCredentials.organizationId, input.identity.organizationId),
        isNull(aiCredentials.revokedAt),
      ),
    )
    .returning(credentialColumns);

  const row = updated[0];
  if (!row) throw notFoundError('The AI credential does not exist.');
  return toView(row);
}

export type AiTokenAuthenticationResult =
  | { outcome: 'authenticated'; identity: McpIdentity }
  | { outcome: 'unknown' }
  | { outcome: 'denied'; reason: 'revoked' | 'expired' | 'disabled'; identity: McpIdentity };

export async function authenticateAiTokenResult(
  token: string,
  executor: DbExecutor = db,
): Promise<AiTokenAuthenticationResult> {
  if (!isAiTokenShape(token)) return { outcome: 'unknown' };
  const rows = await executor
    .select({
      id: aiCredentials.id,
      name: aiCredentials.name,
      agentIdentity: aiCredentials.agentIdentity,
      permissionLevel: aiCredentials.permissionLevel,
      organizationId: aiCredentials.organizationId,
      expiresAt: aiCredentials.expiresAt,
      revokedAt: aiCredentials.revokedAt,
      disabledAt: aiCredentials.disabledAt,
    })
    .from(aiCredentials)
    .where(eq(aiCredentials.tokenHash, hashAiToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return { outcome: 'unknown' };

  const identity: McpIdentity = {
    credentialId: row.id,
    credentialName: row.name,
    agentIdentity: row.agentIdentity,
    permissionLevel: row.permissionLevel,
    organizationId: row.organizationId,
  };

  if (row.revokedAt) return { outcome: 'denied', reason: 'revoked', identity };
  if (row.disabledAt) return { outcome: 'denied', reason: 'disabled', identity };
  if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
    return { outcome: 'denied', reason: 'expired', identity };
  }

  return { outcome: 'authenticated', identity };
}

export async function authenticateAiToken(
  token: string,
  executor: DbExecutor = db,
): Promise<McpIdentity> {
  const result = await authenticateAiTokenResult(token, executor);
  if (result.outcome === 'authenticated') return result.identity;
  if (result.outcome === 'unknown') throw authErrors.invalidCredential();
  if (result.reason === 'revoked') throw authErrors.revokedCredential();
  if (result.reason === 'expired') throw authErrors.expiredCredential();
  throw authErrors.disabledCredential();
}

export async function markAiCredentialUsed(credentialId: string): Promise<void> {
  await db
    .update(aiCredentials)
    .set({ lastUsedAt: new Date() })
    .where(and(eq(aiCredentials.id, credentialId), isNull(aiCredentials.revokedAt)));
}
