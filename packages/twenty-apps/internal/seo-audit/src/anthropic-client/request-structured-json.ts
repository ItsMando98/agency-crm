import Anthropic from '@anthropic-ai/sdk';

import { CLASSIFIER_MODEL } from 'src/constants/classifier.const';

type RequestStructuredJsonParams = {
  client: Anthropic;
  system: string;
  userContent: string;
  schema: Record<string, unknown>;
  maxTokens: number;
  // Lets the caller explain why a single answer is missing instead of losing the reason.
  onError?: (message: string) => void;
};

// Returns null when the model gave no usable answer for this single request.
// Credential problems are rethrown so a misconfigured key fails the audit
// instead of silently producing an audit without content quality.
export const requestStructuredJson = async ({
  client,
  system,
  userContent,
  schema,
  maxTokens,
  onError,
}: RequestStructuredJsonParams): Promise<unknown | null> => {
  try {
    const response = await client.messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: maxTokens,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: userContent }],
      output_config: { format: { type: 'json_schema', schema } },
    });

    if (response.stop_reason !== 'end_turn') {
      onError?.(
        `The model stopped with ${response.stop_reason} before it finished the answer.`,
      );

      return null;
    }

    const textBlock = response.content.find((block) => block.type === 'text');

    return textBlock?.type === 'text' ? JSON.parse(textBlock.text) : null;
  } catch (error) {
    if (
      error instanceof Anthropic.AuthenticationError ||
      error instanceof Anthropic.PermissionDeniedError
    ) {
      throw error;
    }

    onError?.(
      error instanceof SyntaxError
        ? `The answer was not valid JSON: ${error.message}`
        : error instanceof Error
          ? error.message
          : 'The request failed.',
    );

    return null;
  }
};
