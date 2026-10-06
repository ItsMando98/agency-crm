import { type PageType } from 'src/types/page-type';
import { type SearchIntent } from 'src/types/search-intent';

export type PageAssessment = {
  url: string;
  pageType: PageType;
  searchIntent: SearchIntent;
  helpfulness: number;
  specificity: number;
  trust: number;
  confidence: number;
  needsReview: boolean;
};
