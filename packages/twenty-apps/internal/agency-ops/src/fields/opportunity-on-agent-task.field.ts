import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';

export const OPPORTUNITY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER =
  '5ee03e03-c3d2-407f-9bdc-a00b3c5636c4';
export const AGENT_TASKS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER =
  'ca0afe16-392c-4996-a945-02d69847ca0f';

export default defineField({
  universalIdentifier: OPPORTUNITY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Opportunity',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    AGENT_TASKS_ON_OPPORTUNITY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'opportunityId',
  },
});
