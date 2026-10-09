import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type CrawlResult } from 'src/types/crawl-result';
import { evaluateAiReadiness } from 'src/utils/evaluate-ai-readiness.util';

const buildCrawlResult = (overrides: Partial<CrawlResult> = {}): CrawlResult => ({
  origin: 'https://example.com',
  pages: [buildCrawledPage({ structuredDataTypes: ['Organization'] })],
  linkTargetStatusCodes: {},
  linksByPage: {},
  robotsTxtFound: true,
  robotsTxt: 'User-agent: GPTBot\nDisallow: /',
  llmsTxtFound: true,
  sitemapFound: true,
  blockedByRobotsCount: 0,
  ...overrides,
});

describe('evaluateAiReadiness', () => {
  it('combines crawler access, llms.txt and the markup of the crawled pages', () => {
    const readiness = evaluateAiReadiness(
      buildCrawlResult({
        pages: [
          buildCrawledPage({ structuredDataTypes: ['Organization'] }),
          buildCrawledPage({ url: 'https://example.com/faq', structuredDataTypes: ['FAQPage'] }),
        ],
      }),
    );

    expect(readiness.crawlerAccess.GPTBOT).toBe('BLOCKED');
    expect(readiness.crawlerAccess.CLAUDEBOT).toBe('ALLOWED');
    expect(readiness.llmsTxtFound).toBe(true);
    expect(readiness.organizationSchemaFound).toBe(true);
    expect(readiness.faqSchemaFound).toBe(true);
  });

  it('reports missing llms.txt and markup', () => {
    const readiness = evaluateAiReadiness(
      buildCrawlResult({
        robotsTxt: null,
        robotsTxtFound: false,
        llmsTxtFound: false,
        pages: [buildCrawledPage({ structuredDataTypes: ['BreadcrumbList'] })],
      }),
    );

    expect(Object.values(readiness.crawlerAccess)).toEqual(Array(5).fill('ALLOWED'));
    expect(readiness.llmsTxtFound).toBe(false);
    expect(readiness.organizationSchemaFound).toBe(false);
    expect(readiness.faqSchemaFound).toBe(false);
  });

  it('accepts local business markup as organization markup', () => {
    expect(
      evaluateAiReadiness(
        buildCrawlResult({ pages: [buildCrawledPage({ structuredDataTypes: ['Dentist'] })] }),
      ).organizationSchemaFound,
    ).toBe(true);
  });

  it('only looks at the homepage for the organization markup', () => {
    expect(
      evaluateAiReadiness(
        buildCrawlResult({
          pages: [
            buildCrawledPage({ structuredDataTypes: [] }),
            buildCrawledPage({ url: 'https://example.com/about', structuredDataTypes: ['Organization'] }),
          ],
        }),
      ).organizationSchemaFound,
    ).toBe(false);
  });
});
