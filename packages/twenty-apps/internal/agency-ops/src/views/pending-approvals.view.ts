import { defineView, ViewFilterOperand, ViewType } from 'twenty-sdk/define';

import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';
import { AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/agent-task-on-approval.field';
import {
  APPROVAL_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_UNIVERSAL_IDENTIFIER,
} from 'src/objects/approval.object';

export default defineView({
  universalIdentifier: 'cb053b7d-e8e3-4469-b2af-40500f35985f',
  name: 'Pending approvals',
  objectUniversalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconShieldCheck',
  position: 0,
  fields: [
    { universalIdentifier: '601ebb93-91af-423f-9e9a-76338a279ed3', fieldMetadataUniversalIdentifier: APPROVAL_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 280 },
    { universalIdentifier: '0b8232c6-52d0-4f23-a2e4-1e25046b3047', fieldMetadataUniversalIdentifier: APPROVAL_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: 'b8799f20-f194-4f94-a195-4baa160f1e8c', fieldMetadataUniversalIdentifier: AGENT_TASK_ON_APPROVAL_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 220 },
    { universalIdentifier: '23c7c776-fe04-487b-ac53-b8b8316e8179', fieldMetadataUniversalIdentifier: APPROVAL_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 320 },
    { universalIdentifier: '3c05c0ce-1492-4768-a25a-bda424ba4a75', fieldMetadataUniversalIdentifier: APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true, size: 120 },
  ],
  filters: [
    {
      universalIdentifier: 'a6200e29-8839-4f08-a0b3-3f3eaf2b766a',
      fieldMetadataUniversalIdentifier: APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: [APPROVAL_STATUS.PENDING],
    },
  ],
});
