import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';
import { SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit-page.object';

export const SEO_AUDIT_ON_SEO_AUDIT_PAGE_FIELD_UNIVERSAL_IDENTIFIER = '58a099df-e455-4bda-8ead-142ccc437037';
export const SEO_AUDIT_PAGES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER = '2674a054-5c8b-4b08-b8c8-79b7225dc39b';

export default defineField({
  universalIdentifier: SEO_AUDIT_ON_SEO_AUDIT_PAGE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'seoAudit',
  label: 'SEO audit',
  icon: 'IconReportSearch',
  relationTargetObjectMetadataUniversalIdentifier:
    SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_AUDIT_PAGES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'seoAuditId',
  },
});
