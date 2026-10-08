import {
  bootstrapStatusSchema,
  sessionResponseSchema,
  type LoginInput,
  type SafeUser,
  type SetupAccountInput,
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
