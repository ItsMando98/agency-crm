import { PDF_RENDER_TIMEOUT_MS } from 'src/constants/report.const';
import { type PdfRendererSettings } from 'src/types/pdf-renderer-settings';

type RenderPdfFromHtmlParams = {
  html: string;
  settings: PdfRendererSettings;
  fetchImplementation?: typeof fetch;
};

const PDF_SIGNATURE = '%PDF';

// Talks to a Gotenberg compatible service: the page is sent as index.html and
// rendered by headless Chromium, using the page's own @page rules.
export const renderPdfFromHtml = async ({
  html,
  settings,
  fetchImplementation = fetch,
}: RenderPdfFromHtmlParams): Promise<Uint8Array> => {
  const form = new FormData();

  form.append('files', new Blob([html], { type: 'text/html' }), 'index.html');
  form.append('preferCssPageSize', 'true');
  form.append('printBackground', 'true');

  const response = await fetchImplementation(
    `${settings.url}/forms/chromium/convert/html`,
    {
      method: 'POST',
      body: form,
      headers:
        settings.apiKey === null ? undefined : { authorization: `Bearer ${settings.apiKey}` },
      signal: AbortSignal.timeout(PDF_RENDER_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`PDF renderer answered with HTTP ${response.status}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (new TextDecoder().decode(bytes.slice(0, PDF_SIGNATURE.length)) !== PDF_SIGNATURE) {
    throw new Error('PDF renderer did not return a PDF');
  }

  return bytes;
};
