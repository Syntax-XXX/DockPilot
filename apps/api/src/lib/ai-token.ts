import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mcpTokenSecret } from './security.js';

export const aiTokenName = 'dpai_';
const aiTokenPattern = /^dpai_[A-Za-z0-9_-]{43}$/u;

export interface GeneratedAiToken {
  token: string;
  tokenPrefix: string;
  tokenHash: string;
}

export function createAiToken(): GeneratedAiToken {
  const token = `${aiTokenName}${randomBytes(32).toString('base64url')}`;
  return { token, tokenPrefix: aiTokenPrefix(token), tokenHash: hashAiToken(token) };
}

export function aiTokenPrefix(token: string): string {
  return token.slice(0, aiTokenName.length + 8);
}

export function isAiTokenShape(token: string): boolean {
  return aiTokenPattern.test(token);
}

export function hashAiToken(token: string): string {
  return createHmac('sha256', mcpTokenSecret).update(token).digest('hex');
}

export function timingSafeHexEqual(first: string, second: string): boolean {
  if (!/^[a-f0-9]{64}$/u.test(first) || !/^[a-f0-9]{64}$/u.test(second)) return false;
  return timingSafeEqual(Buffer.from(first, 'hex'), Buffer.from(second, 'hex'));
}
