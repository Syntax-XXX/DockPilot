const cursorMaxLength = 256;

export function encodeCursor(keys: readonly [string, string]): string {
  return Buffer.from(JSON.stringify([keys[0], keys[1]]), 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): [string, string] | undefined {
  if (cursor.length === 0 || cursor.length > cursorMaxLength) return undefined;
  if (!/^[A-Za-z0-9_-]+$/u.test(cursor)) return undefined;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (!Array.isArray(parsed) || parsed.length !== 2) return undefined;
    const first: unknown = parsed[0];
    const second: unknown = parsed[1];
    if (typeof first !== 'string' || typeof second !== 'string') return undefined;
    if (Number.isNaN(Date.parse(first))) return undefined;
    if (second.length === 0 || second.length > 64) return undefined;
    return [first, second];
  } catch {
    return undefined;
  }
}
