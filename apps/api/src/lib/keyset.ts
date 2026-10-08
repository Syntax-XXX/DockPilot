import { sql, type AnyColumn, type SQL } from 'drizzle-orm';

export function keysetAfter(
  timestampColumn: AnyColumn,
  idColumn: AnyColumn,
  cursor: readonly [string, string] | undefined,
): SQL | undefined {
  if (!cursor) return undefined;
  return sql`(${timestampColumn} < ${cursor[0]}::timestamptz OR (${timestampColumn} = ${cursor[0]}::timestamptz AND ${idColumn}::text < ${cursor[1]}))`;
}
