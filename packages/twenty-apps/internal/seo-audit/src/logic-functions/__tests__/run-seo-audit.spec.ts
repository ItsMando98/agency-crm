import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock, pipelineMock, persistMock, exportsMock, uploadMock } = vi.hoisted(() => ({
  mutationMock: vi.fn(),
  pipelineMock: vi.fn(),
  persistMock: vi.fn(),
  exportsMock: vi.fn(),
  uploadMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));
vi.mock('src/utils/run-seo-audit-pipeline.util', () => ({
  runSeoAuditPipeline: pipelineMock,
}));
vi.mock('src/utils/persist-seo-audit-result.util', () => ({
  persistSeoAuditResult: persistMock,
}));
vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { uploadFile: vi.fn() };
  }),
}));
vi.mock('src/utils/build-audit-exports.util', () => ({
  buildAuditExports: exportsMock,
}));
vi.mock('src/utils/upload-audit-files.util', () => ({
  uploadAuditFiles: uploadMock,
}));

import runSeoAudit from 'src/logic-functions/run-seo-audit';

type Batch = Parameters<typeof runSeoAudit.config.handler>[0];

const handler = runSeoAudit.config.handler as (batch: Batch) => Promise<void>;

const event = (recordId: string, after: Record<string, unknown>) => ({
  recordId,
  properties: { after },
});

const updates = () =>
  mutationMock.mock.calls.map(
    ([payload]) =>
      payload.updateSeoAudit.__args as {
        id: string;
        data: Record<string, unknown>;
      },
  );

const lastUpdate = () => {
  const allUpdates = updates();

  return allUpdates[allUpdates.length - 1];
};

describe('run-seo-audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockResolvedValue({});
    pipelineMock.mockResolvedValue({
      score: 80,
      origin: 'https://example.com',
      generatedAt: '2026-10-06T10:00:00.000Z',
    });
    persistMock.mockResolvedValue(undefined);
    exportsMock.mockResolvedValue({
      reportHtml: '<html>report</html>',
      excelBuffer: Buffer.from('xlsx'),
      pdfBytes: null,
      notes: ['PDF export failed: down'],
    });
    uploadMock.mockResolvedValue({
      excelFile: [{ fileId: 'excel-id', label: 'audit.xlsx' }],
      pdfFile: null,
      notes: [],
    });
  });

  it('marks the audit as running, runs the pipeline and persists the result', async () => {
    await handler({
      events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED', language: 'EN', name: 'x' })],
    } as Batch);

    expect(updates()[0].data).toMatchObject({ status: 'RUNNING' });
    expect(pipelineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: 'https://example.com',
        language: 'EN',
        maxPages: 60,
        market: 'DE',
        dataForSeoCredentials: null,
      }),
    );
    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ auditId: 'audit-1' }),
    );
  });

  it('builds the exports, uploads the files and stores them with a share link', async () => {
    process.env.TWENTY_API_URL = 'https://crm.example.com';
    process.env.SEO_AUDIT_BRAND_NAME = 'Muster Agentur';
    process.env.PDF_RENDERER_URL = 'http://gotenberg:3000';

    try {
      await handler({
        events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED', name: 'x' })],
      } as Batch);
    } finally {
      delete process.env.TWENTY_API_URL;
      delete process.env.SEO_AUDIT_BRAND_NAME;
      delete process.env.PDF_RENDERER_URL;
    }

    expect(exportsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        branding: expect.objectContaining({ brandName: 'Muster Agentur' }),
        pdfRenderer: { url: 'http://gotenberg:3000', apiKey: null },
      }),
    );
    expect(uploadMock).toHaveBeenCalledWith(
      expect.objectContaining({ origin: 'https://example.com', generatedAt: '2026-10-06T10:00:00.000Z' }),
    );

    const { exports } = persistMock.mock.calls[0][0];

    expect(exports.shareToken).toMatch(/^[0-9a-f]{48}$/);
    expect(exports.reportUrl).toBe(
      `https://crm.example.com/s/seo-audit/report?id=audit-1&token=${exports.shareToken}`,
    );
    expect(exports).toMatchObject({
      reportHtml: '<html>report</html>',
      excelFile: [{ fileId: 'excel-id', label: 'audit.xlsx' }],
      pdfFile: null,
      notes: ['PDF export failed: down'],
    });
  });

  it('creates a new share token for every audit', async () => {
    await handler({
      events: [
        event('audit-1', { domain: 'https://example.com', status: 'QUEUED', name: 'x' }),
        event('audit-2', { domain: 'https://example.com', status: 'QUEUED', name: 'x' }),
      ],
    } as Batch);

    const tokens = persistMock.mock.calls.map(([params]) => params.exports.shareToken);

    expect(new Set(tokens).size).toBe(2);
  });

  it('still finishes the audit without a server URL for the link', async () => {
    await handler({
      events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED', name: 'x' })],
    } as Batch);

    expect(persistMock.mock.calls[0][0].exports.reportUrl).toBeNull();
  });

  it('passes DataForSEO credentials and the market from the app variables', async () => {
    process.env.DATAFORSEO_LOGIN = 'me@example.com';
    process.env.DATAFORSEO_PASSWORD = 'api-secret';
    process.env.SEO_AUDIT_MARKET = 'AT';

    try {
      await handler({
        events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED', name: 'x' })],
      } as Batch);
    } finally {
      delete process.env.DATAFORSEO_LOGIN;
      delete process.env.DATAFORSEO_PASSWORD;
      delete process.env.SEO_AUDIT_MARKET;
    }

    expect(pipelineMock).toHaveBeenCalledWith(
      expect.objectContaining({
        market: 'AT',
        dataForSeoCredentials: { login: 'me@example.com', password: 'api-secret' },
      }),
    );
  });

  it('fills in the name when the record was created without one', async () => {
    await handler({
      events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED' })],
    } as Batch);

    expect(lastUpdate().data.name).toMatch(/^example\.com \d{4}-\d{2}-\d{2}$/);
  });

  it('marks the audit as failed with the reason when the pipeline throws', async () => {
    pipelineMock.mockRejectedValue(new Error('Homepage is not reachable (HTTP 503)'));

    await handler({
      events: [event('audit-1', { domain: 'https://example.com', status: 'QUEUED', name: 'x' })],
    } as Batch);

    expect(lastUpdate().data).toMatchObject({
      status: 'FAILED',
      failureReason: 'Homepage is not reachable (HTTP 503)',
    });
    expect(persistMock).not.toHaveBeenCalled();
  });

  it('leaves a new audit queued when the website is still empty', async () => {
    await handler({ events: [event('audit-1', { domain: '   ', status: 'QUEUED', name: 'x' })] } as Batch);

    expect(mutationMock).not.toHaveBeenCalled();
    expect(pipelineMock).not.toHaveBeenCalled();
  });

  it('fails an audit whose website is not a public http URL', async () => {
    await handler({
      events: [event('audit-1', { domain: 'ftp://example.com', status: 'QUEUED', name: 'x' })],
    } as Batch);

    expect(lastUpdate().data).toMatchObject({
      status: 'FAILED',
      failureReason: 'Only http and https URLs can be audited',
    });
    expect(pipelineMock).not.toHaveBeenCalled();
  });

  it('ignores records that are not queued', async () => {
    await handler({
      events: [event('audit-1', { domain: 'https://example.com', status: 'DONE' })],
    } as Batch);

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('treats a record without status as queued', async () => {
    await handler({ events: [event('audit-1', { domain: 'https://example.com', name: 'x' })] } as Batch);

    expect(pipelineMock).toHaveBeenCalledTimes(1);
  });
});
