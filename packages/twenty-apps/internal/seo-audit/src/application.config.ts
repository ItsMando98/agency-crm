import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier.const';
import {
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { MAX_CRAWLED_PAGES } from 'src/constants/crawl.const';
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
