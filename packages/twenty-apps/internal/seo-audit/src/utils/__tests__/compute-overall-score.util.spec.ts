import { describe, expect, it } from 'vitest';

import { computeOverallScore } from 'src/utils/compute-overall-score.util';

describe('computeOverallScore', () => {
  it('returns 0 without areas', () => {
    expect(computeOverallScore({})).toBe(0);
  });

  it('weights areas and renormalizes over the available ones', () => {
    expect(computeOverallScore({ CRAWLABILITY: 100, SECURITY: 50 })).toBe(83);
    expect(
      computeOverallScore({
        CRAWLABILITY: 100,
        ON_PAGE: 100,
        CONTENT_QUALITY: 100,
        LINKS: 100,
        STRUCTURED_DATA: 100,
        PERFORMANCE: 100,
        SECURITY: 100,
      }),
    ).toBe(100);
  });

  it('lets the heavily weighted content quality pull a technically perfect site down', () => {
    const technicallyPerfect = {
      CRAWLABILITY: 100,
      ON_PAGE: 100,
      LINKS: 100,
      STRUCTURED_DATA: 100,
      PERFORMANCE: 100,
      SECURITY: 100,
    };

    expect(computeOverallScore(technicallyPerfect)).toBe(100);
    expect(computeOverallScore({ ...technicallyPerfect, CONTENT_QUALITY: 40 })).toBe(85);
  });
});
