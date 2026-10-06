import { describe, expect, it, vi } from 'vitest';

import { renderPdfFromHtml } from 'src/pdf-client/render-pdf-from-html';

const PDF_BYTES = new TextEncoder().encode('%PDF-1.7 fake pdf body');

const createFetch = (response: () => Response) => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImplementation = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init: init ?? {} });

    return response();
  }) as typeof fetch;

  return { fetchImplementation, calls };
};

describe('renderPdfFromHtml', () => {
  it('posts the page as index.html to the Chromium route and returns the PDF', async () => {
    const { fetchImplementation, calls } = createFetch(() => new Response(PDF_BYTES, { status: 200 }));

    const bytes = await renderPdfFromHtml({
      html: '<html><body>Report</body></html>',
      settings: { url: 'http://gotenberg:3000', apiKey: null },
      fetchImplementation,
    });

    const body = calls[0].init.body as FormData;
    const file = body.get('files') as File;

    expect(calls[0].url).toBe('http://gotenberg:3000/forms/chromium/convert/html');
    expect(calls[0].init.method).toBe('POST');
    expect(file.name).toBe('index.html');
    expect(await file.text()).toBe('<html><body>Report</body></html>');
    expect(body.get('preferCssPageSize')).toBe('true');
    expect(body.get('printBackground')).toBe('true');
    expect(calls[0].init.headers).toBeUndefined();
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe('%PDF');
  });

  it('sends the API key as bearer token', async () => {
    const { fetchImplementation, calls } = createFetch(() => new Response(PDF_BYTES));

    await renderPdfFromHtml({
      html: '<p>x</p>',
      settings: { url: 'https://pdf.example.com', apiKey: 'secret' },
      fetchImplementation,
    });

    expect(calls[0].init.headers).toEqual({ authorization: 'Bearer secret' });
  });

  it('fails with the HTTP status when the renderer refuses', async () => {
    const { fetchImplementation } = createFetch(() => new Response('nope', { status: 503 }));

    await expect(
      renderPdfFromHtml({ html: '<p>x</p>', settings: { url: 'http://g', apiKey: null }, fetchImplementation }),
    ).rejects.toThrow('PDF renderer answered with HTTP 503');
  });

  it('refuses an answer that is not a PDF, such as a login page', async () => {
    const { fetchImplementation } = createFetch(() => new Response('<html>login</html>', { status: 200 }));

    await expect(
      renderPdfFromHtml({ html: '<p>x</p>', settings: { url: 'http://g', apiKey: null }, fetchImplementation }),
    ).rejects.toThrow('PDF renderer did not return a PDF');
  });

  it('lets network errors bubble up for the caller to report', async () => {
    const fetchImplementation = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED'));

    await expect(
      renderPdfFromHtml({
        html: '<p>x</p>',
        settings: { url: 'http://g', apiKey: null },
        fetchImplementation: fetchImplementation as unknown as typeof fetch,
      }),
    ).rejects.toThrow('connect ECONNREFUSED');
  });
});
