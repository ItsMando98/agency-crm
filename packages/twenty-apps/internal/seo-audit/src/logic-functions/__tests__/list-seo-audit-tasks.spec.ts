import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import listSeoAuditTasks from 'src/logic-functions/list-seo-audit-tasks';

const handler = listSeoAuditTasks.config.handler as (parameters: {
  auditId: string;
  status?: string;
  priority?: string;
  area?: string;
  limit?: number;
}) => Promise<{
  success: boolean;
  message: string;
  total: number;
  tasks: { id: string; affectedUrls: string[] }[];
}>;

const task = (id: string, priority: string, effort = 'LOW', affectedUrls = '') => ({
  node: { id, name: id, priority, effort, affectedUrls },
});

describe('list_seo_audit_tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue({
      seoAuditTasks: {
        edges: [
          task('low', 'LOW'),
          task('critical', 'CRITICAL', 'HIGH', 'https://a.de/\nhttps://a.de/b'),
          task('high-hard', 'HIGH', 'HIGH'),
          task('high-easy', 'HIGH', 'LOW'),
        ],
      },
    });
  });

  it('sorts by priority, then by effort', async () => {
    const result = await handler({ auditId: 'a1' });

    expect(result.tasks.map((entry) => entry.id)).toEqual(['critical', 'high-easy', 'high-hard', 'low']);
    expect(result.total).toBe(4);
  });

  it('splits the affected urls into a list', async () => {
    const result = await handler({ auditId: 'a1' });

    expect(result.tasks[0].affectedUrls).toEqual(['https://a.de/', 'https://a.de/b']);
  });

  it('limits the result but reports the total', async () => {
    const result = await handler({ auditId: 'a1', limit: 2 });

    expect(result.tasks).toHaveLength(2);
    expect(result.total).toBe(4);
    expect(result.message).toContain('2 of 4');
  });

  it('filters by audit and the optional fields', async () => {
    await handler({ auditId: 'a1', status: 'OPEN', priority: 'HIGH', area: 'ON_PAGE' });

    expect(queryMock.mock.calls[0][0].seoAuditTasks.__args.filter).toEqual({
      seoAuditId: { eq: 'a1' },
      status: { eq: 'OPEN' },
      priority: { eq: 'HIGH' },
      area: { eq: 'ON_PAGE' },
    });
  });

  it('says so when no task matches', async () => {
    queryMock.mockResolvedValue({ seoAuditTasks: { edges: [] } });

    expect(await handler({ auditId: 'a1' })).toMatchObject({ message: 'No tasks match', total: 0, tasks: [] });
  });
});
