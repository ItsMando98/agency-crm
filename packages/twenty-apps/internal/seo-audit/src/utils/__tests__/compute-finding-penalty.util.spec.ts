import { describe, expect, it } from 'vitest';

import { computeFindingPenalty } from 'src/utils/compute-finding-penalty.util';

const urls = (count: number) =>
  Array.from({ length: count }, (_, index) => `https://example.com/${index}`);

describe('computeFindingPenalty', () => {
  it('applies the full penalty to site-wide findings', () => {
    expect(computeFindingPenalty({ ruleId: 'NOT_HTTPS', affectedUrls: [] }, 10)).toBe(30);
  });

  it('scales page findings by the share of affected pages', () => {
    const all = computeFindingPenalty({ ruleId: 'TITLE_MISSING', affectedUrls: urls(10) }, 10);
    const one = computeFindingPenalty({ ruleId: 'TITLE_MISSING', affectedUrls: urls(1) }, 10);

    expect(all).toBe(12);
    expect(one).toBeCloseTo(12 * (0.4 + 0.6 * 0.1));
  });

  it('never exceeds the base penalty', () => {
    expect(computeFindingPenalty({ ruleId: 'TITLE_MISSING', affectedUrls: urls(20) }, 10)).toBe(12);
  });

  it('uses lower penalties for info findings', () => {
    expect(computeFindingPenalty({ ruleId: 'ROBOTS_TXT_MISSING', affectedUrls: [] }, 10)).toBe(3);
  });
});
