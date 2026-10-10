import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier.const';
import {
  AI_SUMMARY_VARIABLE_KEY,
  AI_VISIBILITY_VARIABLE_KEY,
  ANTHROPIC_API_KEY_VARIABLE_KEY,
  DATAFORSEO_LOGIN_VARIABLE_KEY,
  DATAFORSEO_PASSWORD_VARIABLE_KEY,
  TREG_ORG_VARIABLE_KEY,
  TREG_TOKEN_VARIABLE_KEY,
  DEFAULT_LANGUAGE_VARIABLE_KEY,
  MARKET_VARIABLE_KEY,
  MAX_PAGES_VARIABLE_KEY,
  PDF_RENDERER_API_KEY_VARIABLE_KEY,
  PDF_RENDERER_URL_VARIABLE_KEY,
  REPORT_ACCENT_COLOR_VARIABLE_KEY,
  REPORT_BRAND_NAME_VARIABLE_KEY,
  REPORT_PUBLIC_URL_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';
import { AI_VISIBILITY_SWITCH } from 'src/constants/ai-visibility.const';
import { MAX_CRAWLED_PAGES } from 'src/constants/crawl.const';
import { DEFAULT_MARKET, MARKETS } from 'src/constants/dataforseo.const';
import { DEFAULT_ACCENT_COLOR } from 'src/constants/report.const';
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
    [TREG_TOKEN_VARIABLE_KEY]: {
      universalIdentifier: '4cc2fe62-5d78-4ed5-a2a0-18cf29715afd',
      label: 'treg token',
      description:
        'Optional. Lets the AI visibility check ask ChatGPT, Gemini and Perplexity through treg.to, which costs less than DataForSEO. Create an agent token at treg.to.',
      isSecret: true,
    },
    [TREG_ORG_VARIABLE_KEY]: {
      universalIdentifier: 'd4465d4e-4a5a-4d1c-836d-05377b0d18b8',
      label: 'treg team',
      description:
        'The team slug in treg. Only needed for tokens created with the treg login, not for agent tokens.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    [REPORT_BRAND_NAME_VARIABLE_KEY]: {
      universalIdentifier: '42e31f7e-5681-4899-98d0-ef921966114a',
      label: 'Report brand name',
      description: 'Your agency name on the cover and in the footer of reports. Leave empty for none.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    [REPORT_ACCENT_COLOR_VARIABLE_KEY]: {
      universalIdentifier: 'de515325-c9b5-4e54-b113-86b22c8bdd0f',
      label: 'Report accent color',
      description: 'Hex color of the cover line, for example #2a78d6.',
      type: FieldType.TEXT,
      isSecret: false,
      value: DEFAULT_ACCENT_COLOR,
    },
    [REPORT_PUBLIC_URL_VARIABLE_KEY]: {
      universalIdentifier: '3dbd616f-4153-4944-b3fa-4a127aecb01f',
      label: 'Report link base URL',
      description:
        'Optional. The address of your workspace, for example https://crm.example.com. Needed when each workspace has its own subdomain. Defaults to the server URL.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    [PDF_RENDERER_URL_VARIABLE_KEY]: {
      universalIdentifier: '2341ebf3-18df-499f-b317-4685970a2fb2',
      label: 'PDF renderer URL',
      description:
        'Optional. URL of a Gotenberg service, for example http://gotenberg:3000. With it every audit gets a PDF rendered from the HTML report. Without it, open the report link and choose Save as PDF.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    [PDF_RENDERER_API_KEY_VARIABLE_KEY]: {
      universalIdentifier: 'a7c30442-b164-496f-ab95-2c1485e94251',
      label: 'PDF renderer API key',
      description: 'Optional. Sent as a bearer token when your renderer sits behind authentication.',
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
    [AI_VISIBILITY_VARIABLE_KEY]: {
      universalIdentifier: 'd2c8217e-a10c-458c-9ae3-302aa793f362',
      label: 'AI visibility check',
      description:
        'Optional and paid. Asks ChatGPT, Perplexity and Gemini typical customer questions and checks whether the website is named. Needs treg or DataForSEO, and the Anthropic key. Through treg it costs roughly 0.1 USD per audit, through DataForSEO roughly 0.5 to 1 USD.',
      type: FieldType.SELECT,
      options: [
        { label: 'Off', value: AI_VISIBILITY_SWITCH.OFF },
        { label: 'On', value: AI_VISIBILITY_SWITCH.ON },
      ],
      isSecret: false,
      value: AI_VISIBILITY_SWITCH.OFF,
    },
    [AI_SUMMARY_VARIABLE_KEY]: {
      universalIdentifier: 'd90ea8cf-9470-475b-86d5-45e0fe2a9a96',
      label: 'Written summary',
      description:
        'A strong Claude model writes the summary of every audit: what works, what holds the site back, and what to do this week, this month and this quarter. Each number in the text is checked against the audit. Costs a few cents per audit at Anthropic. Needs the Anthropic key.',
      type: FieldType.SELECT,
      options: [
        { label: 'On', value: AI_VISIBILITY_SWITCH.ON },
        { label: 'Off', value: AI_VISIBILITY_SWITCH.OFF },
      ],
      isSecret: false,
      value: AI_VISIBILITY_SWITCH.ON,
    },
  },
});
