import { type BUSINESS_MODEL } from 'src/constants/seo-audit.constants';

export type BusinessModel =
  (typeof BUSINESS_MODEL)[keyof typeof BUSINESS_MODEL];
