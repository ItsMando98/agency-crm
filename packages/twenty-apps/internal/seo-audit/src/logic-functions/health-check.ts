import Anthropic from '@anthropic-ai/sdk';
import { defineHealthCheck } from 'twenty-sdk/define';

import { LOW_BALANCE_THRESHOLD_USD } from 'src/constants/dataforseo.const';
import { checkDataForSeoCredentials } from 'src/dataforseo-client/check-dataforseo-credentials';
import { DataForSeoError } from 'src/dataforseo-client/dataforseo-error';
import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';
import { readDataForSeoCredentials } from 'src/utils/read-dataforseo-credentials.util';

type HealthIssue = {
  status: 'WARNING' | 'ERROR';
  title: string;
  description: string;
};

const checkAnthropic = async (): Promise<HealthIssue | null> => {
  const client = getAnthropicClient();

  if (client === null) {
    return {
      status: 'WARNING',
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
        status: 'ERROR',
        title: 'Anthropic API key rejected',
        description:
          'Anthropic refused the configured key. Replace it in the Setup tab.',
      };
    }

    throw error;
  }

  return null;
};

// DataForSEO is optional, so missing credentials are not an issue.
const checkDataForSeo = async (): Promise<HealthIssue | null> => {
  const credentials = readDataForSeoCredentials();

  if (credentials === null) {
    return null;
  }

  try {
    const { balance } = await checkDataForSeoCredentials({ credentials });

    return balance !== null && balance < LOW_BALANCE_THRESHOLD_USD
      ? {
          status: 'WARNING',
          title: 'DataForSEO balance is low',
          description: `Only ${balance.toFixed(2)} USD left. Audits skip market data when the balance runs out.`,
        }
      : null;
  } catch (error) {
    if (error instanceof DataForSeoError && error.kind === 'AUTHENTICATION') {
      return {
        status: 'ERROR',
        title: 'DataForSEO credentials rejected',
        description:
          'DataForSEO refused the login. Use the API login and API password from the DataForSEO dashboard, not your account password.',
      };
    }

    throw error;
  }
};

const handler = async () => {
  const outcomes = await Promise.allSettled([checkAnthropic(), checkDataForSeo()]);
  const issues = outcomes.flatMap((outcome) =>
    outcome.status === 'fulfilled' && outcome.value !== null ? [outcome.value] : [],
  );
  const worstIssue =
    issues.find((issue) => issue.status === 'ERROR') ?? issues[0];

  if (worstIssue !== undefined) {
    return worstIssue;
  }

  const failedOutcome = outcomes.find((outcome) => outcome.status === 'rejected');

  if (failedOutcome?.status === 'rejected') {
    throw failedOutcome.reason;
  }

  return { status: 'OK' as const };
};

export default defineHealthCheck({
  universalIdentifier: '57dd62e1-ce7f-47be-97dc-4081fd282391',
  handler,
});
