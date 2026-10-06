import { type ScoredKeyword } from 'src/types/scored-keyword';

const RELEVANT_CATEGORIES = ['TOP_3', 'QUICK_WIN', 'NEAR_PAGE_ONE', 'LOW_RANKING'];

const getPositionWeight = (position: number): number => {
  if (position <= 3) {
    return 1;
  }

  if (position <= 10) {
    return 0.7;
  }

  if (position <= 20) {
    return 0.35;
  }

  return position <= 30 ? 0.2 : 0.05;
};

// Volume-weighted ranking quality of the keywords that matter for the business.
// Returns null when no keyword was judged, so the area is left out instead of
// scoring unknown relevance.
export const computeVisibilityScore = (
  keywords: ScoredKeyword[],
): number | null => {
  const judgedKeywords = keywords.filter((keyword) => keyword.relevance !== null);

  if (judgedKeywords.length === 0) {
    return null;
  }

  const relevantKeywords = judgedKeywords.filter((keyword) =>
    RELEVANT_CATEGORIES.includes(keyword.category),
  );
  const totalVolume = relevantKeywords.reduce(
    (sum, keyword) => sum + keyword.searchVolume + 1,
    0,
  );

  if (totalVolume === 0) {
    return 0;
  }

  const weightedVolume = relevantKeywords.reduce(
    (sum, keyword) =>
      sum + (keyword.searchVolume + 1) * getPositionWeight(keyword.position),
    0,
  );

  return (weightedVolume / totalVolume) * 100;
};
