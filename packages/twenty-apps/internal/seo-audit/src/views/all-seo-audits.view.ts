import { defineView, ViewType } from 'twenty-sdk/define';

import { COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/company-on-seo-audit.field';
import {
  SEO_AUDIT_DOMAIN_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_GRADE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_SCORE_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_UNIVERSAL_IDENTIFIER,
} from 'src/objects/seo-audit.object';

export default defineView({
  universalIdentifier: '6da8f2ee-c056-46cf-b3be-a0232bc54cea',
  name: 'All SEO audits',
  objectUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconReportSearch',
  position: 0,
  fields: [
    { universalIdentifier: '0716ac5c-90a4-4bb4-a2ea-9552bb0e3c92', fieldMetadataUniversalIdentifier: SEO_AUDIT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 260 },
    { universalIdentifier: 'c4e5f3ca-b2a6-49a1-b751-e82b0000dc65', fieldMetadataUniversalIdentifier: SEO_AUDIT_DOMAIN_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 220 },
    { universalIdentifier: '455b1f6a-c570-487a-80ee-f7f60c5cb19f', fieldMetadataUniversalIdentifier: COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 200 },
    { universalIdentifier: '2ebf5bec-4dc6-4435-8a31-de45a0f649ed', fieldMetadataUniversalIdentifier: SEO_AUDIT_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 130 },
    { universalIdentifier: '63c66fe3-35bf-4197-bc03-9b424fc741e2', fieldMetadataUniversalIdentifier: SEO_AUDIT_SCORE_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 100 },
    { universalIdentifier: 'a27ef153-d3db-42c9-8de5-e1ca4e714b4f', fieldMetadataUniversalIdentifier: SEO_AUDIT_GRADE_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 90 },
    { universalIdentifier: 'ead02cde-20bc-45cb-8a99-8bb44c0fbed4', fieldMetadataUniversalIdentifier: SEO_AUDIT_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 6, isVisible: true, size: 160 },
  ],
});
