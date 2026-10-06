import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildFindings } from 'src/utils/build-findings.util';

describe('buildFindings', () => {
  it('combines the findings of all checks', () => {
    const findings = buildFindings({
      crawlResult: {
        origin: 'http://example.com',
        pages: [buildCrawledPage({ title: null, structuredDataTypes: [] })],
        linkTargetStatusCodes: {},
        linksByPage: {},
        robotsTxtFound: false,
        sitemapFound: true,
        blockedByRobotsCount: 0,
      },
      assessments: [],
      siteProfile: null,
    });

    expect(findings.map((finding) => finding.ruleId)).toEqual(
      expect.arrayContaining([
        'ROBOTS_TXT_MISSING',
        'TITLE_MISSING',
        'NOT_HTTPS',
        'HOMEPAGE_STRUCTURED_DATA_MISSING',
      ]),
    );
  });
});
