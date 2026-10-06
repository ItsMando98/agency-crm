import { type SeoArea } from 'src/types/seo-area';

export const AREA_WEIGHTS: Record<SeoArea, number> = {
  CRAWLABILITY: 20,
  ON_PAGE: 15,
  CONTENT_QUALITY: 25,
  LINKS: 10,
  STRUCTURED_DATA: 10,
  PERFORMANCE: 10,
  SECURITY: 10,
};

export const SEVERITY_PENALTY = {
  CRITICAL: 30,
  WARNING: 12,
  INFO: 3,
} as const;

// A finding hits at least this share of its penalty even when it touches a
// single page, so one broken template cannot be hidden by a large site.
export const MIN_PENALTY_SHARE = 0.4;

export const GRADE_THRESHOLDS = [
  { minScore: 90, grade: 'A' },
  { minScore: 80, grade: 'B' },
  { minScore: 70, grade: 'C' },
  { minScore: 60, grade: 'D' },
  { minScore: 50, grade: 'E' },
] as const;

export const LOWEST_GRADE = 'F';
