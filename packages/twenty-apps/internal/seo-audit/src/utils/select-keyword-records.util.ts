import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import {
  MAX_KEYWORD_RECORDS,
  MAX_NOT_RELEVANT_KEYWORD_RECORDS,
} from 'src/constants/seo-thresholds.const';
import { type ScoredKeyword } from 'src/types/scored-keyword';

const byVolumeDescending = (first: ScoredKeyword, second: ScoredKeyword): number =>
  second.searchVolume - first.searchVolume;

// Keeps the keywords worth looking at plus a few discarded ones, so people can
// see what was filtered out without storing hundreds of rows per audit.
export const selectKeywordRecords = (keywords: ScoredKeyword[]): ScoredKeyword[] => [
  ...keywords
    .filter((keyword) => keyword.category !== KEYWORD_CATEGORY.NOT_RELEVANT)
    .sort(byVolumeDescending)
    .slice(0, MAX_KEYWORD_RECORDS),
  ...keywords
    .filter((keyword) => keyword.category === KEYWORD_CATEGORY.NOT_RELEVANT)
    .sort(byVolumeDescending)
    .slice(0, MAX_NOT_RELEVANT_KEYWORD_RECORDS),
];
