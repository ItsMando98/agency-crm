import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  AGENT_ROLE,
  AGENT_TASK_STATUS,
} from 'src/constants/agency-ops.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const AGENT_TASK_UNIVERSAL_IDENTIFIER = '312681d6-ccef-46e8-acbd-00fea75f4699';

export const AGENT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'ad09a814-aef1-4feb-a921-509d7c9ee6e9';
export const AGENT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '2a055f52-79d1-49cc-ac90-26afb89b3c27';
export const AGENT_TASK_AGENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER =
  'b3410eff-26f1-4441-8182-f18b26039d66';
export const AGENT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER =
  'fbb5dc5f-9dd0-42bc-ac3f-dfcdfb09e24a';
export const AGENT_TASK_BRIEF_FIELD_UNIVERSAL_IDENTIFIER =
  '2f94b56c-aee4-4545-b524-896292dbf826';
export const AGENT_TASK_RESULT_FIELD_UNIVERSAL_IDENTIFIER =
  'e7a4f23a-6fe1-4956-b63b-6357e055b4cd';
export const AGENT_TASK_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'b675ce82-607b-4037-8d2d-2e4e0176629b';
export const AGENT_TASK_STARTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '91d2d685-92a3-4ebc-aa18-e84e28b9e837';
export const AGENT_TASK_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '1ce7e6c6-69ab-4685-8a0b-81072da0e19d';
export const AGENT_TASK_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER =
  'f97faf4e-57c1-4adb-be28-60ccbbccd699';

export default defineObject({
  universalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
  nameSingular: 'agentTask',
  namePlural: 'agentTasks',
  labelSingular: 'Agent task',
  labelPlural: 'Agent tasks',
  description: 'A unit of work queued for an AI agent',
  icon: 'IconRobot',
  labelIdentifierFieldMetadataUniversalIdentifier:
    AGENT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: AGENT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Short title of the task',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: AGENT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${AGENT_TASK_STATUS.QUEUED}'`,
      options: buildSelectOptions([
        { id: 'ca9d3fa9-bc93-4da0-8859-f80261cd87ad', value: AGENT_TASK_STATUS.QUEUED, label: 'Queued', color: 'blue' },
        { id: '5ab5aa52-2193-4806-bb2d-40fb8e8ccd2e', value: AGENT_TASK_STATUS.RUNNING, label: 'Running', color: 'purple' },
        { id: '92ef5e49-67bf-4411-b89d-91cc6fd6d53f', value: AGENT_TASK_STATUS.WAITING_APPROVAL, label: 'Needs input', color: 'orange' },
        { id: 'eee3b97e-d04a-4fd3-8de5-8da2963ab027', value: AGENT_TASK_STATUS.DONE, label: 'Done', color: 'green' },
        { id: '20c6bbd0-f701-4141-96a5-887e13ff5c2a', value: AGENT_TASK_STATUS.FAILED, label: 'Failed', color: 'red' },
        { id: '3060f4f5-dfd7-4100-b989-f1a7d8466ea3', value: AGENT_TASK_STATUS.CANCELLED, label: 'Cancelled', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: AGENT_TASK_AGENT_ROLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'agentRole',
      label: 'Agent role',
      description: 'Which agent picks this task up',
      icon: 'IconUserCog',
      defaultValue: `'${AGENT_ROLE.ACCOUNT_MANAGER}'`,
      options: buildSelectOptions([
        { id: '8ddcff30-973c-4b8b-a604-b01b389ea691', value: AGENT_ROLE.LEAD_SALES, label: 'Lead and sales', color: 'sky' },
        { id: '06d64760-9303-4901-b2e6-769ef144e0f9', value: AGENT_ROLE.ACCOUNT_MANAGER, label: 'Account manager', color: 'blue' },
        { id: '3be026c8-a258-450e-b669-be21c32384ec', value: AGENT_ROLE.STRATEGIST, label: 'Strategist', color: 'purple' },
        { id: 'a70e9f93-2446-4145-9757-4a64a2f348f1', value: AGENT_ROLE.CONTENT_SEO, label: 'Content and SEO', color: 'green' },
        { id: '4b883f33-7585-4c87-8ad9-35d6631f07b5', value: AGENT_ROLE.PAID_MEDIA, label: 'Paid media', color: 'orange' },
        { id: '275bcb2e-685a-48e3-8849-309560b552f0', value: AGENT_ROLE.WEB_DEV, label: 'Web development', color: 'turquoise' },
        { id: '9af92e7b-84b2-4b85-a3f0-eab83317c8d7', value: AGENT_ROLE.REPORTING, label: 'Reporting', color: 'yellow' },
        { id: '3c9ff101-b9ac-4c36-a8b7-3102cd32fd8f', value: AGENT_ROLE.FINANCE, label: 'Finance', color: 'pink' },
        { id: '883d9b19-c960-4b16-a823-e085ccc13227', value: AGENT_ROLE.QA_SUPERVISOR, label: 'QA and supervisor', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: AGENT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'priority',
      label: 'Priority',
      icon: 'IconFlag',
      defaultValue: `'NORMAL'`,
      options: buildSelectOptions([
        { id: '3b7bb55a-c4e2-4443-aab4-fbf9a5f3387c', value: 'LOW', label: 'Low', color: 'gray' },
        { id: '384b9ba4-8550-4dc7-9c38-659f3518d943', value: 'NORMAL', label: 'Normal', color: 'blue' },
        { id: '434cb5ef-c13c-4cf4-8008-ab9fb51890c2', value: 'HIGH', label: 'High', color: 'orange' },
        { id: '128957d0-b6e2-4fb0-85f1-e0ce24821107', value: 'URGENT', label: 'Urgent', color: 'red' },
      ]),
    },
    {
      universalIdentifier: AGENT_TASK_BRIEF_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'brief',
      label: 'Brief',
      description: 'What the agent should do and the context it needs',
      icon: 'IconFileDescription',
      isNullable: true,
    },
    {
      universalIdentifier: AGENT_TASK_RESULT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'result',
      label: 'Result',
      description: 'What the agent produced',
      icon: 'IconCheckbox',
      isNullable: true,
    },
    {
      universalIdentifier: AGENT_TASK_DUE_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'dueAt',
      label: 'Due at',
      icon: 'IconCalendarDue',
      isNullable: true,
    },
    {
      universalIdentifier: AGENT_TASK_STARTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'startedAt',
      label: 'Started at',
      icon: 'IconPlayerPlay',
      isNullable: true,
    },
    {
      universalIdentifier: AGENT_TASK_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'finishedAt',
      label: 'Finished at',
      icon: 'IconFlagCheck',
      isNullable: true,
    },
    {
      universalIdentifier: AGENT_TASK_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'failureReason',
      label: 'Failure reason',
      icon: 'IconAlertTriangle',
      isNullable: true,
    },
  ],
});
