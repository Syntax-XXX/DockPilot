import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  approvalRequestResponseSchema,
  containerActionResponseSchema,
  containerListResponseSchema,
  containerLogResponseSchema,
  createHostInputSchema,
  containerViewResponseSchema,
  createHostResponseSchema,
  hostListResponseSchema,
  hostViewSchema,
  idSchema,
  updateHostInputSchema,
  updateHostResponseSchema,
  type SafeUser,
} from '@dockpilot/shared';
import { db } from '../db/index.js';
import { writeAuditEvent } from '../lib/audit.js';
import { hasDockerCapability, type DockerCapability } from '../lib/docker-authz.js';
import { translateDockerError } from '../lib/docker-errors.js';
import {
  createHost,
  disableHost,
  enableHost,
  getHost,
  listHosts,
  refreshHost,
  syncHostContainers,
  updateHost,
} from '../services/hosts.js';
import {
  containerLog,
  getContainer,
  listContainers,
  restartContainer,
  startContainer,
  stopContainer,
} from '../services/containers.js';
import { createApproval } from '../services/approvals.js';

const containerIdSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/u, 'The container identifier is not valid.');

const pageQuerySchema = z.strictObject({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().max(256).optional(),
});

const containerQuerySchema = pageQuerySchema.extend({
  tail: z.coerce.number().int().min(1).max(1000).optional(),
});

const hostParamsSchema = z.strictObject({ id: idSchema });
const containerParamsSchema = z.strictObject({ containerId: containerIdSchema });
const removalBodySchema = z.strictObject({
  justification: z.string().trim().min(4).max(500).optional(),
});

export function dockerRoutes(app: FastifyInstance): void {
  app.get('/hosts', async (request, reply) => {
    const user = requireCapability(request, reply, 'read');
    if (user === null) return reply;
    const query = pageQuerySchema.safeParse(request.query);
    if (!query.success) return validationFailure(reply, 'The pagination parameters are not valid.');
    const page = await listHosts({
      organizationId: user.organizationId,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
    return reply.send(hostListResponseSchema.parse(page));
  });

  app.post('/hosts', async (request, reply) => {
    const user = requireCapability(request, reply, 'manage');
    if (user === null) return reply;
    const input = createHostInputSchema.safeParse(request.body);
    if (!input.success) {
      return validationFailure(reply, 'Provide a host name and a valid Docker endpoint.');
    }

    try {
      const created = await db.transaction(async (transaction) => {
        const result = await createHost({
          ...input.data,
          organizationId: user.organizationId,
          createdByUserId: user.id,
          executor: transaction,
        });
        await writeAuditEvent(transaction, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'host.created',
          resourceType: 'host',
          resourceId: result.host.id,
          requestId: request.id,
          metadata: { name: result.host.name, endpoint: result.host.endpoint },
        });
        return result;
      });
      return await reply.code(201).send(createHostResponseSchema.parse(created));
    } catch (error) {
      throw translateDockerError(error);
    }
  });

  app.get('/hosts/:id', async (request, reply) => {
    const user = requireCapability(request, reply, 'read');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');
    const host = await getHost({ organizationId: user.organizationId, hostId: params.data.id });
    return await reply.send(hostViewSchema.parse(host));
  });

  app.patch('/hosts/:id', async (request, reply) => {
    const user = requireCapability(request, reply, 'manage');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');
    const input = updateHostInputSchema.safeParse(request.body);
    if (!input.success) return validationFailure(reply, 'The host update is not valid.');

    try {
      const updated = await db.transaction(async (transaction) => {
        const host = await updateHost({
          ...input.data,
          organizationId: user.organizationId,
          hostId: params.data.id,
          executor: transaction,
        });
        await writeAuditEvent(transaction, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'host.updated',
          resourceType: 'host',
          resourceId: host.id,
          requestId: request.id,
          metadata: { name: host.name, endpoint: host.endpoint },
        });
        return host;
      });
      return await reply.send(updateHostResponseSchema.parse({ host: updated }));
    } catch (error) {
      throw translateDockerError(error);
    }
  });

  app.post('/hosts/:id/refresh', async (request, reply) => {
    const user = requireCapability(request, reply, 'operate');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');

    try {
      const host = await db.transaction(async (transaction) => {
        const refreshed = await refreshHost({
          organizationId: user.organizationId,
          hostId: params.data.id,
          executor: transaction,
        });
        await writeAuditEvent(transaction, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'host.refreshed',
          resourceType: 'host',
          resourceId: refreshed.id,
          requestId: request.id,
          metadata: { name: refreshed.name, status: refreshed.status },
        });
        return refreshed;
      });
      return await reply.send(hostViewSchema.parse(host));
    } catch (error) {
      throw translateDockerError(error);
    }
  });

  app.post('/hosts/:id/disable', async (request, reply) => {
    const user = requireCapability(request, reply, 'manage');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');

    const host = await db.transaction(async (transaction) => {
      const disabled = await disableHost({
        organizationId: user.organizationId,
        hostId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'host.disabled',
        resourceType: 'host',
        resourceId: disabled.id,
        requestId: request.id,
        metadata: { name: disabled.name },
      });
      return disabled;
    });
    return await reply.send(hostViewSchema.parse(host));
  });

  app.post('/hosts/:id/enable', async (request, reply) => {
    const user = requireCapability(request, reply, 'manage');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');

    const host = await db.transaction(async (transaction) => {
      const enabled = await enableHost({
        organizationId: user.organizationId,
        hostId: params.data.id,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'host.enabled',
        resourceType: 'host',
        resourceId: enabled.id,
        requestId: request.id,
        metadata: { name: enabled.name },
      });
      return enabled;
    });
    return await reply.send(hostViewSchema.parse(host));
  });

  app.post('/hosts/:id/sync', async (request, reply) => {
    const user = requireCapability(request, reply, 'operate');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');

    try {
      const result = await db.transaction(async (transaction) => {
        const synced = await syncHostContainers({
          organizationId: user.organizationId,
          hostId: params.data.id,
          executor: transaction,
        });
        await writeAuditEvent(transaction, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          action: 'host.synced',
          resourceType: 'host',
          resourceId: params.data.id,
          requestId: request.id,
          resultSummary: { synced: synced.synced },
        });
        return synced;
      });
      return await reply.send(
        z.strictObject({ synced: z.number().int().nonnegative() }).parse(result),
      );
    } catch (error) {
      throw translateDockerError(error);
    }
  });

  app.delete('/hosts/:id', async (request, reply) => {
    const user = requireCapability(request, reply, 'remove');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');
    const body = removalBodySchema.safeParse(request.body ?? {});
    if (!body.success) return validationFailure(reply, 'The removal justification is not valid.');

    const approval = await db.transaction(async (transaction) => {
      const host = await getHost({
        organizationId: user.organizationId,
        hostId: params.data.id,
        executor: transaction,
      });
      const created = await createApproval({
        organizationId: user.organizationId,
        requestedByCredentialId: null,
        toolName: 'admin.host_removal',
        actionType: 'host.remove',
        permissionLevel: 'destructive',
        targetType: 'host',
        targetId: host.id,
        args: { hostId: host.id },
        justification: body.data.justification ?? `Administrator removal of host ${host.name}.`,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'host.removal_requested',
        resourceType: 'host',
        resourceId: host.id,
        requestId: request.id,
        approvalId: created.id,
        targetType: 'host',
        targetId: host.id,
      });
      return created;
    });
    return reply.code(202).send(approvalRequestResponseSchema.parse({ approval }));
  });

  app.get('/hosts/:id/containers', async (request, reply) => {
    const user = requireCapability(request, reply, 'read');
    if (user === null) return reply;
    const params = hostParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The host identifier is not valid.');
    const query = pageQuerySchema.safeParse(request.query);
    if (!query.success) return validationFailure(reply, 'The pagination parameters are not valid.');
    const page = await listContainers({
      organizationId: user.organizationId,
      hostId: params.data.id,
      limit: query.data.limit,
      cursor: query.data.cursor,
    });
    return reply.send(containerListResponseSchema.parse(page));
  });

  app.get('/containers/:containerId', async (request, reply) => {
    const user = requireCapability(request, reply, 'read');
    if (user === null) return reply;
    const params = containerParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The container identifier is not valid.');
    const container = await getContainer({
      organizationId: user.organizationId,
      containerId: params.data.containerId,
    });
    return reply.send(containerViewResponseSchema.parse({ container }));
  });

  app.get('/containers/:containerId/logs', async (request, reply) => {
    const user = requireCapability(request, reply, 'read');
    if (user === null) return reply;
    const params = containerParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The container identifier is not valid.');
    const query = containerQuerySchema.safeParse(request.query);
    if (!query.success) return validationFailure(reply, 'The log parameters are not valid.');

    try {
      const log = await containerLog({
        organizationId: user.organizationId,
        containerId: params.data.containerId,
        tail: query.data.tail,
      });
      return await reply.send(containerLogResponseSchema.parse({ log }));
    } catch (error) {
      throw translateDockerError(error);
    }
  });

  for (const action of ['start', 'stop', 'restart'] as const) {
    app.post(`/containers/:containerId/${action}`, async (request, reply) => {
      const user = requireCapability(request, reply, 'operate');
      if (user === null) return reply;
      const params = containerParamsSchema.safeParse(request.params);
      if (!params.success) {
        return validationFailure(reply, 'The container identifier is not valid.');
      }

      try {
        const container = await db.transaction(async (transaction) => {
          const updated = await runContainerAction(action, {
            organizationId: user.organizationId,
            containerId: params.data.containerId,
            executor: transaction,
          });
          await writeAuditEvent(transaction, {
            organizationId: user.organizationId,
            actorUserId: user.id,
            action: containerActionNames[action],
            resourceType: 'container',
            resourceId: updated.id,
            requestId: request.id,
            targetType: 'container',
            targetId: updated.containerId,
            metadata: { name: updated.name, image: updated.image },
          });
          return updated;
        });
        return await reply.send(containerActionResponseSchema.parse({ container }));
      } catch (error) {
        throw translateDockerError(error);
      }
    });
  }

  app.delete('/containers/:containerId', async (request, reply) => {
    const user = requireCapability(request, reply, 'remove');
    if (user === null) return reply;
    const params = containerParamsSchema.safeParse(request.params);
    if (!params.success) return validationFailure(reply, 'The container identifier is not valid.');
    const body = removalBodySchema.safeParse(request.body ?? {});
    if (!body.success) return validationFailure(reply, 'The removal justification is not valid.');

    const approval = await db.transaction(async (transaction) => {
      const container = await getContainer({
        organizationId: user.organizationId,
        containerId: params.data.containerId,
        executor: transaction,
      });
      const created = await createApproval({
        organizationId: user.organizationId,
        requestedByCredentialId: null,
        toolName: 'admin.container_removal',
        actionType: 'container.remove',
        permissionLevel: 'destructive',
        targetType: 'container',
        targetId: container.containerId,
        args: { containerId: container.containerId },
        justification:
          body.data.justification ??
          `Administrator removal of container ${container.name ?? container.containerId}.`,
        executor: transaction,
      });
      await writeAuditEvent(transaction, {
        organizationId: user.organizationId,
        actorUserId: user.id,
        action: 'container.removal_requested',
        resourceType: 'container',
        resourceId: container.id,
        requestId: request.id,
        approvalId: created.id,
        targetType: 'container',
        targetId: container.containerId,
      });
      return created;
    });
    return reply.code(202).send(approvalRequestResponseSchema.parse({ approval }));
  });
}

const containerActionNames = {
  start: 'container.started',
  stop: 'container.stopped',
  restart: 'container.restarted',
} as const;

function runContainerAction(
  action: 'start' | 'stop' | 'restart',
  input: {
    organizationId: string;
    containerId: string;
    executor: Parameters<typeof startContainer>[0]['executor'];
  },
) {
  if (action === 'start') return startContainer(input);
  if (action === 'stop') return stopContainer(input);
  return restartContainer(input);
}

function requireCapability(
  request: FastifyRequest,
  reply: FastifyReply,
  capability: DockerCapability,
): SafeUser | null {
  const user = request.dockpilotUser;
  if (user === null) {
    void reply.code(401).send({ error: 'UNAUTHENTICATED', message: 'Sign in to continue.' });
    return null;
  }
  if (!hasDockerCapability(user.role, capability)) {
    void reply
      .code(403)
      .send({ error: 'FORBIDDEN', message: 'Your role does not permit this Docker operation.' });
    return null;
  }
  return user;
}

function validationFailure(reply: FastifyReply, message: string): FastifyReply {
  return reply.code(400).send({ error: 'VALIDATION_ERROR', message });
}
