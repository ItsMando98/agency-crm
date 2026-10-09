type LighthouseResultOverrides = {
  performanceScore?: number | null;
  largestContentfulPaintMs?: number | null;
  cumulativeLayoutShift?: number | null;
  totalBlockingTimeMs?: number | null;
  finalUrl?: string | null;
  requestedUrl?: string;
  fetchTime?: string | null;
};

// Same shape as a DataForSEO Lighthouse result, reduced to the audits the app reads.
export const buildLighthouseResult = ({
  performanceScore = 0.9,
  largestContentfulPaintMs = 1800,
  cumulativeLayoutShift = 0.02,
  totalBlockingTimeMs = 90,
  finalUrl = 'https://example.com/',
  requestedUrl = 'https://example.com/',
  fetchTime = '2026-10-08T20:58:44.689Z',
}: LighthouseResultOverrides = {}) => ({
  lighthouseVersion: '13.4.0',
  requestedUrl,
  finalUrl,
  fetchTime,
  categories: { performance: { id: 'performance', score: performanceScore } },
  audits: {
    'largest-contentful-paint': { numericValue: largestContentfulPaintMs, score: 0.5 },
    'cumulative-layout-shift': { numericValue: cumulativeLayoutShift, score: 1 },
    'total-blocking-time': { numericValue: totalBlockingTimeMs, score: 0.9 },
  },
});
