import { describe, expect, it } from 'vitest';

import { buildLighthouseResult } from 'src/__mocks__/build-lighthouse-result.mock';
import { parseLighthouse } from 'src/utils/parse-lighthouse.util';

const FALLBACK_URL = 'https://fallback.example/';

describe('parseLighthouse', () => {
  it('reads the metrics and scales the performance score to 0-100', () => {
    expect(
      parseLighthouse(
        buildLighthouseResult({
          performanceScore: 0.65,
          largestContentfulPaintMs: 7137.517,
          cumulativeLayoutShift: 0.12345,
          totalBlockingTimeMs: 182,
        }),
        FALLBACK_URL,
      ),
    ).toEqual({
      url: 'https://example.com/',
      performanceScore: 65,
      largestContentfulPaintMs: 7138,
      cumulativeLayoutShift: 0.123,
      totalBlockingTimeMs: 182,
      fetchedAt: '2026-10-08T20:58:44.689Z',
    });
  });

  it('keeps the metrics that are present when one is missing', () => {
    const summary = parseLighthouse(
      buildLighthouseResult({ totalBlockingTimeMs: null, performanceScore: null }),
      FALLBACK_URL,
    );

    expect(summary).toMatchObject({
      performanceScore: null,
      totalBlockingTimeMs: null,
      largestContentfulPaintMs: 1800,
    });
  });

  it('falls back to the requested url and then to the given url', () => {
    expect(
      parseLighthouse(buildLighthouseResult({ finalUrl: null }), FALLBACK_URL)?.url,
    ).toBe('https://example.com/');
    expect(
      parseLighthouse(
        { audits: { 'largest-contentful-paint': { numericValue: 3000 } } },
        FALLBACK_URL,
      )?.url,
    ).toBe(FALLBACK_URL);
  });

  it('returns null when the result is not an object', () => {
    expect(parseLighthouse(null, FALLBACK_URL)).toBeNull();
    expect(parseLighthouse('nope', FALLBACK_URL)).toBeNull();
  });

  it('returns null when Lighthouse measured nothing', () => {
    expect(
      parseLighthouse(
        buildLighthouseResult({
          performanceScore: null,
          largestContentfulPaintMs: null,
          cumulativeLayoutShift: null,
          totalBlockingTimeMs: null,
        }),
        FALLBACK_URL,
      ),
    ).toBeNull();
    expect(parseLighthouse({}, FALLBACK_URL)).toBeNull();
  });
});
