import type { AuditErrorCategory } from '@dockpilot/shared';

export type AppErrorCode =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'UNAVAILABLE';

const httpStatusByCode: Record<AppErrorCode, number> = {
  AUTHENTICATION: 401,
  AUTHORIZATION: 403,
  VALIDATION: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  UNAVAILABLE: 503,
};

const categoryByCode: Record<AppErrorCode, AuditErrorCategory> = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate_limited',
  INTERNAL: 'internal',
  UNAVAILABLE: 'internal',
};

export interface AppErrorOptions {
  retryAfterSeconds?: number;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly category: AuditErrorCategory;
  readonly retryAfterSeconds: number | undefined;

  constructor(code: AppErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatusByCode[code];
    this.category = categoryByCode[code];
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export function asAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError('INTERNAL', 'The request could not be completed.', { cause: error });
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export const authErrors = {
  missingCredential: () => new AppError('AUTHENTICATION', 'A DockPilot AI credential is required.'),
  invalidCredential: () => new AppError('AUTHENTICATION', 'The AI credential is not valid.'),
  revokedCredential: () => new AppError('AUTHENTICATION', 'The AI credential has been revoked.'),
  expiredCredential: () => new AppError('AUTHENTICATION', 'The AI credential has expired.'),
  disabledCredential: () => new AppError('AUTHENTICATION', 'The AI credential is disabled.'),
};

export const authzErrors = {
  insufficientPermission: (required: string) =>
    new AppError('AUTHORIZATION', `This tool requires the ${required} permission.`),
  roleRequired: () => new AppError('AUTHORIZATION', 'Administrator access is required.'),
  unauthenticated: () => new AppError('AUTHENTICATION', 'Sign in to continue.'),
};

export const validationError = (message: string) => new AppError('VALIDATION', message);
export const notFoundError = (message = 'The requested resource does not exist.') =>
  new AppError('NOT_FOUND', message);
export const conflictError = (message: string) => new AppError('CONFLICT', message);
export const internalError = (message = 'The request could not be completed.', cause?: unknown) =>
  new AppError('INTERNAL', message, { cause });
export const unavailableError = (message: string) => new AppError('UNAVAILABLE', message);
export const rateLimitedError = (retryAfterSeconds: number) =>
  new AppError('RATE_LIMITED', 'Too many requests for this AI credential.', { retryAfterSeconds });
