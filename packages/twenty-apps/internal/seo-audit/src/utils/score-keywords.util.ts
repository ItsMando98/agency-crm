import { type KeywordAssessment } from 'src/types/keyword-assessment';
import { type RankedKeyword } from 'src/types/ranked-keyword';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { categorizeKeyword } from 'src/utils/categorize-keyword.util';

export const scoreKeywords = (
  keywords: RankedKeyword[],
  assessments: KeywordAssessment[],
): ScoredKeyword[] => {
  const assessmentByKeyword = new Map(
    assessments.map((assessment) => [assessment.keyword.toLowerCase(), assessment]),
  );

  return keywords.map((keyword) => {
    const assessment = assessmentByKeyword.get(keyword.keyword.toLowerCase());

    return {
      ...keyword,
      category: categorizeKeyword(keyword.position, assessment),
      relevance: assessment?.relevance ?? null,
      confidence: assessment?.confidence ?? null,
      needsReview: assessment === undefined || assessment.needsReview,
      place: assessment?.place ?? null,
    };
  });
};
