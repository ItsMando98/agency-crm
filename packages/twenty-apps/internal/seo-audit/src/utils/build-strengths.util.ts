import { AI_PRESENCE_GOOD_RATE } from 'src/constants/ai-visibility.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AreaScores } from 'src/types/area-scores';
import { type Strength } from 'src/types/audit-insights';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { type SeoArea } from 'src/types/seo-area';

const STRONG_AREA_MIN_SCORE = 90;
const GOOD_RATING_MIN = 4;
const MAX_EXAMPLES = 3;

type BuildStrengthsParams = {
  areaScores: AreaScores;
  assessments: PageAssessment[];
  keywords: ScoredKeyword[];
  aiReadiness: AiReadiness | null;
  aiVisibility: AiVisibility | null;
};

// Only what the data supports. A site without strengths gets an empty list.
export const buildStrengths = ({
  areaScores,
  assessments,
  keywords,
  aiReadiness,
  aiVisibility,
}: BuildStrengthsParams): Strength[] => {
  const strengths: Strength[] = [];

  const strongAreas = (Object.entries(areaScores) as [SeoArea, number][])
    .filter(([, score]) => score >= STRONG_AREA_MIN_SCORE)
    .sort((first, second) => second[1] - first[1])
    .map(([area, score]) => ({ area, score }));

  if (strongAreas.length > 0) {
    strengths.push({ kind: 'STRONG_AREAS', areas: strongAreas });
  }

  const topRankings = keywords
    .filter((keyword) => keyword.category === KEYWORD_CATEGORY.TOP_3)
    .sort((first, second) => second.searchVolume - first.searchVolume);

  if (topRankings.length > 0) {
    strengths.push({
      kind: 'TOP_RANKINGS',
      count: topRankings.length,
      examples: topRankings.slice(0, MAX_EXAMPLES).map((keyword) => ({
        keyword: keyword.keyword,
        position: keyword.position,
        searchVolume: keyword.searchVolume,
      })),
    });
  }

  const helpfulPages = assessments.filter(
    (assessment) =>
      !assessment.needsReview &&
      assessment.helpfulness >= GOOD_RATING_MIN &&
      assessment.specificity >= GOOD_RATING_MIN &&
      assessment.trust >= GOOD_RATING_MIN,
  );

  if (helpfulPages.length > 0) {
    strengths.push({
      kind: 'HELPFUL_PAGES',
      count: helpfulPages.length,
      total: assessments.length,
    });
  }

  if (aiReadiness !== null) {
    const passed: Extract<Strength, { kind: 'AI_READINESS' }>['passed'] = [];

    if (Object.values(aiReadiness.crawlerAccess).every((status) => status === 'ALLOWED')) {
      passed.push('CRAWLERS');
    }

    if (aiReadiness.llmsTxtFound) passed.push('LLMS_TXT');
    if (aiReadiness.organizationSchemaFound) passed.push('ORGANIZATION');
    if (aiReadiness.faqSchemaFound) passed.push('FAQ');

    if (passed.length > 0) {
      strengths.push({ kind: 'AI_READINESS', passed });
    }
  }

  if (
    aiVisibility?.presenceRate !== null &&
    aiVisibility?.presenceRate !== undefined &&
    aiVisibility.presenceRate >= AI_PRESENCE_GOOD_RATE
  ) {
    strengths.push({
      kind: 'AI_PRESENCE',
      ratePercent: Math.round(aiVisibility.presenceRate * 100),
      queriesTested: aiVisibility.queriesTested,
    });
  }

  return strengths;
};
