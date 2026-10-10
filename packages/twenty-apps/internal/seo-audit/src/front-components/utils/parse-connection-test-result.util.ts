import { type ConnectionTestResult } from 'src/types/connection-test';
import { asRecord } from 'src/utils/as-record.util';

const STATUSES: ConnectionTestResult['status'][] = ['OK', 'NOT_CONFIGURED', 'FAILED'];

export const UNREADABLE_TEST_MESSAGE =
  'The test returned an answer that could not be read. Reload the page and try again.';

export const parseConnectionTestResult = (value: unknown): ConnectionTestResult => {
  const record = asRecord(value);
  const status = STATUSES.find((candidate) => candidate === record?.status);

  if (status === undefined || typeof record?.message !== 'string') {
    return { status: 'FAILED', message: UNREADABLE_TEST_MESSAGE };
  }

  return { status, message: record.message };
};
