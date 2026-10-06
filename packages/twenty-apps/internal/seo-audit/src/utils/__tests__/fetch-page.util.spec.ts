import { describe, expect, it, vi } from 'vitest';

import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { fetchPage } from 'src/utils/fetch-page.util';

describe('fetchPage', () => {
  it('returns status, content type and body', async () => {
    const fetchImplementation = createFakeFetch({
      'https://example.com/': { body: '<html>hi</html>', headers: { 'x-robots-tag': 'noindex' } },
    });

    const page = await fetchPage({ url: 'https://example.com/', fetchImplementation });

    expect(page).toMatchObject({
      url: 'https://example.com/',
      statusCode: 200,
      contentType: 'text/html',
      xRobotsTag: 'noindex',
      body: '<html>hi</html>',
      errorMessage: null,
    });
  });

  it('follows redirects and reports the final URL', async () => {
    const fetchImplementation = createFakeFetch({
      'http://example.com/': { status: 301, headers: { location: 'https://example.com/' } },
      'https://example.com/': { body: 'final' },
    });

    const page = await fetchPage({ url: 'http://example.com/', fetchImplementation });

    expect(page.url).toBe('https://example.com/');
    expect(page.body).toBe('final');
  });

  it('refuses a redirect into the private network', async () => {
    const fetchImplementation = createFakeFetch({
      'https://example.com/': {
        status: 302,
        headers: { location: 'http://169.254.169.254/latest/meta-data' },
      },
    });

    const page = await fetchPage({ url: 'https://example.com/', fetchImplementation });

    expect(page.statusCode).toBe(0);
    expect(page.errorMessage).toContain('Blocked non-public URL');
  });

  it('stops after too many redirects', async () => {
    const fetchImplementation = createFakeFetch({
      'https://example.com/': { status: 302, headers: { location: 'https://example.com/' } },
    });

    const page = await fetchPage({ url: 'https://example.com/', fetchImplementation });

    expect(page.statusCode).toBe(0);
    expect(page.errorMessage).toBe('Too many redirects');
  });

  it('does not read the body for HEAD or binary responses', async () => {
    const fetchImplementation = createFakeFetch({
      'https://example.com/a': { body: 'x' },
      'https://example.com/file': { body: 'binary', contentType: 'application/pdf' },
    });

    expect(
      (await fetchPage({ url: 'https://example.com/a', method: 'HEAD', fetchImplementation }))
        .body,
    ).toBeNull();
    expect(
      (await fetchPage({ url: 'https://example.com/file', fetchImplementation })).body,
    ).toBeNull();
  });

  it('reports network errors as status 0', async () => {
    const fetchImplementation = vi.fn().mockRejectedValue(new Error('socket hang up'));

    const page = await fetchPage({
      url: 'https://example.com/',
      fetchImplementation: fetchImplementation as unknown as typeof fetch,
    });

    expect(page).toMatchObject({ statusCode: 0, errorMessage: 'socket hang up' });
  });
});
