import { type BusinessModel } from 'src/types/business-model';

export type AiQuerySiteContext = {
  title: string | null;
  metaDescription: string | null;
  businessModel: BusinessModel | null;
  servesLocalArea: boolean | null;
  pageTitles: string[];
};
