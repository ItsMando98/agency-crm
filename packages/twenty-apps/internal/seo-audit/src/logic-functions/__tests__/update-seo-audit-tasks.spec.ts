import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutationMock } = vi.hoisted(() => ({ mutationMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { mutation: mutationMock };
  }),
}));

import updateSeoAuditTasks from 'src/logic-functions/update-seo-audit-tasks';

type Result = {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  results: { id: string; status: string; error?: string }[];
};

const handler = updateSeoAuditTasks.config.handler as (parameters: {
  tasks: { id: string; status: string }[];
}) => Promise<Result>;

describe('update_seo_audit_tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.mockResolvedValue({ updateSeoAuditTask: { id: 'x' } });
  });

  it('updates every task', async () => {
    const result = await handler({
      tasks: [
        { id: 't1', status: 'DONE' },
        { id: 't2', status: 'IN_PROGRESS' },
      ],
    });

    expect(result).toMatchObject({ success: true, updatedCount: 2, failedCount: 0 });
    expect(mutationMock.mock.calls[0][0].updateSeoAuditTask.__args).toEqual({ id: 't1', data: { status: 'DONE' } });
    expect(mutationMock.mock.calls[1][0].updateSeoAuditTask.__args).toEqual({ id: 't2', data: { status: 'IN_PROGRESS' } });
  });

  it('rejects an invalid status without calling the api', async () => {
    const result = await handler({ tasks: [{ id: 't1', status: 'FINISHED' }] });

    expect(result.success).toBe(false);
    expect(result.results[0]).toMatchObject({ id: 't1', status: 'FAILED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('reports failures per task and carries on', async () => {
    mutationMock.mockRejectedValueOnce(new Error('not found')).mockResolvedValueOnce({});

    const result = await handler({
      tasks: [
        { id: 'missing', status: 'DONE' },
        { id: 't2', status: 'DONE' },
      ],
    });

    expect(result).toMatchObject({ success: false, updatedCount: 1, failedCount: 1 });
    expect(result.results).toEqual([
      { id: 'missing', status: 'FAILED', error: 'not found' },
      { id: 't2', status: 'UPDATED' },
    ]);
  });

  it('refuses an empty list', async () => {
    expect(await handler({ tasks: [] })).toMatchObject({ success: false });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses more tasks than allowed per call', async () => {
    const tasks = Array.from({ length: 51 }, (_, index) => ({ id: `t${index}`, status: 'DONE' }));

    expect(await handler({ tasks })).toMatchObject({ success: false });
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
