import { describe, expect, it } from 'vitest';

import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { type CrawlResult } from 'src/types/crawl-result';
import { type MarketData } from 'src/types/market-data';
import { buildFindings } from 'src/utils/build-findings.util';

const buildCrawlResult = (): CrawlResult => ({
  origin: 'https://example.com',
  pages: [buildCrawledPage()],
  linkTargetStatusCodes: {},
  linksByPage: {},
  robotsTxtFound: true,
  sitemapFound: true,
  blockedByRobotsCount: 0,
});

const buildMarketData = (overrides: Partial<MarketData> = {}): MarketData => ({
  rankings: null,
  backlinks: null,
  backlinkTargets: [],
  competitors: [],
  lighthouse: null,
  costUsd: 0,
  notes: [],
  ...overrides,
});

describe('buildFindings', () => {
  it('adds Core Web Vitals findings from the Lighthouse measurement', () => {
    const findings = buildFindings({
      crawlResult: buildCrawlResult(),
      assessments: [],
      siteProfile: null,
      language: 'DE',
      marketData: buildMarketData({
        lighthouse: {
          url: 'https://example.com/',
          performanceScore: 65,
          largestContentfulPaintMs: 7138,
          cumulativeLayoutShift: 0.01,
          totalBlockingTimeMs: 100,
          fetchedAt: null,
        },
      }),
    });

    expect(findings.map((finding) => finding.ruleId)).toContain('LCP_VERY_SLOW');
  });

  it('adds no Core Web Vitals findings without a Lighthouse measurement', () => {
    const ruleIds = buildFindings({
      crawlResult: buildCrawlResult(),
      assessments: [],
      siteProfile: null,
      language: 'DE',
      marketData: buildMarketData(),
    }).map((finding) => finding.ruleId);

    expect(ruleIds).not.toContain('LCP_SLOW');
    expect(ruleIds).not.toContain('LCP_VERY_SLOW');
  });

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
      language: 'EN',
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
