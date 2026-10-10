type RateLimiterOptions = {
  maxAttempts: number;
  windowMs: number;
};

// In memory on purpose: a restart only resets the counters, which is acceptable
// for a login throttle, and the app has no database of its own.
export const createRateLimiter = ({ maxAttempts, windowMs }: RateLimiterOptions) => {
  const attemptsByKey = new Map<string, number[]>();

  return {
    isAllowed: (key: string, now: Date = new Date()): boolean => {
      const cutoff = now.getTime() - windowMs;
      const recent = (attemptsByKey.get(key) ?? []).filter((time) => time > cutoff);

      if (recent.length >= maxAttempts) {
        attemptsByKey.set(key, recent);

        return false;
      }

      attemptsByKey.set(key, [...recent, now.getTime()]);

      return true;
    },
  };
};
