import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1c76c25-7a5c-492e-ba19-f608ea13b757';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'SEO Audit',
  description:
    'Automated website SEO audits for AI agents: code measures what can be counted, a small model judges page quality, and every audit ends in a prioritized action list.',
  serverVariables: {
    ANTHROPIC_API_KEY: {
      description:
        'Anthropic API key used by the page classifier. Set by the server admin after installation.',
      isSecret: true,
      isRequired: true,
    },
  },
});
