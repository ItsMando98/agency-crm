const DEFAULT_TIMEOUT_MS = 20_000;

export type TwentyClientConfig = {
  baseUrl: string;
  apiKey: string;
  fetchImplementation?: typeof fetch;
};

type FindManyParams = {
  object: string;
  filter?: string;
  orderBy?: string;
  limit?: number;
  startingAfter?: string;
  depth?: 0 | 1 | 2;
};

type FindManyResult = {
  records: unknown[];
  totalCount: number;
  endCursor: string | null;
  hasNextPage: boolean;
};

export class TwentyApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'TwentyApiError';
    this.status = status;
  }
}

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null;

export const createTwentyClient = ({
  baseUrl,
  apiKey,
  fetchImplementation = fetch,
}: TwentyClientConfig) => {
  const root = baseUrl.replace(/\/+$/, '');

  const send = async (
    path: string,
    init: { method: 'GET' | 'POST' | 'PATCH'; body?: unknown },
  ): Promise<unknown> => {
    const response = await fetchImplementation(`${root}${path}`, {
      method: init.method,
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new TwentyApiError(
        response.status,
        `Twenty answered with HTTP ${response.status}`,
      );
    }

    return response.json();
  };

  const findMany = async ({
    object,
    filter,
    orderBy,
    limit,
    startingAfter,
    depth = 0,
  }: FindManyParams): Promise<FindManyResult> => {
    const query = new URLSearchParams({ depth: String(depth) });

    if (filter !== undefined) query.set('filter', filter);
    if (orderBy !== undefined) query.set('order_by', orderBy);
    if (limit !== undefined) query.set('limit', String(limit));
    if (startingAfter !== undefined) query.set('starting_after', startingAfter);

    const payload = asRecord(await send(`/rest/${object}?${query.toString()}`, { method: 'GET' }));
    const records = asRecord(payload?.data)?.[object];
    const pageInfo = asRecord(payload?.pageInfo);

    return {
      records: Array.isArray(records) ? records : [],
      totalCount: typeof payload?.totalCount === 'number' ? payload.totalCount : 0,
      endCursor: asString(pageInfo?.endCursor),
      hasNextPage: pageInfo?.hasNextPage === true,
    };
  };

  const findOne = async ({
    object,
    singular,
    id,
    depth = 0,
  }: {
    object: string;
    singular: string;
    id: string;
    depth?: 0 | 1 | 2;
  }): Promise<unknown | null> => {
    const payload = asRecord(
      await send(`/rest/${object}/${encodeURIComponent(id)}?depth=${depth}`, { method: 'GET' }),
    );

    return asRecord(payload?.data)?.[singular] ?? null;
  };

  const create = async ({
    object,
    singular,
    data,
  }: {
    object: string;
    singular: string;
    data: Record<string, unknown>;
  }): Promise<unknown> => {
    const payload = asRecord(await send(`/rest/${object}`, { method: 'POST', body: data }));

    return asRecord(payload?.data)?.[`create${capitalize(singular)}`] ?? null;
  };

  const update = async ({
    object,
    singular,
    id,
    data,
  }: {
    object: string;
    singular: string;
    id: string;
    data: Record<string, unknown>;
  }): Promise<unknown> => {
    const payload = asRecord(
      await send(`/rest/${object}/${encodeURIComponent(id)}`, { method: 'PATCH', body: data }),
    );

    return asRecord(payload?.data)?.[`update${capitalize(singular)}`] ?? null;
  };

  return { findMany, findOne, create, update };
};

export type TwentyClient = ReturnType<typeof createTwentyClient>;
