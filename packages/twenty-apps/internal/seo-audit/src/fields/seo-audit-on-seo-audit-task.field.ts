import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';
import { SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit-task.object';

export const SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER = '4b11c81e-c584-4818-aa1a-119433b15bed';
export const SEO_AUDIT_TASKS_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER = 'ecabeb19-c479-4b4e-a9fb-2ad1f3f9d91e';

export default defineField({
  universalIdentifier: SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'seoAudit',
  label: 'SEO audit',
  icon: 'IconReportSearch',
  relationTargetObjectMetadataUniversalIdentifier:
    SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_AUDIT_TASKS_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'seoAuditId',
  },
});
