import { describe, expect, it } from 'vitest';

import { runWithConcurrency } from 'src/utils/run-with-concurrency.util';

describe('runWithConcurrency', () => {
  it('keeps the result order of the input items', async () => {
    const results = await runWithConcurrency([30, 5, 15], 2, async (delay) => {
      await new Promise((resolve) => setTimeout(resolve, delay));

      return delay * 2;
    });

    expect(results).toEqual([60, 10, 30]);
  });

  it('never runs more workers than the limit', async () => {
    let running = 0;
    let peak = 0;

    await runWithConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
      running += 1;
      peak = Math.max(peak, running);
      await new Promise((resolve) => setTimeout(resolve, 5));
      running -= 1;
    });

    expect(peak).toBe(2);
  });

  it('returns an empty list for no items', async () => {
    expect(await runWithConcurrency([], 3, async () => 1)).toEqual([]);
  });
});
