import { type SEO_AREA } from 'src/constants/seo-audit.constants';

export type SeoArea = (typeof SEO_AREA)[keyof typeof SEO_AREA];
