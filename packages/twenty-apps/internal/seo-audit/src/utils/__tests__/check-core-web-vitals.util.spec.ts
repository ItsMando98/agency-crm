import { describe, expect, it } from 'vitest';

import { type LighthouseSummary } from 'src/types/lighthouse-summary';
import { checkCoreWebVitals } from 'src/utils/check-core-web-vitals.util';

const buildSummary = (overrides: Partial<LighthouseSummary> = {}): LighthouseSummary => ({
  url: 'https://example.com/',
  performanceScore: 90,
  largestContentfulPaintMs: 1800,
  cumulativeLayoutShift: 0.02,
  totalBlockingTimeMs: 90,
  fetchedAt: '2026-10-08T20:58:44.689Z',
  ...overrides,
});

describe('checkCoreWebVitals', () => {
  it('returns nothing when all measured values are good', () => {
    expect(checkCoreWebVitals({ lighthouse: buildSummary(), language: 'DE' })).toEqual([]);
  });

  it('returns nothing without a Lighthouse measurement', () => {
    expect(checkCoreWebVitals({ lighthouse: null, language: 'DE' })).toEqual([]);
  });

  it('warns when the largest contentful paint needs improvement', () => {
    expect(
      checkCoreWebVitals({
        lighthouse: buildSummary({ largestContentfulPaintMs: 3000 }),
        language: 'DE',
      }),
    ).toEqual([
      {
        ruleId: 'LCP_SLOW',
        affectedUrls: [],
        details: ['https://example.com/: LCP 3,0 s (Ziel: unter 2,5 s)'],
      },
    ]);
  });

  it('reports a very slow largest contentful paint instead of the milder rule', () => {
    const findings = checkCoreWebVitals({
      lighthouse: buildSummary({ largestContentfulPaintMs: 7138 }),
      language: 'EN',
    });

    expect(findings).toEqual([
      {
        ruleId: 'LCP_VERY_SLOW',
        affectedUrls: [],
        details: ['https://example.com/: LCP 7.1 s (target: under 2.5 s)'],
      },
    ]);
  });

  it('does not flag values exactly on the threshold', () => {
    expect(
      checkCoreWebVitals({
        lighthouse: buildSummary({
          largestContentfulPaintMs: 2500,
          cumulativeLayoutShift: 0.1,
          totalBlockingTimeMs: 200,
        }),
        language: 'DE',
      }),
    ).toEqual([]);
  });

  it('flags layout shift and blocking time', () => {
    const findings = checkCoreWebVitals({
      lighthouse: buildSummary({ cumulativeLayoutShift: 0.15, totalBlockingTimeMs: 350 }),
      language: 'DE',
    });

    expect(findings.map((finding) => finding.ruleId)).toEqual(['CLS_HIGH', 'TBT_HIGH']);
    expect(findings[0].details).toEqual(['https://example.com/: CLS 0,15 (Ziel: unter 0,1)']);
    expect(findings[1].details).toEqual(['https://example.com/: TBT 350 ms (Ziel: unter 200 ms)']);
  });

  it('skips metrics Lighthouse did not report', () => {
    expect(
      checkCoreWebVitals({
        lighthouse: buildSummary({
          largestContentfulPaintMs: null,
          cumulativeLayoutShift: null,
          totalBlockingTimeMs: 400,
        }),
        language: 'DE',
      }).map((finding) => finding.ruleId),
    ).toEqual(['TBT_HIGH']);
  });
});
