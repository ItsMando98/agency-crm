import {
  TREG_BASE_URL,
  TREG_REQUEST_TIMEOUT_MS,
} from 'src/constants/creator-studio.const';
import { type TregCredentials } from 'src/types/treg-credentials';

type CallTregParams = {
  credentials: TregCredentials;
  endpointId: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string>;
  maxCostUsd?: number;
  fetchImplementation?: typeof fetch;
};

const MICRO_USD_PER_USD = 1_000_000;

export class TregError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'TregError';
    this.status = status;
  }
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const describeFailure = (status: number, payload: unknown): string => {
  const record = asRecord(payload);
  const error = typeof record?.error === 'string' ? record.error : null;

  if (status === 401 || status === 403) {
    return `treg rejected the token (HTTP ${status}).`;
  }

  if (status === 402) {
    const topUpUrl = typeof record?.topup_url === 'string' ? record.topup_url : null;

    return topUpUrl === null
      ? 'The treg balance is too low, or the call would cost more than the allowed maximum.'
      : `The treg balance is too low. Top up at ${topUpUrl}`;
  }

  if (status === 429 || status === 503) {
    return `treg is busy or the provider is unavailable${error === null ? '' : ` (${error})`}. Try again shortly.`;
  }

  return `treg returned HTTP ${status}${error === null ? '' : `: ${error}`}`;
};

export const callTreg = async ({
  credentials,
  endpointId,
  method = 'POST',
  body,
  query,
  maxCostUsd,
  fetchImplementation = fetch,
}: CallTregParams): Promise<{ body: unknown; costUsd: number }> => {
  const queryString = query === undefined ? '' : `?${new URLSearchParams(query).toString()}`;
  const response = await fetchImplementation(
    `${TREG_BASE_URL}/call/${endpointId}${queryString}`,
    {
      method,
      headers: {
        'content-type': 'application/json',
        'x-treg-token': credentials.token,
        ...(credentials.organization === null ? {} : { 'x-treg-org': credentials.organization }),
        ...(maxCostUsd === undefined ? {} : { 'x-treg-route-max-cost': String(maxCostUsd) }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TREG_REQUEST_TIMEOUT_MS),
    },
  );

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new TregError(response.status, describeFailure(response.status, payload));
  }

  const costMicro = Number(response.headers.get('x-treg-cost-micro'));

  return {
    body: payload,
    costUsd: Number.isFinite(costMicro) ? costMicro / MICRO_USD_PER_USD : 0,
  };
};
