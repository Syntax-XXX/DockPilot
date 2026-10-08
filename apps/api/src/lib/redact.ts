const sensitiveKeyPattern =
  /(password|passphrase|secret|token|authorization|cookie|api[-_]?key|private[-_]?key|credential|hash|signature|session)/iu;

const redactedPlaceholder = '[REDACTED]';

export const auditPayloadByteLimit = 4096;
const maxDepth = 5;
const maxArrayItems = 20;
const maxStringLength = 512;

function redactString(value: string): string {
  return value.length > maxStringLength ? `${value.slice(0, maxStringLength)}[TRUNCATED]` : value;
}

export function redactValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    if (depth >= maxDepth) return `[${String(value.length)} items]`;
    return value.slice(0, maxArrayItems).map((item) => redactValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    if (depth >= maxDepth) return '[MAX DEPTH]';
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      output[key] = sensitiveKeyPattern.test(key)
        ? redactedPlaceholder
        : redactValue(entry, depth + 1);
    }
    return output;
  }
  return undefined;
}

export function redactRecord(input: unknown): Record<string, unknown> | null {
  if (input === null || input === undefined) return null;
  const redacted = redactValue(input);
  if (!redacted || typeof redacted !== 'object' || Array.isArray(redacted)) return null;
  const serialized = JSON.stringify(redacted);
  if (Buffer.byteLength(serialized, 'utf8') <= auditPayloadByteLimit) {
    return redacted as Record<string, unknown>;
  }
  return { truncated: true, byteLength: Buffer.byteLength(serialized, 'utf8') };
}

export function redactText(value: string, limit = 200): string {
  const redacted = sensitiveKeyPattern.test(value) ? redactedPlaceholder : value;
  return redacted.length > limit ? `${redacted.slice(0, limit)}[TRUNCATED]` : redacted;
}
