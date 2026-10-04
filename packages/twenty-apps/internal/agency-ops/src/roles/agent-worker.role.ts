import {
  defineRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  AGENT_TASK_UNIVERSAL_IDENTIFIER,
} from 'src/objects/agent-task.object';
import {
  APPROVAL_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_DECISION_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_UNIVERSAL_IDENTIFIER,
} from 'src/objects/approval.object';

export const AGENT_WORKER_ROLE_UNIVERSAL_IDENTIFIER = '990f851b-2e4e-4a46-918a-6b71a5508829';

const readWrite = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

const decisionFieldUniversalIdentifiers = [
  APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_DECISION_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  APPROVAL_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
];

// Workers may raise approvals but never decide them: the decision fields are read-only for this role.
export default defineRole({
  universalIdentifier: AGENT_WORKER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Agent worker',
  description:
    'API key role for AI agent workers. Can work tasks and raise approvals, cannot decide them.',
  icon: 'IconRobot',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: true,
  objectPermissions: [
    { objectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER, ...readWrite },
    { objectUniversalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER, ...readWrite },
    ...(['company', 'person', 'opportunity', 'note', 'task'] as const).map(
      (standardObject) => ({
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[standardObject]
            .universalIdentifier,
        ...readWrite,
      }),
    ),
  ],
  fieldPermissions: decisionFieldUniversalIdentifiers.map(
    (fieldUniversalIdentifier) => ({
      objectUniversalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier,
      canReadFieldValue: true,
      canUpdateFieldValue: false,
    }),
  ),
});
