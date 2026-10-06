import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock, queryMock } = vi.hoisted(() => ({
  mutationMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock, query: queryMock };
  }),
}));

import startSeoAudit from 'src/logic-functions/start-seo-audit';
import { type StartSeoAuditInput } from 'src/types/start-seo-audit-input';

const handler = startSeoAudit.config.handler as (
  parameters: StartSeoAuditInput,
) => Promise<{
  success: boolean;
  auditId?: string;
  status?: string;
  alreadyRunning?: boolean;
  error?: string;
}>;

const NO_RUNNING_AUDIT = { seoAudits: { edges: [] } };

describe('start_seo_audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(NO_RUNNING_AUDIT);
    mutationMock.mockResolvedValue({ createSeoAudit: { id: 'audit-1' } });
  });

  it('queues an audit for the normalized origin', async () => {
    const result = await handler({ domain: 'Example.com/about', companyId: 'company-1', language: 'EN' });

    expect(result).toMatchObject({ success: true, auditId: 'audit-1', status: 'QUEUED', alreadyRunning: false });
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

  it('asks for a domain or a company when neither is given', async () => {
    const result = await handler({});

    expect(result).toMatchObject({ success: false, error: 'Provide a domain or a companyId.' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('takes the domain from the company when none is given', async () => {
    queryMock
      .mockResolvedValueOnce({
        companies: {
          edges: [{ node: { id: 'company-1', domainName: { primaryLinkUrl: 'https://www.acme.de/' } } }],
        },
      })
      .mockResolvedValueOnce(NO_RUNNING_AUDIT);

    const result = await handler({ companyId: 'company-1' });

    expect(result.success).toBe(true);
    expect(mutationMock.mock.calls[0][0].createSeoAudit.__args.data).toMatchObject({
      domain: 'https://www.acme.de',
      companyId: 'company-1',
    });
  });

  it('fails when the company has no website', async () => {
    queryMock.mockResolvedValueOnce({
      companies: { edges: [{ node: { id: 'company-1', domainName: { primaryLinkUrl: '' } } }] },
    });

    const result = await handler({ companyId: 'company-1' });

    expect(result.success).toBe(false);
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns the running audit instead of starting a second one', async () => {
    queryMock.mockResolvedValueOnce({
      seoAudits: { edges: [{ node: { id: 'audit-0', status: 'RUNNING' } }] },
    });

    const result = await handler({ domain: 'example.com' });

    expect(result).toMatchObject({
      success: true,
      auditId: 'audit-0',
      status: 'RUNNING',
      alreadyRunning: true,
    });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('only looks at audits of the same origin that are still active', async () => {
    await handler({ domain: 'example.com' });

    const filter = queryMock.mock.calls[0][0].seoAudits.__args.filter;

    expect(filter.domain).toEqual({ eq: 'https://example.com' });
    expect(filter.status).toEqual({ in: ['QUEUED', 'RUNNING'] });
    expect(filter.createdAt.gte).toEqual(expect.any(String));
  });
});
