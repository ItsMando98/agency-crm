import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_KEYWORD_OPPORTUNITIES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/seo-audit-on-seo-keyword-opportunity.field';
import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';
import { SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-keyword-opportunity.object';

export default defineField({
  universalIdentifier: SEO_KEYWORD_OPPORTUNITIES_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'seoKeywordOpportunities',
  label: 'Keywords',
  icon: 'IconSearch',
  relationTargetObjectMetadataUniversalIdentifier:
    SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_AUDIT_ON_SEO_KEYWORD_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
