import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';

export const COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER = '34c98017-2f56-42c9-84d5-055a1f85e13f';
export const SEO_AUDITS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER = '34cb1cef-fc16-4fee-a52b-fa0d1550af96';

export default defineField({
  universalIdentifier: COMPANY_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_AUDITS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'companyId',
  },
});
