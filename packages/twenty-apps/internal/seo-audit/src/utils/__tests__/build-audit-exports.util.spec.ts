import { describe, expect, it, vi } from 'vitest';

import { buildSeoAuditResult } from 'src/__mocks__/build-seo-audit-result.mock';
import { buildAuditExports } from 'src/utils/build-audit-exports.util';

const branding = { brandName: 'Muster Agentur', accentColor: '#7a3aa7' };
const pdfResponse = () => new Response(new TextEncoder().encode('%PDF-1.7 body'));

describe('buildAuditExports', () => {
  it('always builds the HTML report and the Excel file', async () => {
    const exports = await buildAuditExports({ result: buildSeoAuditResult(), branding, pdfRenderer: null });

    expect(exports.reportHtml).toContain('<!doctype html>');
    expect(exports.excelBuffer?.byteLength).toBeGreaterThan(1000);
    expect(exports.pdfBytes).toBeNull();
    expect(exports.notes).toEqual([]);
  });

  it('renders the PDF from the very same HTML when a renderer is configured', async () => {
    const calls: FormData[] = [];
    const fetchImplementation = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(init?.body as FormData);

      return pdfResponse();
    }) as typeof fetch;

    const exports = await buildAuditExports({
      result: buildSeoAuditResult(),
      branding,
      pdfRenderer: { url: 'http://gotenberg:3000', apiKey: null },
      fetchImplementation,
    });

    expect(exports.pdfBytes).not.toBeNull();
    expect(await (calls[0].get('files') as File).text()).toBe(exports.reportHtml);
  });

  it('keeps everything else when the renderer fails and says so in the notes', async () => {
    const fetchImplementation = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED'));

    const exports = await buildAuditExports({
      result: buildSeoAuditResult(),
      branding,
      pdfRenderer: { url: 'http://gotenberg:3000', apiKey: null },
      fetchImplementation: fetchImplementation as unknown as typeof fetch,
    });

    expect(exports.pdfBytes).toBeNull();
    expect(exports.reportHtml).toContain('<!doctype html>');
    expect(exports.excelBuffer).not.toBeNull();
    expect(exports.notes).toEqual(['PDF export failed: connect ECONNREFUSED']);
  });
});
