import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  aiCredentialListResponseSchema,
  aiCredentialViewSchema,
  approvalDecisionInputSchema,
  approvalDecisionResponseSchema,
  approvalListResponseSchema,
  auditEventListResponseSchema,
  auditEventQuerySchema,
  auditEventSchema,
  createAiCredentialInputSchema,
  createAiCredentialResponseSchema,
  idSchema,
  revokeAiCredentialResponseSchema,
  systemStatusSchema,
  type SafeUser,
} from '@dockpilot/shared';
import { db } from '../db/index.js';
import { writeAuditEvent } from '../lib/audit.js';
import {
  createAiCredential,
  disableAiCredential,
  enableAiCredential,
  listAiCredentials,
  revokeAiCredential,
  rotateAiCredential,
} from '../services/ai-credentials.js';
import { getAuditEvent, listAuditEvents } from '../services/audit-events.js';
import { decideApproval, listApprovals } from '../services/approvals.js';
import { getSystemStatus } from '../services/system-status.js';

const pageQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(256).optional(),
});

const approvalQuerySchema = pageQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected', 'expired', 'executed', 'failed']).optional(),
});

const approvalParamsSchema = z.strictObject({ id: idSchema });
const credentialParamsSchema = z.strictObject({ id: idSchema });
const auditEventParamsSchema = z.strictObject({ id: idSchema });

export function administratorRoutes(app: FastifyInstance): void {
  app.get('/system-status', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const status = await getSystemStatus({ organizationId: user.organizationId });
    return reply.send(systemStatusSchema.parse(status));
  });

  app.get('/ai-credentials', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const query = pageQuerySchema.safeParse(request.query);
    if (!query.success) return validationFailure(reply, 'The pagination parameters are not valid.');
    const page = await listAiCredentials({
      organizationId: user.organizationId,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
    return reply.send(aiCredentialListResponseSchema.parse(page));
  });

  app.post('/ai-credentials', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const input = createAiCredentialInputSchema.safeParse(request.body);
    if (!input.success) {
      return validationFailure(
        reply,
        'Provide a credential name, a permission level, and valid options.',
      );
    }

    const created = await db.transaction(async (transaction) => {
      const result = await createAiCredential({
        ...input.data,
        organizationId: user.organizationId,
        createdByUserId: user.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'ai_credential.created',
        resourceType: 'ai_credential',
        resourceId: result.credential.id,
        requestId: request.id,
        metadata: {
          name: result.credential.name,
          permissionLevel: result.credential.permissionLevel,
          agentIdentity: result.credential.agentIdentity,
          expiresAt: result.credential.expiresAt,
        },
      });
      return result;
    });

    return reply.code(201).send(createAiCredentialResponseSchema.parse(created));
  });

  app.post('/ai-credentials/:id/revoke', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = credentialParamsSchema.safeParse(request.params);
    if (!params.success)
      return validationFailure(reply, 'The AI credential identifier is not valid.');

    const credential = await db.transaction(async (transaction) => {
      const revoked = await revokeAiCredential({
        organizationId: user.organizationId,
        credentialId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'ai_credential.revoked',
        resourceType: 'ai_credential',
        resourceId: revoked.id,
        requestId: request.id,
        metadata: { name: revoked.name, permissionLevel: revoked.permissionLevel },
      });
      return revoked;
    });

    return reply.send(revokeAiCredentialResponseSchema.parse({ credential }));
  });

  app.post('/ai-credentials/:id/disable', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = credentialParamsSchema.safeParse(request.params);
    if (!params.success)
      return validationFailure(reply, 'The AI credential identifier is not valid.');

    const credential = await db.transaction(async (transaction) => {
      const disabled = await disableAiCredential({
        organizationId: user.organizationId,
        credentialId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'ai_credential.disabled',
        resourceType: 'ai_credential',
        resourceId: disabled.id,
        requestId: request.id,
        metadata: { name: disabled.name, permissionLevel: disabled.permissionLevel },
      });
      return disabled;
    });

    return reply.send(aiCredentialViewSchema.parse(credential));
  });

  app.post('/ai-credentials/:id/enable', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = credentialParamsSchema.safeParse(request.params);
    if (!params.success)
      return validationFailure(reply, 'The AI credential identifier is not valid.');

    const credential = await db.transaction(async (transaction) => {
      const enabled = await enableAiCredential({
        organizationId: user.organizationId,
        credentialId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'ai_credential.enabled',
        resourceType: 'ai_credential',
        resourceId: enabled.id,
        requestId: request.id,
        metadata: { name: enabled.name, permissionLevel: enabled.permissionLevel },
      });
      return enabled;
    });

    return reply.send(aiCredentialViewSchema.parse(credential));
  });

  app.post('/ai-credentials/:id/rotate', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = credentialParamsSchema.safeParse(request.params);
    if (!params.success)
      return validationFailure(reply, 'The AI credential identifier is not valid.');

    const created = await db.transaction(async (transaction) => {
      const result = await rotateAiCredential({
        organizationId: user.organizationId,
        credentialId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'ai_credential.rotated',
        resourceType: 'ai_credential',
        resourceId: result.credential.id,
        requestId: request.id,
        metadata: {
          name: result.credential.name,
          permissionLevel: result.credential.permissionLevel,
          tokenPrefix: result.credential.tokenPrefix,
        },
      });
      return result;
    });

    return reply.code(201).send(createAiCredentialResponseSchema.parse(created));
  });

  app.get('/audit-events', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const query = auditEventQuerySchema.safeParse(request.query);
    if (!query.success)
      return validationFailure(reply, 'The audit filter parameters are not valid.');
    const page = await listAuditEvents({ ...query.data, organizationId: user.organizationId });
    return reply.send(auditEventListResponseSchema.parse(page));
  });

  app.get('/audit-events/:id', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = auditEventParamsSchema.safeParse(request.params);
    if (!params.success)
      return validationFailure(reply, 'The audit event identifier is not valid.');
    const event = await getAuditEvent({
      organizationId: user.organizationId,
      eventId: params.data.id,
    });
    return reply.send(auditEventSchema.parse(event));
  });

  app.get('/approvals', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const query = approvalQuerySchema.safeParse(request.query);
    if (!query.success) {
      return validationFailure(reply, 'The approval filter parameters are not valid.');
    }
    const page = await listApprovals({
      organizationId: user.organizationId,
      status: query.data.status,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
    return reply.send(approvalListResponseSchema.parse(page));
  });

  app.post('/approvals/:id/decision', async (request, reply) => {
    const user = requireAdministrator(request, reply);
    if (user === null) return reply;
    const params = approvalParamsSchema.safeParse(request.params);
    if (!params.success) {
      return validationFailure(reply, 'The approval request identifier is not valid.');
    }
    const input = approvalDecisionInputSchema.safeParse(request.body);
    if (!input.success) {
      return validationFailure(reply, 'Provide a decision of "approve" or "reject".');
    }
    const approval = await decideApproval({
      organizationId: user.organizationId,
      approvalId: params.data.id,
      decidedByUserId: user.id,
      decision: input.data.decision,
      note: input.data.note,
    });
    return reply.send(approvalDecisionResponseSchema.parse({ approval }));
  });
}

function requireAdministrator(request: FastifyRequest, reply: FastifyReply): SafeUser | null {
  const user = request.dockpilotUser;
  if (user === null) {
    void reply.code(401).send({ error: 'UNAUTHENTICATED', message: 'Sign in to continue.' });
    return null;
  }
  if (user.role !== 'owner' && user.role !== 'admin') {
    void reply.code(403).send({ error: 'FORBIDDEN', message: 'Administrator access is required.' });
    return null;
  }
  return user;
}

function validationFailure(reply: FastifyReply, message: string): FastifyReply {
  return reply.code(400).send({ error: 'VALIDATION_ERROR', message });
}
