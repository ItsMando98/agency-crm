type FakeResponse = {
  status?: number;
  body?: string;
  contentType?: string;
  headers?: Record<string, string>;
};

export const createFakeFetch = (
  responsesByUrl: Record<string, FakeResponse>,
): typeof fetch =>
  (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const response = responsesByUrl[url] ?? { status: 404, body: 'not found' };

    return new Response(response.body ?? '', {
      status: response.status ?? 200,
      headers: {
        'content-type': response.contentType ?? 'text/html',
        ...response.headers,
      },
    });
  }) as typeof fetch;
