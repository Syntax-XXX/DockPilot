import {
  aiCredentialListResponseSchema,
  approvalDecisionResponseSchema,
  approvalListResponseSchema,
  auditEventListResponseSchema,
  auditEventSchema,
  bootstrapStatusSchema,
  createAiCredentialResponseSchema,
  revokeAiCredentialResponseSchema,
  sessionResponseSchema,
  systemStatusSchema,
  type AiCredentialView,
  type ApprovalView,
  type AuditEvent,
  type AuditEventQuery,
  type CreateAiCredentialInput,
  type LoginInput,
  type SafeUser,
  type SetupAccountInput,
  type SystemStatus,
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
