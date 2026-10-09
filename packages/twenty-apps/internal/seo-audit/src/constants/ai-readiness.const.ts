export const AI_CRAWLERS = [
  { id: 'GPTBOT', robotsToken: 'gptbot', label: 'GPTBot' },
  { id: 'OAI_SEARCHBOT', robotsToken: 'oai-searchbot', label: 'OAI-SearchBot' },
  { id: 'CLAUDEBOT', robotsToken: 'claudebot', label: 'ClaudeBot' },
  { id: 'PERPLEXITYBOT', robotsToken: 'perplexitybot', label: 'PerplexityBot' },
  { id: 'GOOGLE_EXTENDED', robotsToken: 'google-extended', label: 'Google-Extended' },
] as const;

// Shares of the readiness score. They add up to 100.
export const AI_READINESS_WEIGHTS = {
  CRAWLER_ACCESS: 50,
  ORGANIZATION_SCHEMA: 30,
  LLMS_TXT: 10,
  FAQ_SCHEMA: 10,
} as const;

export const AI_READINESS_HOMEPAGE_PATH = '/';
