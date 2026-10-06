import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier.const';
import {
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  DATAFORSEO_PASSWORD_VARIABLE_KEY,
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MARKET_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { MAX_CRAWLED_PAGES } from 'src/constants/crawl.const';
import { DEFAULT_MARKET, MARKETS } from 'src/constants/dataforseo.const';
import { SEO_AUDIT_LANGUAGE } from 'src/constants/seo-audit.constants';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'SEO Audit',
  description:
    'Automated website SEO audits for AI agents: code measures what can be counted, a small model judges page quality, and every audit ends in a prioritized action list.',
  applicationVariables: {
    [ANTHROPIC_API_KEY_VARIABLE_KEY]: {
      universalIdentifier: '0bef5b1f-0411-47ab-b78c-3c72f3e01b2a',
      label: 'Anthropic API key',
      description:
        'Used by the page classifier to judge content quality. Without it audits run on measured rules only.',
      isSecret: true,
    },
    [DATAFORSEO_LOGIN_VARIABLE_KEY]: {
      universalIdentifier: 'd7684e58-bf10-460e-8caa-9fe8cfccf217',
      label: 'DataForSEO API login',
      description:
        'Optional. Enables rankings, keyword opportunities, backlinks and competitors. Use the API login from the DataForSEO dashboard under API Access.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    [DATAFORSEO_PASSWORD_VARIABLE_KEY]: {
      universalIdentifier: '8dc4c6e5-9cca-4c98-bdd6-710ec9b9014f',
      label: 'DataForSEO API password',
      description:
        'The API password from the DataForSEO dashboard, not your account password.',
      isSecret: true,
    },
    [MARKET_VARIABLE_KEY]: {
      universalIdentifier: '0f7b147f-afbf-4094-b581-061ea058879d',
      label: 'Market',
      description: 'Country and language used for rankings and search volumes.',
      type: FieldType.SELECT,
      options: Object.entries(MARKETS).map(([value, market]) => ({
        label: market.label,
        value,
      })),
      isSecret: false,
      value: DEFAULT_MARKET,
    },
    [DEFAULT_LANGUAGE_VARIABLE_KEY]: {
      universalIdentifier: '81d50c41-d16f-45a4-91b8-8b093e07fd90',
      label: 'Default report language',
      description: 'Language of new audit reports when none is chosen.',
      type: FieldType.SELECT,
      options: [
        { label: 'German', value: SEO_AUDIT_LANGUAGE.DE },
        { label: 'English', value: SEO_AUDIT_LANGUAGE.EN },
      ],
      isSecret: false,
      value: SEO_AUDIT_LANGUAGE.DE,
    },
    [MAX_PAGES_VARIABLE_KEY]: {
      universalIdentifier: '1ddfc661-f472-4c90-9eb3-85da452d33a8',
      label: 'Maximum pages per audit',
      description: `How many pages the crawler checks per audit, from 1 to ${MAX_CRAWLED_PAGES}.`,
      type: FieldType.NUMBER,
      isSecret: false,
      value: MAX_CRAWLED_PAGES,
    },
  },
});
