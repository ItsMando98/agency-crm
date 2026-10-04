import { defineObject, FieldType } from 'twenty-sdk/define';

import { APPROVAL_STATUS } from 'src/constants/agency-ops.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const APPROVAL_UNIVERSAL_IDENTIFIER = 'a80b221d-01bb-493f-853d-df5207052dff';

export const APPROVAL_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'be6d2bef-1e1e-46a6-9c8a-ec9fca623fbc';
export const APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '2f34174b-84cc-4ebb-add1-b678227e83ec';
export const APPROVAL_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER =
  '504d64d3-9cc7-4030-9afc-ad4a5c2f311c';
export const APPROVAL_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER =
  '5075d739-cd77-496d-a5a2-c6795d34c379';
export const APPROVAL_PROPOSED_ACTION_FIELD_UNIVERSAL_IDENTIFIER =
  '54446c1f-c9f0-437d-b03f-18a8e3dca78f';
export const APPROVAL_DECISION_NOTE_FIELD_UNIVERSAL_IDENTIFIER =
  'a9530a51-8192-4203-9dff-ae9fbbd1a42c';
export const APPROVAL_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '2cd38589-635d-45d6-9d9c-da6809c780bf';

export default defineObject({
  universalIdentifier: APPROVAL_UNIVERSAL_IDENTIFIER,
  nameSingular: 'approval',
  namePlural: 'approvals',
  labelSingular: 'Approval',
  labelPlural: 'Approvals',
  description: 'A decision an AI agent needs from a human before it continues',
  icon: 'IconShieldCheck',
  labelIdentifierFieldMetadataUniversalIdentifier:
    APPROVAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: APPROVAL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'What needs to be approved',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: APPROVAL_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${APPROVAL_STATUS.PENDING}'`,
      options: buildSelectOptions([
        { id: '362c8e18-526f-4bf1-9b7f-d3f0815096a9', value: APPROVAL_STATUS.PENDING, label: 'Pending', color: 'orange' },
        { id: '4c25210e-1153-46b9-87e1-30092281c7e4', value: APPROVAL_STATUS.APPROVED, label: 'Approved', color: 'green' },
        { id: '07e8cadc-b5fa-41e6-98cb-47f0b8199cd9', value: APPROVAL_STATUS.REJECTED, label: 'Rejected', color: 'red' },
      ]),
    },
    {
      universalIdentifier: APPROVAL_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'category',
      label: 'Category',
      icon: 'IconTag',
      defaultValue: `'OTHER'`,
      options: buildSelectOptions([
        { id: 'ac9216c0-0b92-41e7-a615-6e52b9310904', value: 'CALL', label: 'Call', color: 'sky' },
        { id: '8742454c-2b30-4c75-9490-dd8ed7eafc70', value: 'PAYMENT', label: 'Payment', color: 'red' },
        { id: 'b1563341-e6ca-44d2-8bec-2ff3b73fe658', value: 'CONTRACT', label: 'Contract', color: 'purple' },
        { id: 'b81043c6-c232-4cb3-9d53-97108c6ddcda', value: 'AD_BUDGET', label: 'Ad budget', color: 'orange' },
        { id: 'b7584b9f-dc0c-4d4d-8d4e-b9942a7795d2', value: 'FIRST_CONTACT', label: 'First contact', color: 'blue' },
        { id: 'e127246d-4a1e-4242-ae4b-b855b0a0c1c8', value: 'PUBLISH', label: 'Publish', color: 'green' },
        { id: 'fcbb4d45-639b-48ca-ac76-db98edaa09af', value: 'OTHER', label: 'Other', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: APPROVAL_SUMMARY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'summary',
      label: 'Summary',
      description: 'Why the agent needs a human here',
      icon: 'IconFileDescription',
      isNullable: true,
    },
    {
      universalIdentifier: APPROVAL_PROPOSED_ACTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'proposedAction',
      label: 'Proposed action',
      description: 'Exactly what the agent will do once approved',
      icon: 'IconBolt',
      isNullable: true,
    },
    {
      universalIdentifier: APPROVAL_DECISION_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'decisionNote',
      label: 'Decision note',
      icon: 'IconMessage',
      isNullable: true,
    },
    {
      universalIdentifier: APPROVAL_DECIDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'decidedAt',
      label: 'Decided at',
      icon: 'IconClock',
      isNullable: true,
    },
  ],
});
