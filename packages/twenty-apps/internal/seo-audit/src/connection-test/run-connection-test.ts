import type Anthropic from '@anthropic-ai/sdk';

import { CLASSIFIER_MODEL } from 'src/constants/classifier.const';
import {
  CONNECTION_TEST_PDF_HTML,
  CONNECTION_TEST_TIMEOUT_MS,
  TREG_TOOLS_PATH,
} from 'src/constants/connection-services.const';
import { LOW_BALANCE_THRESHOLD_USD } from 'src/constants/dataforseo.const';
import { TREG_BASE_URL } from 'src/constants/ai-visibility.const';
import { checkDataForSeoCredentials } from 'src/dataforseo-client/check-dataforseo-credentials';
import { DataForSeoError } from 'src/dataforseo-client/dataforseo-error';
import { renderPdfFromHtml } from 'src/pdf-client/render-pdf-from-html';
import {
  type ConnectionService,
  type ConnectionTestResult,
} from 'src/types/connection-test';
import { getAnthropicClient } from 'src/utils/get-anthropic-client.util';
import { readDataForSeoCredentials } from 'src/utils/read-dataforseo-credentials.util';
import { readPdfRendererSettings } from 'src/utils/read-pdf-renderer-settings.util';
import { readTregCredentials } from 'src/utils/read-treg-credentials.util';

type RunConnectionTestParams = {
  service: ConnectionService;
  environment?: Record<string, string | undefined>;
  // Only the Anthropic test reads this. Undefined means "build it from the environment".
  anthropicClient?: Anthropic | null;
  fetchImplementation?: typeof fetch;
};

type ServiceTestParams = Required<Pick<RunConnectionTestParams, 'environment'>> &
  Pick<RunConnectionTestParams, 'anthropicClient' | 'fetchImplementation'>;

const KEY_REFUSED_STATUSES = [400, 401, 403, 404];

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : 'The request failed.';

const testAnthropic = async ({
  anthropicClient,
}: ServiceTestParams): Promise<ConnectionTestResult> => {
  const client = anthropicClient === undefined ? getAnthropicClient() : anthropicClient;

  if (client === null) {
    return { status: 'NOT_CONFIGURED', message: 'No Anthropic key is saved yet.' };
  }

  try {
    await client.messages.create({
      model: CLASSIFIER_MODEL,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    });
  } catch (error) {
    const status = (error as { status?: unknown }).status;
    const isKeyRefused = typeof status === 'number' && KEY_REFUSED_STATUSES.includes(status);

    return {
      status: 'FAILED',
      message: isKeyRefused
        ? `Anthropic refused the key: ${describeError(error)}`
        : `Anthropic could not be reached right now: ${describeError(error)}`,
    };
  }

  return { status: 'OK', message: `Key accepted. ${CLASSIFIER_MODEL} answered.` };
};

const testDataForSeo = async ({
  environment,
  fetchImplementation,
}: ServiceTestParams): Promise<ConnectionTestResult> => {
  const credentials = readDataForSeoCredentials(environment);

  if (credentials === null) {
    return {
      status: 'NOT_CONFIGURED',
      message: 'The DataForSEO login and password are not both saved yet.',
    };
  }

  try {
    const { balance } = await checkDataForSeoCredentials({ credentials, fetchImplementation });

    if (balance === null) {
      return { status: 'OK', message: 'Login accepted.' };
    }

    return {
      status: 'OK',
      message:
        balance < LOW_BALANCE_THRESHOLD_USD
          ? `Login accepted, but only ${balance.toFixed(2)} USD are left. Top up to keep market data.`
          : `Login accepted. Balance: ${balance.toFixed(2)} USD.`,
    };
  } catch (error) {
    if (error instanceof DataForSeoError && error.kind === 'AUTHENTICATION') {
      return {
        status: 'FAILED',
        message: `DataForSEO refused the login. Use the API login and API password from the dashboard under API Access, not the account password. (${error.message})`,
      };
    }

    return { status: 'FAILED', message: describeError(error) };
  }
};

// The tool listing needs a valid token and costs nothing.
const testTreg = async ({
  environment,
  fetchImplementation = fetch,
}: ServiceTestParams): Promise<ConnectionTestResult> => {
  const credentials = readTregCredentials(environment);

  if (credentials === null) {
    return { status: 'NOT_CONFIGURED', message: 'No treg token is saved yet.' };
  }

  try {
    const response = await fetchImplementation(`${TREG_BASE_URL}${TREG_TOOLS_PATH}`, {
      headers: {
        'x-treg-token': credentials.token,
        ...(credentials.organization === null
          ? {}
          : { 'x-treg-org': credentials.organization }),
      },
      signal: AbortSignal.timeout(CONNECTION_TEST_TIMEOUT_MS),
    });

    if (response.status === 401 || response.status === 403) {
      return {
        status: 'FAILED',
        message: 'treg rejected the token. Create a new token and check the team name.',
      };
    }

    return response.ok
      ? { status: 'OK', message: 'Token accepted.' }
      : { status: 'FAILED', message: `treg answered with HTTP ${response.status}.` };
  } catch (error) {
    return { status: 'FAILED', message: `treg could not be reached: ${describeError(error)}` };
  }
};

const testPdfRenderer = async ({
  environment,
  fetchImplementation,
}: ServiceTestParams): Promise<ConnectionTestResult> => {
  const settings = readPdfRendererSettings(environment);

  if (settings === null) {
    return { status: 'NOT_CONFIGURED', message: 'No PDF renderer address is saved yet.' };
  }

  try {
    await renderPdfFromHtml({ html: CONNECTION_TEST_PDF_HTML, settings, fetchImplementation });
  } catch (error) {
    return { status: 'FAILED', message: describeError(error) };
  }

  return { status: 'OK', message: 'The renderer returned a PDF.' };
};

const TESTS_BY_SERVICE: Record<
  ConnectionService,
  (params: ServiceTestParams) => Promise<ConnectionTestResult>
> = {
  ANTHROPIC: testAnthropic,
  DATAFORSEO: testDataForSeo,
  TREG: testTreg,
  PDF_RENDERER: testPdfRenderer,
};

// Tests the saved values. Secrets never travel to the browser or back.
export const runConnectionTest = async ({
  service,
  environment = process.env,
  anthropicClient,
  fetchImplementation,
}: RunConnectionTestParams): Promise<ConnectionTestResult> =>
  TESTS_BY_SERVICE[service]({ environment, anthropicClient, fetchImplementation });
