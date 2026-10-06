import Anthropic from '@anthropic-ai/sdk';
import { defineHealthCheck } from 'twenty-sdk/define';

import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';

const handler = async () => {
  const client = getAnthropicClient();

  if (client === null) {
    return {
      status: 'WARNING' as const,
      title: 'Anthropic API key missing',
      description:
        'Audits still run, but without the content quality judgement. Add the key in the Setup tab.',
    };
  }

  try {
    await client.models.list({ limit: 1 });
  } catch (error) {
    if (
      error instanceof Anthropic.AuthenticationError ||
      error instanceof Anthropic.PermissionDeniedError
    ) {
      return {
        status: 'ERROR' as const,
        title: 'Anthropic API key rejected',
        description:
          'Anthropic refused the configured key. Replace it in the Setup tab.',
      };
    }

    throw error;
  }

  return { status: 'OK' as const };
};

export default defineHealthCheck({
  universalIdentifier: '57dd62e1-ce7f-47be-97dc-4081fd282391',
  handler,
});
