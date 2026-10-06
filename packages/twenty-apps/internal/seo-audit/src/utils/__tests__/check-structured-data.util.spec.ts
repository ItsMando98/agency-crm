import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { checkStructuredData } from 'src/utils/check-structured-data.util';

const LOCAL_PROFILE = { businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.9 } as const;

const ruleIds = (...args: Parameters<typeof checkStructuredData>) =>
  checkStructuredData(...args).map((finding) => finding.ruleId);

describe('checkStructuredData', () => {
  it('passes a homepage with LocalBusiness markup', () => {
    expect(ruleIds([buildCrawledPage()], LOCAL_PROFILE)).toEqual([]);
  });

  it('flags a homepage without any structured data', () => {
    expect(ruleIds([buildCrawledPage({ structuredDataTypes: [] })], null)).toContain(
      'HOMEPAGE_STRUCTURED_DATA_MISSING',
    );
  });

  it('flags structured data that lacks an organization type', () => {
    expect(ruleIds([buildCrawledPage({ structuredDataTypes: ['BreadcrumbList'] })], null)).toEqual([
      'ORGANIZATION_SCHEMA_MISSING',
    ]);
  });

  it('flags a local business without LocalBusiness markup, like the tile retailer in the video', () => {
    expect(
      ruleIds([buildCrawledPage({ structuredDataTypes: ['Organization'] })], LOCAL_PROFILE),
    ).toEqual(['LOCAL_BUSINESS_SCHEMA_MISSING']);
  });

  it('does not act on an unsure site profile', () => {
    expect(
      ruleIds(
        [buildCrawledPage({ structuredDataTypes: ['Organization'] })],
        { ...LOCAL_PROFILE, confidence: 0.4 },
      ),
    ).toEqual([]);
  });

  it('flags a site where most pages have no structured data', () => {
    const pages = [
      buildCrawledPage(),
      buildCrawledPage({ url: 'https://example.com/a', structuredDataTypes: [] }),
      buildCrawledPage({ url: 'https://example.com/b', structuredDataTypes: [] }),
    ];

    expect(ruleIds(pages, null)).toEqual(['PAGES_WITHOUT_STRUCTURED_DATA']);
  });
});
