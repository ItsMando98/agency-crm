import { type KeywordCategory } from 'src/types/keyword-category';
import { type RankedKeyword } from 'src/types/ranked-keyword';

export type ScoredKeyword = RankedKeyword & {
  category: KeywordCategory;
  relevance: number | null;
  confidence: number | null;
  needsReview: boolean;
  place: string | null;
};
