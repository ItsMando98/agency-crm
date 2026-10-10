import { type Principal } from '~/lib/auth/principal';
import {
  type AuditDetail,
  type AuditKeyword,
  type AuditStatus,
  type AuditSummary,
  type AuditTask,
  type TaskStatus,
  auditDetailSchema,
  auditSummarySchema,
  auditTaskSchema,
  keywordSchema,
  pageAssessmentSchema,
  type AuditPage,
  TASK_STATUSES,
} from '~/lib/twenty/audit-types';
import { buildFilter } from '~/lib/twenty/build-filter';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const AUDIT_OBJECT = 'seoAudits';
const AUDIT_SINGULAR = 'seoAudit';
const MAX_LIST_LIMIT = 100;
const DEFAULT_LIST_LIMIT = 25;
const MAX_TASKS = 200;
const MAX_KEYWORDS = 100;

type Condition = Parameters<typeof buildFilter>[0][number];

// A client can only ever see audits of their own company.
const scopeConditions = (principal: Principal): Condition[] =>
  principal.kind === 'CLIENT'
    ? [{ field: 'companyId', comparator: 'eq', value: principal.companyId }]
    : [];

const canSee = (principal: Principal, audit: { companyId: string | null }): boolean =>
  principal.kind === 'TEAM' || audit.companyId === principal.companyId;

export type ListAuditsParams = {
  status?: AuditStatus;
  companyId?: string;
  domainContains?: string;
  limit?: number;
  startingAfter?: string;
};

export const listAudits = async (
  client: TwentyClient,
  principal: Principal,
  { status, companyId, domainContains, limit = DEFAULT_LIST_LIMIT, startingAfter }: ListAuditsParams = {},
): Promise<{ audits: AuditSummary[]; totalCount: number; endCursor: string | null; hasNextPage: boolean }> => {
  const conditions: Condition[] = [...scopeConditions(principal)];

  if (status !== undefined) {
    conditions.push({ field: 'status', comparator: 'eq', value: status });
  }

  // For a client the scope condition above already pins this to their company.
  if (companyId !== undefined && principal.kind === 'TEAM') {
    conditions.push({ field: 'companyId', comparator: 'eq', value: companyId });
  }

  if (domainContains !== undefined && domainContains.trim() !== '') {
    conditions.push({
      field: 'domain',
      comparator: 'ilike',
      value: `%${domainContains.trim().replace(/"/g, '')}%`,
    });
  }

  const result = await client.findMany({
    object: AUDIT_OBJECT,
    filter: buildFilter(conditions),
    orderBy: 'createdAt[DescNullsLast]',
    limit: Math.min(limit, MAX_LIST_LIMIT),
    startingAfter,
  });

  return {
    audits: result.records.flatMap((record) => {
      const parsed = auditSummarySchema.safeParse(record);

      return parsed.success ? [parsed.data] : [];
    }),
    totalCount: result.totalCount,
    endCursor: result.endCursor,
    hasNextPage: result.hasNextPage,
  };
};

export const getAudit = async (
  client: TwentyClient,
  principal: Principal,
  auditId: string,
): Promise<AuditDetail | null> => {
  const record = await client.findOne({
    object: AUDIT_OBJECT,
    singular: AUDIT_SINGULAR,
    id: auditId,
  });
  const parsed = auditDetailSchema.safeParse(record);

  if (!parsed.success || !canSee(principal, parsed.data)) {
    return null;
  }

  return parsed.data;
};

export const listAuditTasks = async (
  client: TwentyClient,
  principal: Principal,
  auditId: string,
): Promise<AuditTask[]> => {
  if ((await getAudit(client, principal, auditId)) === null) {
    return [];
  }

  const result = await client.findMany({
    object: 'seoAuditTasks',
    filter: buildFilter([{ field: 'seoAuditId', comparator: 'eq', value: auditId }]),
    orderBy: 'createdAt[AscNullsLast]',
    limit: MAX_TASKS,
  });

  return result.records.flatMap((record) => {
    const parsed = auditTaskSchema.safeParse(record);

    return parsed.success ? [parsed.data] : [];
  });
};

export const listAuditKeywords = async (
  client: TwentyClient,
  principal: Principal,
  auditId: string,
): Promise<AuditKeyword[]> => {
  if ((await getAudit(client, principal, auditId)) === null) {
    return [];
  }

  const result = await client.findMany({
    object: 'seoKeywordOpportunities',
    filter: buildFilter([{ field: 'seoAuditId', comparator: 'eq', value: auditId }]),
    orderBy: 'searchVolume[DescNullsLast]',
    limit: MAX_KEYWORDS,
  });

  return result.records.flatMap((record) => {
    const parsed = keywordSchema.safeParse(record);

    return parsed.success ? [parsed.data] : [];
  });
};

export const startAudit = async (
  client: TwentyClient,
  principal: Principal,
  { domain, language, companyId }: { domain: string; language: 'DE' | 'EN'; companyId?: string },
): Promise<{ id: string } | null> => {
  if (principal.kind === 'CLIENT') {
    return null;
  }

  const created = await client.create({
    object: AUDIT_OBJECT,
    singular: AUDIT_SINGULAR,
    data: {
      name: `${domain} ${new Date().toISOString().slice(0, 10)}`,
      domain,
      language,
      status: 'QUEUED',
      ...(companyId === undefined ? {} : { companyId }),
    },
  });
  const id = (created as { id?: unknown } | null)?.id;

  return typeof id === 'string' ? { id } : null;
};

export const updateTaskStatus = async (
  client: TwentyClient,
  principal: Principal,
  taskId: string,
  status: TaskStatus,
): Promise<boolean> => {
  if (principal.kind === 'CLIENT' || !TASK_STATUSES.includes(status)) {
    return false;
  }

  const updated = await client.update({
    object: 'seoAuditTasks',
    singular: 'seoAuditTask',
    id: taskId,
    data: { status },
  });

  return updated !== null;
};

// The team sees every open task. Clients get no number, because a task does
// not carry its company and counting through the audit would need a second query.
export const countOpenTasks = async (
  client: TwentyClient,
  principal: Principal,
): Promise<number | null> => {
  if (principal.kind === 'CLIENT') {
    return null;
  }

  const result = await client.findMany({
    object: 'seoAuditTasks',
    filter: buildFilter([
      { field: 'status', comparator: 'in', value: ['OPEN', 'IN_PROGRESS'] },
    ]),
    limit: 1,
  });

  return result.totalCount;
};

export const getPreviousAudit = async (
  client: TwentyClient,
  principal: Principal,
  audit: Pick<AuditDetail, 'domain' | 'createdAt' | 'id'>,
): Promise<AuditSummary | null> => {
  if (audit.domain === null || audit.createdAt === null) {
    return null;
  }

  const result = await client.findMany({
    object: AUDIT_OBJECT,
    filter: buildFilter([
      ...scopeConditions(principal),
      { field: 'domain', comparator: 'eq', value: audit.domain },
      { field: 'status', comparator: 'eq', value: 'DONE' },
      { field: 'createdAt', comparator: 'lt', value: audit.createdAt },
    ]),
    orderBy: 'createdAt[DescNullsLast]',
    limit: 1,
  });
  const parsed = auditSummarySchema.safeParse(result.records[0]);

  return parsed.success ? parsed.data : null;
};

const MAX_PAGES = 200;

export const listAuditPages = async (
  client: TwentyClient,
  principal: Principal,
  auditId: string,
): Promise<AuditPage[]> => {
  if ((await getAudit(client, principal, auditId)) === null) {
    return [];
  }

  const result = await client.findMany({
    object: 'seoAuditPages',
    filter: buildFilter([{ field: 'seoAuditId', comparator: 'eq', value: auditId }]),
    limit: MAX_PAGES,
  });

  return result.records.flatMap((record) => {
    const parsed = pageAssessmentSchema.safeParse(record);

    return parsed.success && parsed.data.helpfulness !== null ? [parsed.data] : [];
  });
};
