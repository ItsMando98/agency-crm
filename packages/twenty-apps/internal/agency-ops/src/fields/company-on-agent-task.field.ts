import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { AGENT_TASK_UNIVERSAL_IDENTIFIER } from 'src/objects/agent-task.object';

export const COMPANY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER =
  '8d25fd1d-c9da-4781-bb68-1b05da752bcc';
export const AGENT_TASKS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER =
  '5f8cfe64-d7e2-46ad-920a-06230c43d69d';

export default defineField({
  universalIdentifier: COMPANY_ON_AGENT_TASK_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: AGENT_TASK_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Company',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    AGENT_TASKS_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'companyId',
  },
});
