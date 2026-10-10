import { GENERIC_COMPETITOR_DOMAINS } from 'src/constants/dataforseo.const';

// Sources that say nothing about who competes for the customer.
export const AI_IGNORED_SOURCE_DOMAINS: readonly string[] = [
  ...GENERIC_COMPETITOR_DOMAINS,
  'google.com',
  'google.de',
  'bing.com',
  'duckduckgo.com',
];

// Model names change quickly. A model DataForSEO no longer offers turns into a note, not a failed audit.
export const AI_ENGINES = [
  {
    id: 'CHATGPT',
    label: 'ChatGPT',
    path: '/v3/ai_optimization/chat_gpt/llm_responses/live',
    modelName: 'gpt-5.4-mini',
    needsWebSearchFlag: true,
  },
  {
    id: 'PERPLEXITY',
    label: 'Perplexity',
    path: '/v3/ai_optimization/perplexity/llm_responses/live',
    modelName: 'sonar',
    needsWebSearchFlag: false,
  },
  {
    id: 'GEMINI',
    label: 'Gemini',
    path: '/v3/ai_optimization/gemini/llm_responses/live',
    modelName: 'gemini-3.5-flash',
    needsWebSearchFlag: true,
  },
] as const;

export const AI_VISIBILITY_SWITCH = { OFF: 'OFF', ON: 'ON' } as const;

export const AI_QUERY_COUNT = 8;
export const AI_QUERY_MIN_LENGTH = 10;
// DataForSEO accepts 500 characters per prompt; real questions stay far below.
export const AI_QUERY_MAX_LENGTH = 200;
export const AI_MIN_QUERIES = 5;
export const AI_MAX_REQUESTS = 30;
export const AI_REQUEST_CONCURRENCY = 4;
export const AI_REQUEST_TIMEOUT_MS = 90_000;
// Engines sometimes refuse a burst of requests. A pause and a second try usually gets the answer.
export const AI_MAX_ATTEMPTS = 3;
export const AI_RETRY_DELAY_MS = 3_000;
export const AI_RETRYABLE_ERROR_PATTERN =
  /rate_limit|rate limit|too many requests|unavailable|saturated|timeout|timed out|429/i;

export const TREG_BASE_URL = 'https://treg.to';
// treg stops a single call that would cost more, and charges nothing then.
export const TREG_MAX_COST_PER_CALL_USD = '0.05';
// The consumer interfaces take 30 to 80 seconds per answer.
export const TREG_REQUEST_TIMEOUT_MS = 120_000;
export const TREG_DEADLINE_MS = 420_000;
export const TREG_REQUEST_CONCURRENCY = 8;

// ChatGPT and Gemini are asked through the real consumer interfaces (cloro).
// Perplexity goes through the DataForSEO endpoint that treg serves, because
// the cloro Perplexity route answered only about half of its requests.
export const AI_TREG_ENDPOINTS = {
  CHATGPT: 'cloro.ai-search.chatgpt.scrape',
  GEMINI: 'cloro.ai-search.gemini.scrape',
  PERPLEXITY: 'dataforseo.x.ai-optimization-perplexity-llm-responses-live',
} as const;
export const AI_DEADLINE_MS = 240_000;
export const AI_MIN_ANSWER_LENGTH = 20;
export const AI_MIN_BRAND_NAME_LENGTH = 4;
export const AI_MAX_COMPETITORS_SHOWN = 3;
export const AI_MENTIONED_WEIGHT = 0.5;
// Presence and readiness make up the score of the AI visibility area.
export const AI_SCORE_PRESENCE_SHARE = 0.7;
export const AI_PRESENCE_GOOD_RATE = 0.5;
export const AI_MIN_QUERIES_FOR_FINDINGS = 6;
export const AI_COMPETITOR_MIN_QUERIES = 3;
export const AI_MAX_EXAMPLES = 3;
export const QUERY_GENERATION_MAX_TOKENS = 600;
