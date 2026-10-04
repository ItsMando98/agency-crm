import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';
import { APPROVAL_UNIVERSAL_IDENTIFIER } from 'src/objects/approval.object';
import {
  AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVALS_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/agent-task-on-approval.field';

export default defineField({
  universalIdentifier: APPROVALS_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'approvals',
  label: 'Approvals',
  icon: 'IconShieldCheck',
  relationTargetObjectMetadataUniversalIdentifier:
    APPROVAL_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
