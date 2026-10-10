import { type AssessmentConfidence } from 'src/types/audit-insights';
import { type PageAssessment } from 'src/types/page-assessment';

export const summarizeAssessmentConfidence = (
  assessments: PageAssessment[],
): AssessmentConfidence => {
  const definitive = assessments.filter((assessment) => !assessment.needsReview).length;

  return {
    total: assessments.length,
    definitive,
    sharePercent:
      assessments.length === 0 ? null : Math.round((definitive / assessments.length) * 100),
  };
};
