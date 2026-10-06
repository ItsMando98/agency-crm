import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  SEO_AUDIT_LANGUAGE,
  SEO_AUDIT_STATUS,
} from 'src/constants/seo-audit.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const SEO_AUDIT_UNIVERSAL_IDENTIFIER = 'b72492d4-f893-4d43-8c4c-bbccdfa9176d';

export const SEO_AUDIT_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'e69f6c4d-46dd-4b10-aee4-15a66d7a305e';
export const SEO_AUDIT_DOMAIN_FIELD_UNIVERSAL_IDENTIFIER = '3dfb2d16-5d51-4024-a850-2104af6597e0';
export const SEO_AUDIT_STATUS_FIELD_UNIVERSAL_IDENTIFIER = 'ab3a894e-dfee-47dd-a9ca-1e5183505693';
export const SEO_AUDIT_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER = '37cdf23d-e49c-4010-b1da-603ba89f2a9c';
export const SEO_AUDIT_SCORE_FIELD_UNIVERSAL_IDENTIFIER = '96b02e1e-94af-4263-b080-fd46e202401a';
export const SEO_AUDIT_GRADE_FIELD_UNIVERSAL_IDENTIFIER = '3a84be13-19ed-4b88-852b-b8e35e4c5721';
export const SEO_AUDIT_PAGES_CRAWLED_FIELD_UNIVERSAL_IDENTIFIER = '82e5150c-9bde-4496-b04f-1629f6bd0795';
export const SEO_AUDIT_AREA_SCORES_FIELD_UNIVERSAL_IDENTIFIER = '5a834691-0c10-4a62-89e5-0030acf66d54';
export const SEO_AUDIT_REPORT_MARKDOWN_FIELD_UNIVERSAL_IDENTIFIER = 'bb19ce12-d0c8-4aef-a9d3-494c0bdc23ac';
export const SEO_AUDIT_STARTED_AT_FIELD_UNIVERSAL_IDENTIFIER = 'b5386a5e-9b13-4201-a581-230e19bba950';
export const SEO_AUDIT_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER = 'b8efe40f-7fcf-4203-8449-b50cdcbaf4e0';
export const SEO_AUDIT_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER = '91288421-a54e-473d-ba2b-b1483c875e23';

export default defineObject({
  universalIdentifier: SEO_AUDIT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'seoAudit',
  namePlural: 'seoAudits',
  labelSingular: 'SEO audit',
  labelPlural: 'SEO audits',
  description: 'A website SEO audit with score, findings and action list',
  icon: 'IconReportSearch',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEO_AUDIT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEO_AUDIT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Filled automatically with the domain and date',
      icon: 'IconAbc',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_DOMAIN_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'domain',
      label: 'Domain',
      description: 'Homepage URL or domain to audit, for example example.com',
      icon: 'IconWorld',
    },
    {
      universalIdentifier: SEO_AUDIT_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${SEO_AUDIT_STATUS.QUEUED}'`,
      options: buildSelectOptions([
        { id: '3a9a58bf-f55b-4d3f-84e7-d0db6336fbc0', value: SEO_AUDIT_STATUS.QUEUED, label: 'Queued', color: 'blue' },
        { id: 'f0cc033f-29d4-41eb-b4df-040155921e9a', value: SEO_AUDIT_STATUS.RUNNING, label: 'Running', color: 'purple' },
        { id: '462e73eb-96fc-4259-a254-8a33f97b2e63', value: SEO_AUDIT_STATUS.DONE, label: 'Done', color: 'green' },
        { id: '7787e472-4669-4497-8f6a-7b555010017c', value: SEO_AUDIT_STATUS.FAILED, label: 'Failed', color: 'red' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_LANGUAGE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'language',
      label: 'Report language',
      icon: 'IconLanguage',
      defaultValue: `'${SEO_AUDIT_LANGUAGE.DE}'`,
      options: buildSelectOptions([
        { id: '2ee27b38-140f-4a02-a31e-1a45d830032d', value: SEO_AUDIT_LANGUAGE.DE, label: 'German', color: 'yellow' },
        { id: '66e21c29-53e6-44eb-86e0-9072d317f58c', value: SEO_AUDIT_LANGUAGE.EN, label: 'English', color: 'blue' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_SCORE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'score',
      label: 'Score',
      description: 'Overall score from 0 to 100',
      icon: 'IconGauge',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_GRADE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'grade',
      label: 'Grade',
      icon: 'IconAward',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGES_CRAWLED_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'pagesCrawled',
      label: 'Pages crawled',
      icon: 'IconFiles',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_AREA_SCORES_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RAW_JSON,
      name: 'areaScores',
      label: 'Area scores',
      description: 'Score per audit area, keyed by area',
      icon: 'IconChartRadar',
      isNullable: true,
    },
    {
      universalIdentifier:
        SEO_AUDIT_REPORT_MARKDOWN_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'reportMarkdown',
      label: 'Report (Markdown)',
      description: 'Full report an agent can read and work through',
      icon: 'IconFileDescription',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_STARTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'startedAt',
      label: 'Started at',
      icon: 'IconPlayerPlay',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_FINISHED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'finishedAt',
      label: 'Finished at',
      icon: 'IconFlagCheck',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_FAILURE_REASON_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'failureReason',
      label: 'Failure reason',
      icon: 'IconAlertTriangle',
      isNullable: true,
    },
  ],
});
