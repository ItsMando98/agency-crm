import { FINDING_CATALOG } from 'src/constants/finding-catalog.const';
import { SEO_AREA } from 'src/constants/seo-audit.constants';
import { type AreaScores } from 'src/types/area-scores';
import { type Finding } from 'src/types/finding';
import { type PageAssessment } from 'src/types/page-assessment';
import { type SeoArea } from 'src/types/seo-area';
import { computeContentQualityScore } from 'src/utils/compute-content-quality-score.util';
import { computeFindingPenalty } from 'src/utils/compute-finding-penalty.util';

type ComputeAreaScoresParams = {
  findings: Finding[];
  assessments: PageAssessment[];
  pageCount: number;
};

const clampScore = (score: number): number =>
  Math.max(0, Math.min(100, Math.round(score)));

export const computeAreaScores = ({
  findings,
  assessments,
  pageCount,
}: ComputeAreaScoresParams): AreaScores => {
  const scores: AreaScores = {};

  for (const area of Object.values(SEO_AREA) as SeoArea[]) {
    // Classifier-based findings are already reflected in the assessment score,
    // so only measured findings reduce it further.
    const penalty = findings
      .filter((finding) => {
        const definition = FINDING_CATALOG[finding.ruleId];

        return definition.area === area && definition.source === 'RULE';
      })
      .reduce((sum, finding) => sum + computeFindingPenalty(finding, pageCount), 0);

    if (area === SEO_AREA.CONTENT_QUALITY) {
      const contentScore = computeContentQualityScore(assessments);

      if (contentScore !== null) {
        scores[area] = clampScore(contentScore - penalty);
      }

      continue;
    }

    scores[area] = clampScore(100 - penalty);
  }

  return scores;
};
