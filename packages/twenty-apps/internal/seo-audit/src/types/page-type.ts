import { type PAGE_TYPE } from 'src/constants/seo-audit.constants';

export type PageType = (typeof PAGE_TYPE)[keyof typeof PAGE_TYPE];
