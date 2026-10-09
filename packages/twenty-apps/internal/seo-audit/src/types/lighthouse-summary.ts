export type LighthouseSummary = {
  url: string;
  // 0 to 100, null when Lighthouse did not report a performance category.
  performanceScore: number | null;
  largestContentfulPaintMs: number | null;
  cumulativeLayoutShift: number | null;
  totalBlockingTimeMs: number | null;
  fetchedAt: string | null;
};
