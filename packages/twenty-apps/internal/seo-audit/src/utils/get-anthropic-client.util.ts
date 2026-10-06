import Anthropic from '@anthropic-ai/sdk';

const REQUEST_TIMEOUT_MS = 60_000;

export const getAnthropicClient = (): Anthropic | null => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  return apiKey === undefined || apiKey === ''
    ? null
    : new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS });
};
