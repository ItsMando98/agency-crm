import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock } = vi.hoisted(() => ({ mutationMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));

import startSeoAudit from 'src/logic-functions/start-seo-audit';
import { type StartSeoAuditInput } from 'src/types/start-seo-audit-input';

const handler = startSeoAudit.config.handler as (
  parameters: StartSeoAuditInput,
) => Promise<{ success: boolean; auditId?: string; status?: string; error?: string }>;

describe('start_seo_audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockResolvedValue({ createSeoAudit: { id: 'audit-1' } });
  });

  it('queues an audit for the normalized origin', async () => {
    const result = await handler({ domain: 'Example.com/about', companyId: 'company-1', language: 'EN' });

    expect(result).toMatchObject({ success: true, auditId: 'audit-1', status: 'QUEUED' });
    expect(mutationMock.mock.calls[0][0].createSeoAudit.__args.data).toMatchObject({
      domain: 'https://example.com',
      status: 'QUEUED',
      language: 'EN',
      companyId: 'company-1',
    });
  });

  it('defaults to German reports', async () => {
    await handler({ domain: 'example.com' });

    expect(mutationMock.mock.calls[0][0].createSeoAudit.__args.data.language).toBe('DE');
  });

  it('refuses private targets without creating a record', async () => {
    const result = await handler({ domain: 'http://localhost:3000' });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
