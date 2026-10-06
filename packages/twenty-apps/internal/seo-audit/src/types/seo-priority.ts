import { type SEO_PRIORITY } from 'src/constants/seo-audit.constants';

export type SeoPriority = (typeof SEO_PRIORITY)[keyof typeof SEO_PRIORITY];
