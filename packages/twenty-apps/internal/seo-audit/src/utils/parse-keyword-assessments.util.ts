import { NEEDS_REVIEW_CONFIDENCE_THRESHOLD } from 'src/constants/seo-thresholds.const';
import { type KeywordAssessment } from 'src/types/keyword-assessment';
import { asFiniteNumber } from 'src/utils/as-finite-number.util';
import { asRecord } from 'src/utils/as-record.util';

const MAX_PLACE_LENGTH = 60;

const clampToUnit = (value: number): number => Math.max(0, Math.min(1, value));

export const parseKeywordAssessments = (
  raw: unknown,
  keywords: string[],
): KeywordAssessment[] => {
  const items = asRecord(raw)?.keywords;

  if (!Array.isArray(items)) {
    return [];
  }

  const assessmentsByIndex = new Map<number, KeywordAssessment>();

  for (const item of items) {
    const record = asRecord(item);
    const index = asFiniteNumber(record?.index);
    const relevance = asFiniteNumber(record?.relevance);
    const confidence = asFiniteNumber(record?.confidence);

    if (
      index === null ||
      !Number.isInteger(index) ||
      keywords[index] === undefined ||
      relevance === null ||
      confidence === null
    ) {
      continue;
    }

    assessmentsByIndex.set(index, {
      keyword: keywords[index],
      relevance: clampToUnit(relevance),
      confidence: clampToUnit(confidence),
      needsReview: clampToUnit(confidence) < NEEDS_REVIEW_CONFIDENCE_THRESHOLD,
      place: typeof record?.place === 'string' && record.place.trim() !== '' ? record.place.trim().slice(0, MAX_PLACE_LENGTH) : null,
    });
  }

  return [...assessmentsByIndex.values()];
};
