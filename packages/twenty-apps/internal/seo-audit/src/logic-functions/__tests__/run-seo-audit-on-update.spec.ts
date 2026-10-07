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

import runSeoAuditOnUpdate from 'src/logic-functions/run-seo-audit-on-update';

type Batch = Parameters<typeof runSeoAuditOnUpdate.config.handler>[0];

const handler = runSeoAuditOnUpdate.config.handler as (batch: Batch) => Promise<void>;

const event = (
  recordId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) => ({
  recordId,
  properties: { before, after },
});

describe('run-seo-audit-on-update', () => {
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
      notes: [],
    });
    uploadMock.mockResolvedValue({
      excelFile: null,
      pdfFile: null,
      notes: [],
    });
  });

  it('starts the audit when a website is saved onto a failed record', async () => {
    await handler({
      events: [
        event(
          'audit-1',
          { domain: '', status: 'FAILED', name: 'Unbenannt' },
          { domain: 'https://example.com', status: 'FAILED', name: 'Unbenannt' },
        ),
      ],
    } as Batch);

    expect(mutationMock.mock.calls[0][0].updateSeoAudit.__args.data).toMatchObject({
      status: 'RUNNING',
      failureReason: null,
    });
    expect(pipelineMock).toHaveBeenCalledWith(
      expect.objectContaining({ domain: 'https://example.com' }),
    );
  });

  it('starts again when status is set back to queued', async () => {
    await handler({
      events: [
        event(
          'audit-1',
          { domain: 'https://example.com', status: 'FAILED', name: 'x' },
          { domain: 'https://example.com', status: 'QUEUED', name: 'x' },
        ),
      ],
    } as Batch);

    expect(pipelineMock).toHaveBeenCalledTimes(1);
  });

  it('does not start when the audit marks itself running', async () => {
    await handler({
      events: [
        event(
          'audit-1',
          { domain: 'https://example.com', status: 'QUEUED', name: 'x' },
          { domain: 'https://example.com', status: 'RUNNING', name: 'x' },
        ),
      ],
    } as Batch);

    expect(mutationMock).not.toHaveBeenCalled();
    expect(pipelineMock).not.toHaveBeenCalled();
  });
});
