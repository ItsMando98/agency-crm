import {
  BUSINESS_MODEL,
  PAGE_TYPE,
  SEARCH_INTENT,
} from 'src/constants/seo-audit.constants';

const RATING_VALUES = [1, 2, 3, 4, 5];

export const PAGE_ASSESSMENT_JSON_SCHEMA = {
  type: 'object',
  properties: {
    pageType: { type: 'string', enum: Object.values(PAGE_TYPE) },
    searchIntent: { type: 'string', enum: Object.values(SEARCH_INTENT) },
    helpfulness: { type: 'integer', enum: RATING_VALUES },
    specificity: { type: 'integer', enum: RATING_VALUES },
    trust: { type: 'integer', enum: RATING_VALUES },
    confidence: { type: 'number' },
  },
  required: [
    'pageType',
    'searchIntent',
    'helpfulness',
    'specificity',
    'trust',
    'confidence',
  ],
  additionalProperties: false,
};

export const SITE_PROFILE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    businessModel: { type: 'string', enum: Object.values(BUSINESS_MODEL) },
    servesLocalArea: { type: 'boolean' },
    confidence: { type: 'number' },
  },
  required: ['businessModel', 'servesLocalArea', 'confidence'],
  additionalProperties: false,
};
