import type { McpRateCategory } from '@dockpilot/shared';

export interface RateLimitRule {
  max: number;
  windowMs: number;
}

export const mcpRateLimitRules: Record<McpRateCategory, RateLimitRule> = {
  read: { max: 120, windowMs: 60_000 },
  write: { max: 20, windowMs: 60_000 },
  destructive: { max: 5, windowMs: 300_000 },
};

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface WindowState {
  count: number;
  resetAt: number;
}

const stateCeiling = 4096;

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, WindowState>();

  constructor(private readonly rules: Record<string, RateLimitRule>) {}

  check(key: string, category: string): RateLimitDecision {
    const rule = this.rules[category];
    if (!rule) return { allowed: true, remaining: 0, retryAfterSeconds: 0 };
    const now = Date.now();
    if (this.windows.size > stateCeiling) this.prune(now);
    const windowKey = `${category}:${key}`;
    const existing = this.windows.get(windowKey);
    const state =
      existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + rule.windowMs };
    state.count += 1;
    this.windows.set(windowKey, state);
    const allowed = state.count <= rule.max;
    return {
      allowed,
      remaining: Math.max(0, rule.max - state.count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  peek(key: string, category: string): RateLimitDecision {
    const rule = this.rules[category];
    if (!rule) return { allowed: true, remaining: 0, retryAfterSeconds: 0 };
    const now = Date.now();
    const state = this.windows.get(`${category}:${key}`);
    if (!state || state.resetAt <= now) {
      return { allowed: true, remaining: rule.max, retryAfterSeconds: 0 };
    }
    const allowed = state.count < rule.max;
    return {
      allowed,
      remaining: Math.max(0, rule.max - state.count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((state.resetAt - now) / 1000)),
    };
  }

  reset(): void {
    this.windows.clear();
  }

  private prune(now: number): void {
    for (const [key, state] of this.windows) {
      if (state.resetAt <= now) this.windows.delete(key);
    }
  }
}

export const mcpRateLimiter = new FixedWindowRateLimiter(mcpRateLimitRules);

export const mcpAuthenticationRateLimitRule: RateLimitRule = { max: 20, windowMs: 60_000 };

export const mcpAuthenticationRateLimiter = new FixedWindowRateLimiter({
  authentication: mcpAuthenticationRateLimitRule,
});
