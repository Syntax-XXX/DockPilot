import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { AppError } from '../lib/errors.js';

export function successResult(output: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
  };
}

export function errorResult(error: AppError): CallToolResult {
  return {
    content: [{ type: 'text', text: `${error.category}: ${error.message}` }],
    isError: true,
  };
}
