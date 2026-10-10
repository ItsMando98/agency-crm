import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { CONNECTION_TEST_ROUTE_PATH } from 'src/constants/connection-services.const';
import { parseConnectionTestResult } from 'src/front-components/utils/parse-connection-test-result.util';
import {
  type ConnectionService,
  type ConnectionTestResult,
} from 'src/types/connection-test';

const REQUEST_FAILED_MESSAGE =
  'The test could not be started. Reload the page and try again.';

export const useTestConnection = (service: ConnectionService) => {
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = async () => {
    setIsTesting(true);

    try {
      const response = await new RestApiClient().get(`/s${CONNECTION_TEST_ROUTE_PATH}`, {
        query: { service },
      });

      setResult(parseConnectionTestResult(response));
    } catch {
      setResult({ status: 'FAILED', message: REQUEST_FAILED_MESSAGE });
    } finally {
      setIsTesting(false);
    }
  };

  return { result, isTesting, testConnection };
};
