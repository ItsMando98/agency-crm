import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  SEO_AREA,
  SEO_AUDIT_TASK_STATUS,
  SEO_EFFORT,
  SEO_PRIORITY,
  SEO_TASK_SOURCE,
} from 'src/constants/seo-audit.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER = 'c95148f7-8b2a-4cc1-ab6f-b9ac5798b0b5';

export const SEO_AUDIT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'e5536c61-2af2-462b-a3e6-068ff9632711';
export const SEO_AUDIT_TASK_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER = '7421a521-a5fc-416d-bb0e-0a6dddf0bef6';
export const SEO_AUDIT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER = '12a70302-d989-4b9b-b0da-75f2e24f074a';
export const SEO_AUDIT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER = '9eb740b9-2b5f-4b82-b902-fee4be7501b4';
export const SEO_AUDIT_TASK_EFFORT_FIELD_UNIVERSAL_IDENTIFIER = 'b7a136b2-ee7c-4e3a-8603-6f65f691fc75';
export const SEO_AUDIT_TASK_AREA_FIELD_UNIVERSAL_IDENTIFIER = '8d49c4e3-7f0e-4b29-8d2b-1a1e65943e73';
export const SEO_AUDIT_TASK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER = '15d77070-6eba-4a8c-bd4c-e49733490471';
export const SEO_AUDIT_TASK_AFFECTED_URLS_FIELD_UNIVERSAL_IDENTIFIER = '529f43a0-5297-457a-84b1-04895d902649';

export default defineObject({
  universalIdentifier: SEO_AUDIT_TASK_UNIVERSAL_IDENTIFIER,
  nameSingular: 'seoAuditTask',
  namePlural: 'seoAuditTasks',
  labelSingular: 'SEO task',
  labelPlural: 'SEO tasks',
  description: 'An action item from an SEO audit',
  icon: 'IconCheckbox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEO_AUDIT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEO_AUDIT_TASK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Task',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'What is wrong and how to fix it',
      icon: 'IconFileDescription',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${SEO_AUDIT_TASK_STATUS.OPEN}'`,
      options: buildSelectOptions([
        { id: '2bb9daf8-9391-44a0-8e13-691d1f8dced7', value: SEO_AUDIT_TASK_STATUS.OPEN, label: 'Open', color: 'blue' },
        { id: '5e45e2cf-368b-432b-87a2-e0727d3329ca', value: SEO_AUDIT_TASK_STATUS.IN_PROGRESS, label: 'In progress', color: 'purple' },
        { id: '0d9041ee-36d5-4e09-8b92-b7865ac64b71', value: SEO_AUDIT_TASK_STATUS.DONE, label: 'Done', color: 'green' },
        { id: '40e78c55-f5c1-4a3d-bc53-937ac2c900c2', value: SEO_AUDIT_TASK_STATUS.WONT_FIX, label: 'Will not fix', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'priority',
      label: 'Priority',
      icon: 'IconFlag',
      defaultValue: `'${SEO_PRIORITY.MEDIUM}'`,
      options: buildSelectOptions([
        { id: '0b2b1993-83d1-4732-8935-6d9fee8a88ac', value: SEO_PRIORITY.CRITICAL, label: 'Critical', color: 'red' },
        { id: '2d4f21c8-7c02-4d61-9736-269c41a88f3b', value: SEO_PRIORITY.HIGH, label: 'High', color: 'orange' },
        { id: 'c67bc281-34fc-4a94-9b37-1ef5394a3280', value: SEO_PRIORITY.MEDIUM, label: 'Medium', color: 'blue' },
        { id: '3e5618ca-e9aa-430b-86c2-48acda0075b2', value: SEO_PRIORITY.LOW, label: 'Low', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_EFFORT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'effort',
      label: 'Effort',
      icon: 'IconHourglass',
      defaultValue: `'${SEO_EFFORT.MEDIUM}'`,
      options: buildSelectOptions([
        { id: 'bd912b01-1597-42ce-94ed-391f6076b6aa', value: SEO_EFFORT.LOW, label: 'Low', color: 'green' },
        { id: 'c5538c6d-cd21-45a2-819f-86bf95cc02df', value: SEO_EFFORT.MEDIUM, label: 'Medium', color: 'yellow' },
        { id: '02a4c85a-d2db-469f-87a3-b1e479ef48c8', value: SEO_EFFORT.HIGH, label: 'High', color: 'orange' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_AREA_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'area',
      label: 'Area',
      icon: 'IconCategory',
      options: buildSelectOptions([
        { id: 'b6806b7a-04b7-4288-b1a3-b0e89793f31a', value: SEO_AREA.CRAWLABILITY, label: 'Crawlability', color: 'blue' },
        { id: '651ed130-58e5-49aa-968a-0eb308aa2a79', value: SEO_AREA.ON_PAGE, label: 'On-page', color: 'sky' },
        { id: 'b47d7d2c-f485-4eb6-b8be-a5431e084cb6', value: SEO_AREA.CONTENT_QUALITY, label: 'Content quality', color: 'purple' },
        { id: '74c1ba76-9eb1-4f32-8c11-e9bf2d9a9344', value: SEO_AREA.LINKS, label: 'Links', color: 'turquoise' },
        { id: '525b33c2-fd72-4008-91ab-9fcc3c695cb2', value: SEO_AREA.STRUCTURED_DATA, label: 'Structured data', color: 'pink' },
        { id: '53b14c51-faac-4d3b-b356-e212c652d0b0', value: SEO_AREA.PERFORMANCE, label: 'Performance', color: 'orange' },
        { id: '9b6a9fd2-8ed8-45bb-ac1b-ce567bf6c70e', value: SEO_AREA.SECURITY, label: 'Security', color: 'red' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'source',
      label: 'Source',
      description: 'Rule means measured by code, classifier means judged by the model',
      icon: 'IconRuler',
      defaultValue: `'${SEO_TASK_SOURCE.RULE}'`,
      options: buildSelectOptions([
        { id: '1678e039-9994-482a-80b4-3144cfa0add8', value: SEO_TASK_SOURCE.RULE, label: 'Rule', color: 'blue' },
        { id: '74c31dc7-9b33-46b8-b3d7-cea035e6f77c', value: SEO_TASK_SOURCE.CLASSIFIER, label: 'Classifier', color: 'purple' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_TASK_AFFECTED_URLS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'affectedUrls',
      label: 'Affected URLs',
      description: 'One URL per line',
      icon: 'IconLinkOff',
      isNullable: true,
    },
  ],
});
