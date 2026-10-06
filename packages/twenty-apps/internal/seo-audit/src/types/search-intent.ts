import { type SEARCH_INTENT } from 'src/constants/seo-audit.constants';

export type SearchIntent = (typeof SEARCH_INTENT)[keyof typeof SEARCH_INTENT];
