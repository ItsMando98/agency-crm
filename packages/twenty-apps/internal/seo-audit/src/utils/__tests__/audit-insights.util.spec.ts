import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { type PageAssessment } from 'src/types/page-assessment';
import { buildStrengths } from 'src/utils/build-strengths.util';
import { computeRulesOnlyScore } from 'src/utils/compute-rules-only-score.util';
import { summarizeAssessmentConfidence } from 'src/utils/summarize-assessment-confidence.util';

const assessment = (overrides: Partial<PageAssessment> = {}): PageAssessment => ({
  url: 'https://example.de/a',
  pageType: 'SERVICE',
  searchIntent: 'COMMERCIAL',
  helpfulness: 4,
  specificity: 4,
  trust: 4,
  confidence: 0.9,
  needsReview: false,
  ...overrides,
});

describe('computeRulesOnlyScore', () => {
  it('leaves the judged areas out and shows what the rules alone would give', () => {
    const areaScores = { CRAWLABILITY: 100, SECURITY: 98, ON_PAGE: 90, CONTENT_QUALITY: 40, VISIBILITY: 30 };

    expect(computeRulesOnlyScore(areaScores)).toBeGreaterThan(90);
  });

  it('has no comparison when nothing was judged', () => {
    expect(computeRulesOnlyScore({ CRAWLABILITY: 100, SECURITY: 98 })).toBeNull();
    expect(computeRulesOnlyScore({})).toBeNull();
  });

  it('has no comparison when only judged areas exist', () => {
    expect(computeRulesOnlyScore({ CONTENT_QUALITY: 50 })).toBeNull();
  });
});

describe('summarizeAssessmentConfidence', () => {
  it('counts the share of sure judgements', () => {
    const result = summarizeAssessmentConfidence([
      assessment(),
      assessment(),
      assessment({ needsReview: true, confidence: 0.4 }),
    ]);

    expect(result).toEqual({ total: 3, definitive: 2, sharePercent: 67 });
  });

  it('has no share without judgements', () => {
    expect(summarizeAssessmentConfidence([])).toEqual({ total: 0, definitive: 0, sharePercent: null });
  });
});

describe('buildStrengths', () => {
  const base = {
    areaScores: { CRAWLABILITY: 100, SECURITY: 95, CONTENT_QUALITY: 59 },
    assessments: [assessment(), assessment({ helpfulness: 2 })],
    keywords: [
      buildScoredKeyword({ keyword: 'kündigung', position: 2, searchVolume: 90000, category: 'TOP_3' }),
      buildScoredKeyword({ keyword: 'abfindung', position: 8, searchVolume: 5000, category: 'QUICK_WIN' }),
    ],
    aiReadiness: buildAiReadiness(),
    aiVisibility: null,
  };

  it('lists strong areas, top rankings and good pages from the data', () => {
    const strengths = buildStrengths(base);

    expect(strengths).toContainEqual({
      kind: 'STRONG_AREAS',
      areas: [
        { area: 'CRAWLABILITY', score: 100 },
        { area: 'SECURITY', score: 95 },
      ],
    });
    expect(strengths).toContainEqual({
      kind: 'TOP_RANKINGS',
      count: 1,
      examples: [{ keyword: 'kündigung', position: 2, searchVolume: 90000 }],
    });
    expect(strengths).toContainEqual({ kind: 'HELPFUL_PAGES', count: 1, total: 2 });
  });

  it('names AI presence only when the assistants name the site often enough', () => {
    const low = buildStrengths({ ...base, aiVisibility: buildAiVisibility({ presenceRate: 0.1 }) });
    const high = buildStrengths({ ...base, aiVisibility: buildAiVisibility({ presenceRate: 0.6, queriesTested: 8 }) });

    expect(low.some((strength) => strength.kind === 'AI_PRESENCE')).toBe(false);
    expect(high).toContainEqual({ kind: 'AI_PRESENCE', ratePercent: 60, queriesTested: 8 });
  });

  it('returns nothing for a site without strengths', () => {
    expect(
      buildStrengths({
        areaScores: { CONTENT_QUALITY: 30 },
        assessments: [assessment({ helpfulness: 1 })],
        keywords: [],
        aiReadiness: null,
        aiVisibility: null,
      }),
    ).toEqual([]);
  });
});
