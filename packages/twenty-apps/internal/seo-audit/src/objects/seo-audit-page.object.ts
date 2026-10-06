import { defineObject, FieldType } from 'twenty-sdk/define';

import { PAGE_TYPE, SEARCH_INTENT } from 'src/constants/seo-audit.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER = 'e516ade1-a5e0-45ec-8ea7-342cdcb1f3dd';

export const SEO_AUDIT_PAGE_URL_FIELD_UNIVERSAL_IDENTIFIER = 'cfa0eed7-5e84-4380-826d-991447348867';
export const SEO_AUDIT_PAGE_STATUS_CODE_FIELD_UNIVERSAL_IDENTIFIER = '1f860949-0f81-49f7-a56a-b1cd6670eccf';
export const SEO_AUDIT_PAGE_RESPONSE_TIME_FIELD_UNIVERSAL_IDENTIFIER = 'a802fecd-a341-403a-a895-a1b1f6000a08';
export const SEO_AUDIT_PAGE_TITLE_FIELD_UNIVERSAL_IDENTIFIER = 'cc8d4d68-3a31-4c8d-867e-39b43252d390';
export const SEO_AUDIT_PAGE_WORD_COUNT_FIELD_UNIVERSAL_IDENTIFIER = '6baf70e8-ec1d-4d31-b271-9a938825f380';
export const SEO_AUDIT_PAGE_PAGE_TYPE_FIELD_UNIVERSAL_IDENTIFIER = '2a4c4093-588a-4ba5-a0d0-e3c0d0403184';
export const SEO_AUDIT_PAGE_SEARCH_INTENT_FIELD_UNIVERSAL_IDENTIFIER = '44b72b88-17fc-490c-88a0-d6460b1b662f';
export const SEO_AUDIT_PAGE_HELPFULNESS_FIELD_UNIVERSAL_IDENTIFIER = '426c544c-d579-47f1-8738-8656dc726c3b';
export const SEO_AUDIT_PAGE_SPECIFICITY_FIELD_UNIVERSAL_IDENTIFIER = 'fd54c772-37e6-45b2-9129-fcf4e37f2577';
export const SEO_AUDIT_PAGE_TRUST_FIELD_UNIVERSAL_IDENTIFIER = '0414fd85-d375-4a47-9179-9c4c142da4ea';
export const SEO_AUDIT_PAGE_CONFIDENCE_FIELD_UNIVERSAL_IDENTIFIER = '00db1469-1954-4fad-8bbd-e63b9f3d4ca6';
export const SEO_AUDIT_PAGE_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER = 'f42819cc-92e8-40fd-937e-e474103121aa';

export default defineObject({
  universalIdentifier: SEO_AUDIT_PAGE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'seoAuditPage',
  namePlural: 'seoAuditPages',
  labelSingular: 'SEO audit page',
  labelPlural: 'SEO audit pages',
  description: 'One crawled page of an SEO audit with its metrics and assessment',
  icon: 'IconFileSearch',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEO_AUDIT_PAGE_URL_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEO_AUDIT_PAGE_URL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'url',
      label: 'URL',
      icon: 'IconLink',
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_STATUS_CODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'statusCode',
      label: 'Status code',
      icon: 'IconHttpGet',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_RESPONSE_TIME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'responseTimeMs',
      label: 'Response time (ms)',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'title',
      label: 'Title',
      icon: 'IconHeading',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_WORD_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'wordCount',
      label: 'Word count',
      icon: 'IconTextSize',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_PAGE_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'pageType',
      label: 'Page type',
      icon: 'IconCategory',
      isNullable: true,
      options: buildSelectOptions([
        { id: '40e0ff45-80f1-41ec-b531-90d0a430ebd2', value: PAGE_TYPE.HOME, label: 'Home', color: 'blue' },
        { id: 'ad9f1a3f-b5a7-4a0c-920e-7c9b289e3591', value: PAGE_TYPE.SERVICE, label: 'Service', color: 'green' },
        { id: 'ed4ac426-66ba-44e3-8209-c4064a714cc8', value: PAGE_TYPE.PRODUCT, label: 'Product', color: 'turquoise' },
        { id: '2d8fc32e-babe-48e5-b433-9814ef3a8d13', value: PAGE_TYPE.CATEGORY, label: 'Category', color: 'sky' },
        { id: 'dceaa0dc-e8c9-40ce-9597-968210635e0f', value: PAGE_TYPE.ARTICLE, label: 'Article', color: 'purple' },
        { id: 'b611c0dd-a072-423a-a8d1-b1d9a9bb202b', value: PAGE_TYPE.ABOUT, label: 'About', color: 'pink' },
        { id: '5aaa9bbf-192f-4ba0-80b5-d1e7bcc445bf', value: PAGE_TYPE.CONTACT, label: 'Contact', color: 'orange' },
        { id: '2451ecbe-9e38-4fa9-b365-607a32ca622f', value: PAGE_TYPE.LEGAL, label: 'Legal', color: 'gray' },
        { id: '59ed6f59-fabc-4f17-abe4-19f479657c01', value: PAGE_TYPE.LANDING, label: 'Landing page', color: 'yellow' },
        { id: '84e94c0d-c1be-4c84-8d8f-dd80a352fe21', value: PAGE_TYPE.OTHER, label: 'Other', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_SEARCH_INTENT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'searchIntent',
      label: 'Search intent',
      icon: 'IconTargetArrow',
      isNullable: true,
      options: buildSelectOptions([
        { id: '5995424f-58a0-49bf-8594-3581945e5542', value: SEARCH_INTENT.INFORMATIONAL, label: 'Informational', color: 'sky' },
        { id: 'dce7cd78-1fd6-4f6c-9790-4defb74ad7d1', value: SEARCH_INTENT.COMMERCIAL, label: 'Commercial', color: 'purple' },
        { id: 'b9fe9fac-7e96-40ee-afab-ad46cfe9274c', value: SEARCH_INTENT.TRANSACTIONAL, label: 'Transactional', color: 'green' },
        { id: '0b8352e6-006a-4bf4-9f7e-72578be4547b', value: SEARCH_INTENT.NAVIGATIONAL, label: 'Navigational', color: 'blue' },
        { id: 'dec8ebe4-4e61-427d-b132-659f690770f5', value: SEARCH_INTENT.NONE, label: 'None', color: 'gray' },
      ]),
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_HELPFULNESS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'helpfulness',
      label: 'Helpfulness (1-5)',
      icon: 'IconThumbUp',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_SPECIFICITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'specificity',
      label: 'Specificity (1-5)',
      icon: 'IconZoomScan',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_TRUST_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'trust',
      label: 'Trust (1-5)',
      icon: 'IconShieldCheck',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_CONFIDENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'confidence',
      label: 'Confidence (0-1)',
      description: 'Self-reported confidence of the classifier',
      icon: 'IconPercentage',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_AUDIT_PAGE_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'needsReview',
      label: 'Needs review',
      description: 'The classifier was unsure, check this page manually',
      icon: 'IconEyeCheck',
      defaultValue: false,
    },
  ],
});
