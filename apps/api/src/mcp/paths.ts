export const mcpPath = '/api/v1/mcp';

export function isMcpRequestUrl(url: string): boolean {
  return url === mcpPath || url.startsWith(`${mcpPath}?`);
}
