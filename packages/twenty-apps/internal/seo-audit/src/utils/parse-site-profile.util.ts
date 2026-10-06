import { BUSINESS_MODEL } from 'src/constants/seo-audit.constants';
import { type BusinessModel } from 'src/types/business-model';
import { type SiteProfile } from 'src/types/site-profile';

const isBusinessModel = (value: unknown): value is BusinessModel =>
  Object.values(BUSINESS_MODEL).includes(value as BusinessModel);

export const parseSiteProfile = (raw: unknown): SiteProfile | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const { businessModel, servesLocalArea, confidence } = raw as Record<
    string,
    unknown
  >;

  if (
    !isBusinessModel(businessModel) ||
    typeof servesLocalArea !== 'boolean' ||
    typeof confidence !== 'number' ||
    Number.isNaN(confidence)
  ) {
    return null;
  }

  return {
    businessModel,
    servesLocalArea,
    confidence: Math.max(0, Math.min(1, confidence)),
  };
};
