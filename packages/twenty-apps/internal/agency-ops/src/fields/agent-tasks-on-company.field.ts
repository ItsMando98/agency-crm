import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  AGENT_TASKS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/fields/company-on-agent-task.field';
import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';

export default defineField({
  universalIdentifier: AGENT_TASKS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'agentTasks',
  label: 'Agent tasks',
  icon: 'IconRobot',
  relationTargetObjectMetadataUniversalIdentifier:
    AGENT_TASK_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMPANY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
