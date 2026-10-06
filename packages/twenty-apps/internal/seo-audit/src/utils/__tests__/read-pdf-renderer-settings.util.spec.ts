import { describe, expect, it } from 'vitest';

import { readPdfRendererSettings } from 'src/utils/read-pdf-renderer-settings.util';

describe('readPdfRendererSettings', () => {
  it('returns the URL without trailing slashes and an optional key', () => {
    expect(
      readPdfRendererSettings({ PDF_RENDERER_URL: ' http://gotenberg:3000/ ', PDF_RENDERER_API_KEY: ' secret ' }),
    ).toEqual({ url: 'http://gotenberg:3000', apiKey: 'secret' });
    expect(readPdfRendererSettings({ PDF_RENDERER_URL: 'https://pdf.example.com' })).toEqual({
      url: 'https://pdf.example.com',
      apiKey: null,
    });
  });

  it.each([{}, { PDF_RENDERER_URL: '  ' }, { PDF_RENDERER_URL: 'not a url' }, { PDF_RENDERER_URL: 'file:///etc/passwd' }, { PDF_RENDERER_URL: 'ftp://x' }])(
    'returns null for %j',
    (environment) => {
      expect(readPdfRendererSettings(environment)).toBeNull();
    },
  );
});
