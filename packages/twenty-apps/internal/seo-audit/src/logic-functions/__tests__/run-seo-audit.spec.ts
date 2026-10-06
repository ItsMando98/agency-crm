import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock, pipelineMock, persistMock } = vi.hoisted(() => ({
  mutationMock: vi.fn(),
  pipelineMock: vi.fn(),
  persistMock: vi.fn(),
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
    pipelineMock.mockResolvedValue({ score: 80 });
    persistMock.mockResolvedValue(undefined);
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
      }),
    );
    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({ auditId: 'audit-1', result: { score: 80 } }),
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

  it('fails an audit without a usable domain', async () => {
    await handler({ events: [event('audit-1', { domain: '', status: 'QUEUED', name: 'x' })] } as Batch);

    expect(lastUpdate().data).toMatchObject({ status: 'FAILED' });
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
