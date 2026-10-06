import Anthropic from '@anthropic-ai/sdk';

import { ANTHROPIC_API_KEY_VARIABLE_KEY } from 'src/constants/application-variable-keys.const';

const REQUEST_TIMEOUT_MS = 60_000;

export const getAnthropicClient = (): Anthropic | null => {
  const apiKey = process.env[ANTHROPIC_API_KEY_VARIABLE_KEY]?.trim();

  return apiKey === undefined || apiKey === ''
    ? null
    : new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS });
};
