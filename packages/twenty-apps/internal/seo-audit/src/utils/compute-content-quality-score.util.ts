import { type PageAssessment } from 'src/types/page-assessment';

const HELPFULNESS_WEIGHT = 0.5;
const SPECIFICITY_WEIGHT = 0.25;
const TRUST_WEIGHT = 0.25;
const MIN_RATING = 1;
const RATING_RANGE = 4;

export const computeContentQualityScore = (
  assessments: PageAssessment[],
): number | null => {
  if (assessments.length === 0) {
    return null;
  }

  const total = assessments.reduce((sum, assessment) => {
    const weightedRating =
      assessment.helpfulness * HELPFULNESS_WEIGHT +
      assessment.specificity * SPECIFICITY_WEIGHT +
      assessment.trust * TRUST_WEIGHT;

    return sum + ((weightedRating - MIN_RATING) / RATING_RANGE) * 100;
  }, 0);

  return total / assessments.length;
};
