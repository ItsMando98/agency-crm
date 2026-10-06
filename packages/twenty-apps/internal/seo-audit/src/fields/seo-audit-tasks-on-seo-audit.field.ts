import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import {
  SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  SEO_AUDIT_TASKS_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/seo-audit-on-seo-audit-task.field';
import { SEO_AUDIT_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit.object';
import { SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/seo-audit-task.object';

export default defineField({
  universalIdentifier: SEO_AUDIT_TASKS_ON_SEO_AUDIT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'seoAuditTasks',
  label: 'Tasks',
  icon: 'IconCheckbox',
  relationTargetObjectMetadataUniversalIdentifier:
    SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SEO_AUDIT_ON_SEO_AUDIT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
