import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';
import { SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-keyword-opportunity.object';

export const SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER = 'd4c43f11-3e61-4985-a5e1-13f10d664136';
export const SEO_KEYWORD_OPPORTUNITIES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER = 'e85fe4b1-3c3f-4c4d-aa69-8b93b083f760';

export default defineField({
  universalIdentifier: SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'seoAudit',
  label: 'SEO audit',
  icon: 'IconReportSearch',
  relationTargetObjectMetadataUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_KEYWORD_OPPORTUNITIES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'seoAuditId',
  },
});
