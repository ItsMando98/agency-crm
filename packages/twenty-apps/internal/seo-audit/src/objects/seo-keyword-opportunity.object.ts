import { defineObject, FieldType } from 'twenty-sdk/define';

import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { buildSelectOptions } from 'src/utils/build-select-options';

export const SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER = '57318c46-772e-4896-94a9-f3b9c5e91e1e';

export const SEO_KEYWORD_OPPORTUNITY_KEYWORD_FIELD_UNIVERSAL_IDENTIFIER = 'f54066cb-f668-4bbf-a655-435d3fb77828';
export const SEO_KEYWORD_OPPORTUNITY_POSITION_FIELD_UNIVERSAL_IDENTIFIER = '4d62469f-7533-4515-bbeb-3ad139f2ff46';
export const SEO_KEYWORD_OPPORTUNITY_SEARCH_VOLUME_FIELD_UNIVERSAL_IDENTIFIER = '4216dc24-75b0-4da4-913c-e0375de31584';
export const SEO_KEYWORD_OPPORTUNITY_ESTIMATED_TRAFFIC_FIELD_UNIVERSAL_IDENTIFIER = 'fd9d0e1d-d7ce-4bd0-96c0-ff59a21a8552';
export const SEO_KEYWORD_OPPORTUNITY_URL_FIELD_UNIVERSAL_IDENTIFIER = '290466eb-dfe1-4fef-9e22-4ae63a585dda';
export const SEO_KEYWORD_OPPORTUNITY_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER = '2463730b-d517-4d1a-a41b-155cacec52a4';
export const SEO_KEYWORD_OPPORTUNITY_RELEVANCE_FIELD_UNIVERSAL_IDENTIFIER = 'c22f5a69-de6d-483e-821a-8a40504a8331';
export const SEO_KEYWORD_OPPORTUNITY_CONFIDENCE_FIELD_UNIVERSAL_IDENTIFIER = '76d7047a-7268-4fd9-9d63-5cf8db79126b';
export const SEO_KEYWORD_OPPORTUNITY_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER = 'ed75dca7-87ed-4978-aaf1-2b8087d1ea84';

export default defineObject({
  universalIdentifier: SEO_KEYWORD_OPPORTUNITY_UNIVERSAL_IDENTIFIER,
  nameSingular: 'seoKeywordOpportunity',
  namePlural: 'seoKeywordOpportunities',
  labelSingular: 'SEO keyword',
  labelPlural: 'SEO keywords',
  description: 'A keyword the audited website ranks for, judged for relevance',
  icon: 'IconSearch',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SEO_KEYWORD_OPPORTUNITY_KEYWORD_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_KEYWORD_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'keyword',
      label: 'Keyword',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_POSITION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'rankPosition',
      label: 'Position',
      icon: 'IconListNumbers',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_SEARCH_VOLUME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'searchVolume',
      label: 'Searches per month',
      icon: 'IconChartBar',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_ESTIMATED_TRAFFIC_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'estimatedTraffic',
      label: 'Estimated visitors',
      icon: 'IconUsers',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_URL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'url',
      label: 'Ranking page',
      icon: 'IconLink',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_CATEGORY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'category',
      label: 'Category',
      icon: 'IconCategory',
      options: buildSelectOptions([
        { id: 'e42d3235-16c7-42f1-ba8e-d539a805257e', value: KEYWORD_CATEGORY.TOP_3, label: 'Top 3', color: 'green' },
        { id: '4f9d6eef-8839-4c39-8d04-a82b96bb7afb', value: KEYWORD_CATEGORY.QUICK_WIN, label: 'Quick win (4-10)', color: 'turquoise' },
        { id: 'e5e771d5-5f78-49b1-b5e4-ddb25abc7815', value: KEYWORD_CATEGORY.NEAR_PAGE_ONE, label: 'Near page 1 (11-30)', color: 'sky' },
        { id: '567515ca-47bb-4fa5-97c4-349e271fff24', value: KEYWORD_CATEGORY.LOW_RANKING, label: 'Low ranking', color: 'gray' },
        { id: '269c7a01-aaad-42da-be27-0f4b96562774', value: KEYWORD_CATEGORY.NOT_RELEVANT, label: 'Not relevant', color: 'red' },
        { id: '0b8ed93d-cf50-4997-80a0-ce63cbfa1a30', value: KEYWORD_CATEGORY.NEEDS_REVIEW, label: 'Needs review', color: 'orange' },
      ]),
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_RELEVANCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'relevance',
      label: 'Relevance (0-1)',
      description: 'How likely a searcher is a potential customer, judged by the classifier',
      icon: 'IconTargetArrow',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_CONFIDENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      name: 'confidence',
      label: 'Confidence (0-1)',
      description: 'Self-reported confidence of the classifier',
      icon: 'IconPercentage',
      isNullable: true,
    },
    {
      universalIdentifier: SEO_KEYWORD_OPPORTUNITY_NEEDS_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.BOOLEAN,
      name: 'needsReview',
      label: 'Needs review',
      icon: 'IconEyeCheck',
      defaultValue: false,
    },
  ],
});
