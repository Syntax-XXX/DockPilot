import { DockerApiError, DockerConnectionError, DockerEndpointError } from './docker.js';
import { conflictError, notFoundError, unavailableError, validationError } from './errors.js';

export function translateDockerError(error: unknown): unknown {
  if (error instanceof DockerEndpointError) return validationError(error.message);
  if (error instanceof DockerApiError) {
    if (error.status === 400) return validationError(error.message);
    if (error.status === 404) return notFoundError(error.message);
    if (error.status === 409 || error.status === 304) return conflictError(error.message);
    return unavailableError(error.message);
  }
  if (error instanceof DockerConnectionError) return unavailableError(error.message);
  return error;
}
