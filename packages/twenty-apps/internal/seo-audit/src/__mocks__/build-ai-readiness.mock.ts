import { type AiReadiness } from 'src/types/ai-readiness';

export const buildAiReadiness = (overrides: Partial<AiReadiness> = {}): AiReadiness => ({
  crawlerAccess: {
    GPTBOT: 'ALLOWED',
    OAI_SEARCHBOT: 'ALLOWED',
    CLAUDEBOT: 'ALLOWED',
    PERPLEXITYBOT: 'ALLOWED',
    GOOGLE_EXTENDED: 'ALLOWED',
  },
  llmsTxtFound: true,
  organizationSchemaFound: true,
  faqSchemaFound: true,
  ...overrides,
});
