import { defineView, ViewType } from 'twenty-sdk/define';

import { OPPORTUNITY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/opportunity-on-agent-task.field';
import {
  AGENT_TASK_AGENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
  AGENT_TASK_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER,
  AGENT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  AGENT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
  AGENT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  AGENT_TASK_UNIVERSAL_IDENTIFIER,
} from 'src/objects/agent-task.object';

export default defineView({
  universalIdentifier: '0357c60b-96cb-45d7-a488-a660346574a1',
  name: 'All agent tasks',
  objectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconRobot',
  position: 0,
  fields: [
    { universalIdentifier: 'e1a0b2c4-952c-4bf2-88c5-1cc546a4d821', fieldMetadataUniversalIdentifier: AGENT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 280 },
    { universalIdentifier: '9f9c7821-e285-4129-a4b9-5b879d956ff2', fieldMetadataUniversalIdentifier: AGENT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: '7f3d47ca-8f6a-4448-bc34-6614abcb8e15', fieldMetadataUniversalIdentifier: AGENT_TASK_AGENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 170 },
    { universalIdentifier: '3f97d000-c33f-468f-b563-72e1e7ce5036', fieldMetadataUniversalIdentifier: AGENT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 110 },
    { universalIdentifier: 'cf4bbb9b-0f44-46ac-a73b-80dbd4d94e6a', fieldMetadataUniversalIdentifier: OPPORTUNITY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 200 },
    { universalIdentifier: 'cb50445d-7ccf-4fa3-8bbd-d503c9ecdf2d', fieldMetadataUniversalIdentifier: AGENT_TASK_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 5, isVisible: true, size: 150 },
  ],
});
