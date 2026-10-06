import { MIN_PAGES_WITHOUT_STRUCTURED_DATA_SHARE } from 'src/constants/seo-thresholds.const';
import { type CrawledPage } from 'src/types/crawled-page';
import { type Finding } from 'src/types/finding';
import { type SiteProfile } from 'src/types/site-profile';
import { isAuditablePage } from 'src/utils/is-auditable-page.util';

const ORGANIZATION_TYPE_PATTERN = /^(Organization|Corporation|WebSite|LocalBusiness)$/;
const LOCAL_BUSINESS_TYPE_PATTERN =
  /(LocalBusiness|Store|Restaurant|Dentist|Physician|Attorney|LegalService|AutoRepair|RealEstateAgent|Plumber|Electrician|Locksmith|MovingCompany|HomeAndConstructionBusiness|HealthAndBeautyBusiness|FoodEstablishment|Hotel|Lodging)/;
const MIN_PROFILE_CONFIDENCE = 0.6;
const MIN_PAGES_FOR_SHARE_CHECK = 3;

export const checkStructuredData = (
  pages: CrawledPage[],
  siteProfile: SiteProfile | null,
): Finding[] => {
  const findings: Finding[] = [];
  const homepage = pages[0];

  if (homepage.structuredDataTypes.length === 0) {
    findings.push({ ruleId: 'HOMEPAGE_STRUCTURED_DATA_MISSING', affectedUrls: [] });
  } else if (
    !homepage.structuredDataTypes.some((type) => ORGANIZATION_TYPE_PATTERN.test(type)) &&
    !homepage.structuredDataTypes.some((type) => LOCAL_BUSINESS_TYPE_PATTERN.test(type))
  ) {
    findings.push({ ruleId: 'ORGANIZATION_SCHEMA_MISSING', affectedUrls: [] });
  }

  const hasLocalBusinessMarkup = pages.some((page) =>
    page.structuredDataTypes.some((type) => LOCAL_BUSINESS_TYPE_PATTERN.test(type)),
  );

  if (
    siteProfile?.servesLocalArea === true &&
    siteProfile.confidence >= MIN_PROFILE_CONFIDENCE &&
    !hasLocalBusinessMarkup
  ) {
    findings.push({ ruleId: 'LOCAL_BUSINESS_SCHEMA_MISSING', affectedUrls: [] });
  }

  const auditablePages = pages.filter(isAuditablePage);
  const pagesWithoutStructuredData = auditablePages
    .filter((page) => page.structuredDataTypes.length === 0)
    .map((page) => page.url);

  if (
    auditablePages.length >= MIN_PAGES_FOR_SHARE_CHECK &&
    pagesWithoutStructuredData.length / auditablePages.length >
      MIN_PAGES_WITHOUT_STRUCTURED_DATA_SHARE
  ) {
    findings.push({
      ruleId: 'PAGES_WITHOUT_STRUCTURED_DATA',
      affectedUrls: pagesWithoutStructuredData,
    });
  }

  return findings;
};
