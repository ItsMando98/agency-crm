import { type SEO_EFFORT } from 'src/constants/seo-audit.constants';

export type SeoEffort = (typeof SEO_EFFORT)[keyof typeof SEO_EFFORT];
