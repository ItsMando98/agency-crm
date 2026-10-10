import { describe, expect, it, vi } from 'vitest';

import { type Principal } from '~/lib/auth/principal';
import {
  countOpenTasks,
  getAudit,
  listAuditTasks,
  listAudits,
  startAudit,
  updateTaskStatus,
} from '~/lib/twenty/audits.server';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const team: Principal = { kind: 'TEAM', email: 'team@roaswell.com' };
const client: Principal = { kind: 'CLIENT', email: 'kunde@firma.de', companyId: 'company-1' };

const buildClient = (overrides: Partial<TwentyClient> = {}): TwentyClient => ({
  findMany: vi.fn(async () => ({ records: [], totalCount: 0, endCursor: null, hasNextPage: false })),
  findOne: vi.fn(async () => null),
  create: vi.fn(async () => null),
  update: vi.fn(async () => null),
  ...overrides,
});

const auditRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'audit-1',
  name: 'roaswell.com 2026-10-10',
  domain: 'https://roaswell.com',
  status: 'DONE',
  score: 74,
  grade: 'C',
  areaScores: { ON_PAGE: 85, AI_VISIBILITY: 27 },
  companyId: 'company-1',
  ...overrides,
});

describe('audits data layer', () => {
  it('lists audits without a company filter for the team', async () => {
    const findMany = vi.fn(async () => ({
      records: [auditRecord()],
      totalCount: 1,
      endCursor: null,
      hasNextPage: false,
    }));

    const result = await listAudits(buildClient({ findMany }), team);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ filter: undefined, object: 'seoAudits' }));
    expect(result.audits[0]).toMatchObject({ id: 'audit-1', score: 74, status: 'DONE' });
  });

  it('always limits a client to their own company', async () => {
    const findMany = vi.fn(async () => ({ records: [], totalCount: 0, endCursor: null, hasNextPage: false }));

    await listAudits(buildClient({ findMany }), client, { status: 'DONE' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: 'and(companyId[eq]:"company-1",status[eq]:"DONE")',
      }),
    );
  });

  it('does not let a quote in the search text change the filter', async () => {
    const findMany = vi.fn(async () => ({ records: [], totalCount: 0, endCursor: null, hasNextPage: false }));

    await listAudits(buildClient({ findMany }), client, { domainContains: 'a"),or(id[neq]:"x' });

    const { filter } = (findMany.mock.calls[0] as unknown as [{ filter: string }])[0];

    expect(filter).toContain('companyId[eq]:"company-1"');
    expect(filter).not.toContain('"),or(');
  });

  it('hides an audit of another company from a client', async () => {
    const findOne = vi.fn(async () => auditRecord({ companyId: 'company-2' }));

    expect(await getAudit(buildClient({ findOne }), client, 'audit-1')).toBeNull();
    expect(await getAudit(buildClient({ findOne }), team, 'audit-1')).toMatchObject({ id: 'audit-1' });
  });

  it('does not load the tasks of an audit the client may not see', async () => {
    const findMany = vi.fn();
    const findOne = vi.fn(async () => auditRecord({ companyId: 'company-2' }));

    const tasks = await listAuditTasks(buildClient({ findMany, findOne }), client, 'audit-1');

    expect(tasks).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('splits the affected urls of a task', async () => {
    const findOne = vi.fn(async () => auditRecord());
    const findMany = vi.fn(async () => ({
      records: [
        { id: 't1', name: 'Fix titles', status: 'OPEN', priority: 'HIGH', affectedUrls: 'https://a.de/\nhttps://a.de/b\n' },
      ],
      totalCount: 1,
      endCursor: null,
      hasNextPage: false,
    }));

    const tasks = await listAuditTasks(buildClient({ findMany, findOne }), team, 'audit-1');

    expect(tasks[0]?.affectedUrls).toEqual(['https://a.de/', 'https://a.de/b']);
  });

  it('only lets the team start audits and change tasks', async () => {
    const create = vi.fn(async () => ({ id: 'new-1' }));
    const update = vi.fn(async () => ({ id: 't1' }));
    const twenty = buildClient({ create, update });

    expect(await startAudit(twenty, client, { domain: 'a.de', language: 'DE' })).toBeNull();
    expect(await updateTaskStatus(twenty, client, 't1', 'DONE')).toBe(false);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    expect(await startAudit(twenty, team, { domain: 'a.de', language: 'DE' })).toEqual({ id: 'new-1' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ domain: 'a.de', status: 'QUEUED', language: 'DE' }) }),
    );
    expect(await updateTaskStatus(twenty, team, 't1', 'DONE')).toBe(true);
  });

  it('counts open tasks for the team only', async () => {
    const findMany = vi.fn(async () => ({ records: [], totalCount: 12, endCursor: null, hasNextPage: false }));
    const twenty = buildClient({ findMany });

    expect(await countOpenTasks(twenty, team)).toBe(12);
    expect(await countOpenTasks(twenty, client)).toBeNull();
    expect(findMany).toHaveBeenCalledTimes(1);
  });
});
