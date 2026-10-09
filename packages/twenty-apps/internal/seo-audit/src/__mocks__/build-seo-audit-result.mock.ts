import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildCrawledPage } from 'src/__mocks__/build-crawled-page.mock';
import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildAuditTasks } from 'src/utils/build-audit-tasks.util';

export const buildSeoAuditResult = (
  overrides: Partial<SeoAuditResult> = {},
): SeoAuditResult => {
  const language = overrides.language ?? 'DE';

  return {
    origin: 'https://www.kanzlei-beispiel.de',
    language,
    generatedAt: '2026-10-06T10:00:00.000Z',
    aiReadiness: buildAiReadiness(),
    score: 84,
    grade: 'B',
    areaScores: {
      CRAWLABILITY: 95,
      ON_PAGE: 76,
      CONTENT_QUALITY: 59,
      SECURITY: 98,
      VISIBILITY: 64,
    },
    pages: [
      buildCrawledPage({ url: 'https://kanzlei-beispiel.de/', title: 'Start' }),
      buildCrawledPage({ url: 'https://kanzlei-beispiel.de/kuendigung', title: 'Kündigung' }),
    ],
    assessments: [
      {
        url: 'https://kanzlei-beispiel.de/kuendigung',
        pageType: 'SERVICE',
        searchIntent: 'COMMERCIAL',
        helpfulness: 2,
        specificity: 3,
        trust: 4,
        confidence: 0.9,
        needsReview: false,
      },
      {
        url: 'https://kanzlei-beispiel.de/unsicher',
        pageType: 'OTHER',
        searchIntent: 'NONE',
        helpfulness: 2,
        specificity: 2,
        trust: 3,
        confidence: 0.4,
        needsReview: true,
      },
    ],
    tasks: buildAuditTasks(
      [
        { ruleId: 'BROKEN_INTERNAL_LINKS', affectedUrls: ['https://kanzlei-beispiel.de/alt'] },
        { ruleId: 'MIXED_CONTENT', affectedUrls: ['https://kanzlei-beispiel.de/', 'https://kanzlei-beispiel.de/a'] },
        {
          ruleId: 'KEYWORD_NEAR_PAGE_ONE',
          affectedUrls: ['https://kanzlei-beispiel.de/kuendigung'],
          count: 2,
          details: ['"kündigungsfrist": position 17, 60000 searches per month'],
        },
        { ruleId: 'ROBOTS_TXT_MISSING', affectedUrls: [] },
      ],
      language,
    ),
    marketData: {
      rankings: {
        totalKeywords: 6500,
        estimatedMonthlyTraffic: 261000,
        positionCounts: { position1: 122, positions2To3: 300, positions4To10: 900, positions11To20: 1200 },
        keywords: [],
      },
      backlinks: { backlinks: 12840, referringDomains: 940, brokenBacklinks: 64, brokenPages: 45, rank: 300 },
      backlinkTargets: [],
      lighthouse: null,
      competitors: [{ domain: 'anwalt-konkurrent.de', commonKeywords: 3400, estimatedTraffic: 480000 }],
      costUsd: 0.31,
      notes: [],
    },
    keywords: [
      buildScoredKeyword({ keyword: 'kündigungsfrist', position: 17, searchVolume: 60000 }),
      buildScoredKeyword({ keyword: 'abfindung berechnen', position: 6, searchVolume: 14000, category: 'QUICK_WIN' }),
      buildScoredKeyword({ keyword: 'wm 2026 spielplan', position: 4, searchVolume: 200000, category: 'NOT_RELEVANT', relevance: 0.01 }),
      buildScoredKeyword({ keyword: 'unklarer begriff', position: 12, searchVolume: 100, category: 'NEEDS_REVIEW', needsReview: true, confidence: 0.4 }),
    ],
    brokenBacklinkTargets: [
      { url: 'https://kanzlei-beispiel.de/alte-seite', backlinks: 31, referringDomains: 12 },
    ],
    reportMarkdown: '# Report',
    ...overrides,
  };
};
