import { describe, expect, it } from 'vitest';

import { createRateLimiter } from '~/lib/auth/rate-limit.server';

describe('rate limiter', () => {
  it('blocks after the maximum and frees again after the window', () => {
    const limiter = createRateLimiter({ maxAttempts: 2, windowMs: 60_000 });
    const start = new Date('2026-10-10T10:00:00Z');

    expect(limiter.isAllowed('a', start)).toBe(true);
    expect(limiter.isAllowed('a', start)).toBe(true);
    expect(limiter.isAllowed('a', start)).toBe(false);
    expect(limiter.isAllowed('b', start)).toBe(true);
    expect(limiter.isAllowed('a', new Date(start.getTime() + 60_001))).toBe(true);
  });
});
