import { describe, expect, it } from 'vitest';
import { DockerEndpointError, parseDockerEndpoint } from '../../src/lib/docker.js';

const allowlisted = process.env.DOCKPILOT_DOCKER_SOCKETS;
if (allowlisted === undefined) {
  throw new Error('DOCKPILOT_DOCKER_SOCKETS must be set by the test setup file.');
}

describe('parseDockerEndpoint allowlist', () => {
  it('accepts an allowlisted unix socket endpoint', () => {
    const parsed = parseDockerEndpoint(`unix://${allowlisted}`);
    expect(parsed.kind).toBe('unix');
    expect(parsed.socketPath).toBe(allowlisted);
  });

  it('rejects unix sockets outside the allowlist', () => {
    expect(() => parseDockerEndpoint('unix:///tmp/dockpilot-not-allowlisted.sock')).toThrow(
      DockerEndpointError,
    );
  });

  it('rejects non-unix transport schemes', () => {
    for (const endpoint of [
      'tcp://127.0.0.1:2375',
      'http://127.0.0.1:2375',
      'npipe:////./pipe/docker',
    ]) {
      expect(() => parseDockerEndpoint(endpoint)).toThrow(DockerEndpointError);
    }
  });

  it('rejects malformed endpoints', () => {
    for (const endpoint of ['unix://', 'unix:///', 'docker.sock', '']) {
      expect(() => parseDockerEndpoint(endpoint)).toThrow(DockerEndpointError);
    }
  });
});
