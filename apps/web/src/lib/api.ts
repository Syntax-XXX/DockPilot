import {
  aiCredentialListResponseSchema,
  approvalDecisionResponseSchema,
  approvalListResponseSchema,
  approvalRequestResponseSchema,
  auditEventListResponseSchema,
  auditEventSchema,
  bootstrapStatusSchema,
  containerActionResponseSchema,
  containerListResponseSchema,
  containerLogResponseSchema,
  containerStatsResponseSchema,
  containerViewResponseSchema,
  createAiCredentialResponseSchema,
  createHostResponseSchema,
  dockerSummaryResponseSchema,
  hostDiagnosticsResponseSchema,
  hostListResponseSchema,
  hostViewSchema,
  imageListResponseSchema,
  networkListResponseSchema,
  revokeAiCredentialResponseSchema,
  sessionResponseSchema,
  systemStatusSchema,
  updateHostResponseSchema,
  volumeListResponseSchema,
  type AiCredentialView,
  type ApprovalView,
  type AuditEvent,
  type AuditEventQuery,
  type ContainerStats,
  type ContainerView,
  type CreateAiCredentialInput,
  type CreateHostInput,
  type DockerSummary,
  type HostDiagnostics,
  type HostView,
  type ImageView,
  type LoginInput,
  type NetworkView,
  type SafeUser,
  type SetupAccountInput,
  type SystemStatus,
  type UpdateHostInput,
  type VolumeView,
} from '@dockpilot/shared';
import { z } from 'zod';

const publicErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function requestJson<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`/api/v1/auth/${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) return throwApiError(response);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success)
    throw new ApiError(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid response. Check its logs.',
    );
  return parsed.data;
}

async function throwApiError(response: Response): Promise<never> {
  const parsed = publicErrorSchema.safeParse(await response.json().catch(() => null));
  if (response.status === 429) {
    throw new ApiError(
      response.status,
      'RATE_LIMITED',
      'Too many attempts. Please wait a few minutes and try again.',
    );
  }
  if (!parsed.success)
    throw new ApiError(response.status, 'REQUEST_FAILED', 'The request could not be completed.');
  throw new ApiError(response.status, parsed.data.error, parsed.data.message);
}

export async function fetchSetupStatus(): Promise<boolean> {
  const response = await fetch('/api/v1/auth/setup-status', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) await throwApiError(response);
  const parsed = bootstrapStatusSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new ApiError(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid setup response.',
    );
  return parsed.data.setupRequired;
}

export async function fetchSession(): Promise<SafeUser | null> {
  const response = await fetch('/api/v1/auth/me', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (response.status === 401) return null;
  if (!response.ok) await throwApiError(response);
  const parsed = sessionResponseSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new ApiError(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid session.',
    );
  return parsed.data.user;
}

export async function fetchApiHealth(): Promise<void> {
  const response = await fetch('/api/v1/health', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) await throwApiError(response);
}

export async function createFirstOwner(input: SetupAccountInput): Promise<SafeUser> {
  const response = await requestJson('setup', input, sessionResponseSchema);
  return response.user;
}

export async function logIn(input: LoginInput): Promise<SafeUser> {
  const response = await requestJson('login', input, sessionResponseSchema);
  return response.user;
}

export async function logOut(): Promise<void> {
  const response = await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{}',
  });
  if (!response.ok) await throwApiError(response);
}

export interface AiCredentialPage {
  credentials: AiCredentialView[];
  nextCursor: string | null;
}

export interface ApprovalPage {
  approvals: ApprovalView[];
  nextCursor: string | null;
}

export interface AuditEventPage {
  events: AuditEvent[];
  nextCursor: string | null;
}

async function requestAdmin<T>(path: string, init: RequestInit, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(`/api/v1/admin${path}`, {
    method: init.method ?? 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(init.body === undefined ? {} : { body: init.body }),
  });
  if (!response.ok) return throwApiError(response);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ApiError(
      502,
      'INVALID_API_RESPONSE',
      'The DockPilot server returned an invalid response. Check its logs.',
    );
  }
  return parsed.data;
}

export function fetchSystemStatus(): Promise<SystemStatus> {
  return requestAdmin('/system-status', {}, systemStatusSchema);
}

export function fetchAiCredentials(cursor?: string): Promise<AiCredentialPage> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  return requestAdmin(`/ai-credentials${query}`, {}, aiCredentialListResponseSchema);
}

export function createAiCredential(
  input: CreateAiCredentialInput,
): Promise<{ credential: AiCredentialView; token: string }> {
  return requestAdmin(
    '/ai-credentials',
    { method: 'POST', body: JSON.stringify(input) },
    createAiCredentialResponseSchema,
  );
}

export function revokeAiCredential(id: string): Promise<{ credential: AiCredentialView }> {
  return requestAdmin(
    `/ai-credentials/${encodeURIComponent(id)}/revoke`,
    { method: 'POST', body: '{}' },
    revokeAiCredentialResponseSchema,
  );
}

export function fetchAuditEvents(query: Partial<AuditEventQuery> = {}): Promise<AuditEventPage> {
  const params = new URLSearchParams();
  if (query.limit !== undefined) params.set('limit', String(query.limit));
  if (query.cursor !== undefined && query.cursor !== '') params.set('cursor', query.cursor);
  if (query.aiCredentialId !== undefined && query.aiCredentialId !== '') {
    params.set('aiCredentialId', query.aiCredentialId);
  }
  if (query.toolName !== undefined && query.toolName !== '') params.set('toolName', query.toolName);
  if (query.action !== undefined && query.action !== '') params.set('action', query.action);
  if (query.outcome !== undefined) params.set('outcome', query.outcome);
  if (query.targetType !== undefined && query.targetType !== '') {
    params.set('targetType', query.targetType);
  }
  if (query.targetId !== undefined && query.targetId !== '') params.set('targetId', query.targetId);
  if (query.from !== undefined && query.from !== '') params.set('from', query.from);
  if (query.to !== undefined && query.to !== '') params.set('to', query.to);
  const serialized = params.toString();
  return requestAdmin(
    `/audit-events${serialized.length > 0 ? `?${serialized}` : ''}`,
    {},
    auditEventListResponseSchema,
  );
}

export function fetchAuditEvent(id: string): Promise<AuditEvent> {
  return requestAdmin(`/audit-events/${encodeURIComponent(id)}`, {}, auditEventSchema);
}

export function fetchApprovals(status?: string, cursor?: string): Promise<ApprovalPage> {
  const params = new URLSearchParams();
  if (status !== undefined && status !== '') params.set('status', status);
  if (cursor !== undefined) params.set('cursor', cursor);
  const serialized = params.toString();
  return requestAdmin(
    `/approvals${serialized.length > 0 ? `?${serialized}` : ''}`,
    {},
    approvalListResponseSchema,
  );
}

export function decideApproval(
  id: string,
  decision: 'approve' | 'reject',
  note?: string,
): Promise<{ approval: ApprovalView }> {
  const payload: { decision: 'approve' | 'reject'; note?: string } = { decision };
  if (note !== undefined && note !== '') payload.note = note;
  return requestAdmin(
    `/approvals/${encodeURIComponent(id)}/decision`,
    { method: 'POST', body: JSON.stringify(payload) },
    approvalDecisionResponseSchema,
  );
}

export interface HostPage {
  hosts: HostView[];
  nextCursor: string | null;
}

export interface ContainerPage {
  containers: ContainerView[];
  nextCursor: string | null;
}

export function fetchHosts(cursor?: string): Promise<HostPage> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  return requestAdmin(`/hosts${query}`, {}, hostListResponseSchema);
}

export function createHost(input: CreateHostInput): Promise<{ host: HostView }> {
  return requestAdmin(
    '/hosts',
    { method: 'POST', body: JSON.stringify(input) },
    createHostResponseSchema,
  );
}

export function fetchHost(id: string): Promise<HostView> {
  return requestAdmin(`/hosts/${encodeURIComponent(id)}`, {}, hostViewSchema);
}

export function updateHost(id: string, input: UpdateHostInput): Promise<{ host: HostView }> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    updateHostResponseSchema,
  );
}

export function refreshHost(id: string): Promise<HostView> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}/refresh`,
    { method: 'POST', body: '{}' },
    hostViewSchema,
  );
}

export function disableHost(id: string): Promise<HostView> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}/disable`,
    { method: 'POST', body: '{}' },
    hostViewSchema,
  );
}

export function enableHost(id: string): Promise<HostView> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}/enable`,
    { method: 'POST', body: '{}' },
    hostViewSchema,
  );
}

export function syncHost(id: string): Promise<{ synced: number }> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}/sync`,
    { method: 'POST', body: '{}' },
    z.strictObject({ synced: z.number().int().nonnegative() }),
  );
}

export function requestHostRemoval(
  id: string,
  justification: string,
): Promise<{ approval: ApprovalView }> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(id)}`,
    { method: 'DELETE', body: JSON.stringify({ justification }) },
    approvalRequestResponseSchema,
  );
}

export function fetchContainers(hostId: string, cursor?: string): Promise<ContainerPage> {
  const params = new URLSearchParams();
  if (cursor !== undefined) params.set('cursor', cursor);
  const query = params.toString();
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/containers${query.length > 0 ? `?${query}` : ''}`,
    {},
    containerListResponseSchema,
  );
}

export function fetchContainer(containerId: string): Promise<ContainerView> {
  return requestAdmin(
    `/containers/${encodeURIComponent(containerId)}`,
    {},
    containerViewResponseSchema,
  ).then((parsed) => parsed.container);
}

export function fetchContainerLogs(
  containerId: string,
  tail = 200,
): Promise<{ log: string; tty: boolean; tail: number }> {
  return requestAdmin(
    `/containers/${encodeURIComponent(containerId)}/logs?tail=${String(tail)}`,
    {},
    containerLogResponseSchema,
  ).then((parsed) => parsed.log);
}

export function startContainer(containerId: string): Promise<ContainerView> {
  return containerAction(containerId, 'start');
}

export function stopContainer(containerId: string): Promise<ContainerView> {
  return containerAction(containerId, 'stop');
}

export function restartContainer(containerId: string): Promise<ContainerView> {
  return containerAction(containerId, 'restart');
}

function containerAction(
  containerId: string,
  action: 'start' | 'stop' | 'restart',
): Promise<ContainerView> {
  return requestAdmin(
    `/containers/${encodeURIComponent(containerId)}/${action}`,
    { method: 'POST', body: '{}' },
    containerActionResponseSchema,
  ).then((parsed) => parsed.container);
}

export function requestContainerRemoval(
  containerId: string,
  justification: string,
): Promise<{ approval: ApprovalView }> {
  return requestAdmin(
    `/containers/${encodeURIComponent(containerId)}`,
    { method: 'DELETE', body: JSON.stringify({ justification }) },
    approvalRequestResponseSchema,
  );
}

export function fetchDockerSummary(): Promise<DockerSummary> {
  return requestAdmin('/docker-summary', {}, dockerSummaryResponseSchema).then(
    (parsed) => parsed.summary,
  );
}

export function fetchContainerStats(containerId: string): Promise<ContainerStats> {
  return requestAdmin(
    `/containers/${encodeURIComponent(containerId)}/stats`,
    {},
    containerStatsResponseSchema,
  ).then((parsed) => parsed.stats);
}

export function runHostDiagnostics(hostId: string): Promise<HostDiagnostics> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/diagnostics`,
    {},
    hostDiagnosticsResponseSchema,
  ).then((parsed) => parsed.diagnostics);
}

export interface ImagePage {
  images: ImageView[];
  nextCursor: string | null;
}

export function fetchImages(hostId: string, cursor?: string): Promise<ImagePage> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/images${query}`,
    {},
    imageListResponseSchema,
  );
}

export function requestImageRemoval(
  hostId: string,
  imageId: string,
  justification: string,
): Promise<{ approval: ApprovalView }> {
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/images`,
    { method: 'DELETE', body: JSON.stringify({ imageId, justification }) },
    approvalRequestResponseSchema,
  );
}

export interface VolumePage {
  volumes: VolumeView[];
  nextCursor: string | null;
}

export function fetchVolumes(hostId: string, cursor?: string): Promise<VolumePage> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/volumes${query}`,
    {},
    volumeListResponseSchema,
  );
}

export interface NetworkPage {
  networks: NetworkView[];
  nextCursor: string | null;
}

export function fetchNetworks(hostId: string, cursor?: string): Promise<NetworkPage> {
  const query = cursor === undefined ? '' : `?cursor=${encodeURIComponent(cursor)}`;
  return requestAdmin(
    `/hosts/${encodeURIComponent(hostId)}/networks${query}`,
    {},
    networkListResponseSchema,
  );
}
