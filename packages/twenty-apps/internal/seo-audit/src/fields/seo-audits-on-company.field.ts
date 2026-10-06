import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDITS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/company-on-seo-audit.field';
import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';

export default defineField({
  universalIdentifier: SEO_AUDITS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'seoAudits',
  label: 'SEO audits',
  icon: 'IconReportSearch',
  relationTargetObjectMetadataUniversalIdentifier:
    SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
