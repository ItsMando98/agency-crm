import { type AiReadiness } from 'src/types/ai-readiness';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AreaScores } from 'src/types/area-scores';
import {
  type AuditInsights,
  type AuditSummary,
  type CompetingPageGroup,
  type MissingLocation,
} from 'src/types/audit-insights';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { buildStrengths } from 'src/utils/build-strengths.util';
import { computeRulesOnlyScore } from 'src/utils/compute-rules-only-score.util';
import { summarizeAssessmentConfidence } from 'src/utils/summarize-assessment-confidence.util';

type BuildAuditInsightsParams = {
  areaScores: AreaScores;
  assessments: PageAssessment[];
  keywords: ScoredKeyword[];
  aiReadiness: AiReadiness | null;
  aiVisibility: AiVisibility | null;
  competingPages?: CompetingPageGroup[];
  missingLocations?: MissingLocation[];
  summary?: AuditSummary | null;
};

export const buildAuditInsights = ({
  areaScores,
  assessments,
  keywords,
  aiReadiness,
  aiVisibility,
  competingPages = [],
  missingLocations = [],
  summary = null,
}: BuildAuditInsightsParams): AuditInsights => ({
  rulesOnlyScore: computeRulesOnlyScore(areaScores),
  confidence: summarizeAssessmentConfidence(assessments),
  strengths: buildStrengths({ areaScores, assessments, keywords, aiReadiness, aiVisibility }),
  competingPages,
  missingLocations,
  summary,
});
