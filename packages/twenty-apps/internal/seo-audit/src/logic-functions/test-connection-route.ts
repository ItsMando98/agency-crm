import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { runConnectionTest } from 'src/connection-test/run-connection-test';
import {
  CONNECTION_SERVICES,
  CONNECTION_TEST_ROUTE_PATH,
} from 'src/constants/connection-services.const';
import {
  type ConnectionService,
  type ConnectionTestResult,
} from 'src/types/connection-test';

const isConnectionService = (value: unknown): value is ConnectionService =>
  CONNECTION_SERVICES.some((service) => service === value);

const handler = async (event: RoutePayload): Promise<ConnectionTestResult> => {
  const service = event.queryStringParameters?.service;

  if (!isConnectionService(service)) {
    return { status: 'FAILED', message: 'Unknown service.' };
  }

  try {
    return await runConnectionTest({ service });
  } catch (error) {
    return {
      status: 'FAILED',
      message: `The test could not be run: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: 'fc2f4ad2-a635-471c-8135-78d0a468125d',
  name: 'test-connection',
  description:
    'Checks a saved key of the SEO Audit app against its provider, for the Test connection buttons on the Setup page.',
  timeoutSeconds: 60,
  handler,
  httpRouteTriggerSettings: {
    path: CONNECTION_TEST_ROUTE_PATH,
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
