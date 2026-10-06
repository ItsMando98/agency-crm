import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { checkPerformance } from 'src/utils/check-performance.util';

describe('checkPerformance', () => {
  it('flags pages slower than two seconds', () => {
    expect(
      checkPerformance([
        buildCrawledPage({ url: 'https://example.com/fast', responseTimeMs: 400 }),
        buildCrawledPage({ url: 'https://example.com/slow', responseTimeMs: 2500 }),
      ]),
    ).toEqual([{ ruleId: 'SLOW_PAGES', affectedUrls: ['https://example.com/slow'] }]);
  });

  it('returns nothing when all pages are fast', () => {
    expect(checkPerformance([buildCrawledPage()])).toEqual([]);
  });

  it('ignores slow error pages', () => {
    expect(checkPerformance([buildCrawledPage({ statusCode: 500, responseTimeMs: 9000 })])).toEqual([]);
  });
});
