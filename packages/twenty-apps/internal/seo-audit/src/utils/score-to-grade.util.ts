import { GRADE_THRESHOLDS, LOWEST_GRADE } from 'src/constants/score-weights.const';

export const scoreToGrade = (score: number): string =>
  GRADE_THRESHOLDS.find(({ minScore }) => score >= minScore)?.grade ??
  LOWEST_GRADE;
