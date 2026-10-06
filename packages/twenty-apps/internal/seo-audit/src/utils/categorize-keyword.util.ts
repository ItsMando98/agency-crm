import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { KEYWORD_RELEVANCE_THRESHOLD } from 'src/constants/seo-thresholds.const';
import { type KeywordAssessment } from 'src/types/keyword-assessment';
import { type KeywordCategory } from 'src/types/keyword-category';

export const categorizeKeyword = (
  position: number,
  assessment: KeywordAssessment | undefined,
): KeywordCategory => {
  if (assessment === undefined || assessment.needsReview) {
    return KEYWORD_CATEGORY.NEEDS_REVIEW;
  }

  if (assessment.relevance < KEYWORD_RELEVANCE_THRESHOLD) {
    return KEYWORD_CATEGORY.NOT_RELEVANT;
  }

  if (position <= 3) {
    return KEYWORD_CATEGORY.TOP_3;
  }

  if (position <= 10) {
    return KEYWORD_CATEGORY.QUICK_WIN;
  }

  return position <= 30
    ? KEYWORD_CATEGORY.NEAR_PAGE_ONE
    : KEYWORD_CATEGORY.LOW_RANKING;
};
