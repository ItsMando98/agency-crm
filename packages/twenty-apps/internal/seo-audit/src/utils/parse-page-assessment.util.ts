import { NEEDS_REVIEW_CONFIDENCE_THRESHOLD } from 'src/constants/seo-thresholds.const';
import { PAGE_TYPE, SEARCH_INTENT } from 'src/constants/seo-audit.constants';
import { type PageAssessment } from 'src/types/page-assessment';
import { type PageType } from 'src/types/page-type';
import { type SearchIntent } from 'src/types/search-intent';

const isPageType = (value: unknown): value is PageType =>
  Object.values(PAGE_TYPE).includes(value as PageType);

const isSearchIntent = (value: unknown): value is SearchIntent =>
  Object.values(SEARCH_INTENT).includes(value as SearchIntent);

const isRating = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;

export const parsePageAssessment = (
  url: string,
  raw: unknown,
): PageAssessment | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const { pageType, searchIntent, helpfulness, specificity, trust, confidence } =
    raw as Record<string, unknown>;

  if (
    !isPageType(pageType) ||
    !isSearchIntent(searchIntent) ||
    !isRating(helpfulness) ||
    !isRating(specificity) ||
    !isRating(trust) ||
    typeof confidence !== 'number' ||
    Number.isNaN(confidence)
  ) {
    return null;
  }

  const clampedConfidence = Math.max(0, Math.min(1, confidence));

  return {
    url,
    pageType,
    searchIntent,
    helpfulness,
    specificity,
    trust,
    confidence: clampedConfidence,
    needsReview: clampedConfidence < NEEDS_REVIEW_CONFIDENCE_THRESHOLD,
  };
};
