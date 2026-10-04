import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';
import { APPROVAL_UNIVERSAL_IDENTIFIER } from 'src/objects/approval.object';

export const AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER =
  '060caa74-bae3-4d46-a1fa-f679377b5c23';
export const APPROVALS_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER =
  'd6e6f8d5-a658-4c1a-946f-f84c4293a59f';

export default defineField({
  universalIdentifier: AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'agentTask',
  label: 'Agent task',
  icon: 'IconRobot',
  relationTargetObjectMetadataUniversalIdentifier:
    AGENT_TASK_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    APPROVALS_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'agentTaskId',
  },
});
