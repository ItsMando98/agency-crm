import { describe, expect, it, vi } from 'vitest';

import { createTwentyClient, TwentyApiError } from '~/lib/twenty/twenty-client.server';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('twenty client', () => {
  it('sends the key as bearer token and builds the query', async () => {
    const fetchImplementation = vi.fn(async () =>
      jsonResponse({
        data: { seoAudits: [{ id: 'a1' }] },
        totalCount: 7,
        pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
      }),
    );
    const client = createTwentyClient({
      baseUrl: 'http://twenty-server:3000/',
      apiKey: 'key-1',
      fetchImplementation: fetchImplementation as unknown as typeof fetch,
    });

    const result = await client.findMany({
      object: 'seoAudits',
      filter: 'and(status[eq]:"DONE")',
      orderBy: 'createdAt[DescNullsLast]',
      limit: 20,
    });

    const [url, init] = fetchImplementation.mock.calls[0] as unknown as [string, RequestInit];
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe('http://twenty-server:3000/rest/seoAudits');
    expect(parsed.searchParams.get('filter')).toBe('and(status[eq]:"DONE")');
    expect(parsed.searchParams.get('order_by')).toBe('createdAt[DescNullsLast]');
    expect(parsed.searchParams.get('limit')).toBe('20');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer key-1');
    expect(result).toEqual({
      records: [{ id: 'a1' }],
      totalCount: 7,
      endCursor: 'cursor-1',
      hasNextPage: true,
    });
  });

  it('returns null for a missing record', async () => {
    const client = createTwentyClient({
      baseUrl: 'http://x',
      apiKey: 'k',
      fetchImplementation: (async () => jsonResponse({}, 404)) as unknown as typeof fetch,
    });

    expect(await client.findOne({ object: 'seoAudits', singular: 'seoAudit', id: 'nope' })).toBeNull();
  });

  it('reads the created record from the create wrapper', async () => {
    const client = createTwentyClient({
      baseUrl: 'http://x',
      apiKey: 'k',
      fetchImplementation: (async () =>
        jsonResponse({ data: { createSeoAudit: { id: 'new-1' } } }, 201)) as unknown as typeof fetch,
    });

    expect(
      await client.create({ object: 'seoAudits', singular: 'seoAudit', data: { domain: 'a.de' } }),
    ).toEqual({ id: 'new-1' });
  });

  it('throws a typed error for a failed request', async () => {
    const client = createTwentyClient({
      baseUrl: 'http://x',
      apiKey: 'k',
      fetchImplementation: (async () => jsonResponse({ error: 'no' }, 401)) as unknown as typeof fetch,
    });

    await expect(client.findMany({ object: 'seoAudits' })).rejects.toBeInstanceOf(TwentyApiError);
  });
});
