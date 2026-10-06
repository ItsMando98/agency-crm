import { type KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';

export type KeywordCategory =
  (typeof KEYWORD_CATEGORY)[keyof typeof KEYWORD_CATEGORY];
