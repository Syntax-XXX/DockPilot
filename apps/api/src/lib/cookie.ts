import type { FastifyReply, FastifyRequest } from 'fastify';
import { cookieName, secureCookies, sessionMaxAgeSeconds } from './security.js';

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

export function readSessionCookie(request: FastifyRequest): string | null {
  const cookies = request.headers.cookie;
  if (!cookies) return null;
  const cookiePattern = new RegExp(
    `(?:^|;\\s*)${escapeRegularExpression(cookieName)}=([^;]*)`,
    'u',
  );
  const match = cookiePattern.exec(cookies);
  return match?.[1] ?? null;
}

export function setSessionCookie(reply: FastifyReply, token: string): void {
  reply.header(
    'Set-Cookie',
    `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${String(sessionMaxAgeSeconds)}${secureCookies ? '; Secure' : ''}`,
  );
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.header(
    'Set-Cookie',
    `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureCookies ? '; Secure' : ''}`,
  );
}
