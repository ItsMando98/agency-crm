import {
  DATAFORSEO_BASE_URL,
  DATAFORSEO_REQUEST_TIMEOUT_MS,
  DATAFORSEO_SUCCESS_STATUS_CODE,
} from 'src/constants/dataforseo.const';
import { DataForSeoError } from 'src/dataforseo-client/dataforseo-error';
import { type DataForSeoCredentials } from 'src/types/data-for-seo-credentials';
import { classifyDataForSeoStatus } from 'src/utils/classify-dataforseo-status.util';

type RequestDataForSeoParams = {
  credentials: DataForSeoCredentials;
  path: string;
  body?: unknown[];
  timeoutMs?: number;
  fetchImplementation?: typeof fetch;
};

type DataForSeoResponse = {
  status_code?: number;
  status_message?: string;
  cost?: number;
  tasks?: {
    status_code?: number;
    status_message?: string;
    cost?: number;
    result?: unknown[] | null;
  }[];
};

type DataForSeoResult = {
  result: unknown;
  cost: number;
};

export const requestDataForSeo = async ({
  credentials,
  path,
  body,
  timeoutMs = DATAFORSEO_REQUEST_TIMEOUT_MS,
  fetchImplementation = fetch,
}: RequestDataForSeoParams): Promise<DataForSeoResult> => {
  const basicToken = btoa(`${credentials.login}:${credentials.password}`);

  const response = await fetchImplementation(`${DATAFORSEO_BASE_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      authorization: `Basic ${basicToken}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  let payload: DataForSeoResponse | null = null;

  try {
    payload = (await response.json()) as DataForSeoResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new DataForSeoError(
      classifyDataForSeoStatus(response.status),
      payload?.status_message ?? `HTTP ${response.status}`,
    );
  }

  const envelopeCode = payload?.status_code;
  const task = payload?.tasks?.[0];
  const failingCode = [envelopeCode, task?.status_code].find(
    (code) => code !== undefined && code !== DATAFORSEO_SUCCESS_STATUS_CODE,
  );

  if (payload === null || failingCode !== undefined || task === undefined) {
    throw new DataForSeoError(
      classifyDataForSeoStatus(failingCode ?? 0),
      task?.status_message ??
        payload?.status_message ??
        'Unexpected DataForSEO response',
    );
  }

  return {
    result: task.result?.[0] ?? null,
    cost: typeof payload.cost === 'number' ? payload.cost : (task.cost ?? 0),
  };
};
