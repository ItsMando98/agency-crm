import { type SEO_TASK_SOURCE } from 'src/constants/seo-audit.constants';

export type SeoTaskSource =
  (typeof SEO_TASK_SOURCE)[keyof typeof SEO_TASK_SOURCE];
