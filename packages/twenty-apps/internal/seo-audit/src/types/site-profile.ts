import { type BusinessModel } from 'src/types/business-model';

export type SiteProfile = {
  businessModel: BusinessModel;
  servesLocalArea: boolean;
  confidence: number;
};
