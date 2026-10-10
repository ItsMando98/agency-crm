import { type Principal } from '~/lib/auth/principal';
import { buildFilter } from '~/lib/twenty/build-filter';
import {
  type Company,
  type CrmTask,
  type CrmTaskStatus,
  type Note,
  type Opportunity,
  type OpportunityStage,
  type Person,
  CRM_TASK_STATUSES,
  OPPORTUNITY_STAGES,
  companySchema,
  crmTaskSchema,
  noteSchema,
  opportunitySchema,
  personSchema,
} from '~/lib/twenty/crm-types';
import { type TwentyClient } from '~/lib/twenty/twenty-client.server';

const LIST_LIMIT = 100;
const RELATED_LIMIT = 50;
const MICROS_PER_UNIT = 1_000_000;

// The CRM is for the team. A client login never reaches these functions with data.
const isTeam = (principal: Principal): boolean => principal.kind === 'TEAM';

type Schema<TOutput> = {
  safeParse: (value: unknown) => { success: true; data: TOutput } | { success: false };
};

const parseAll = <TOutput>(records: unknown[], schema: Schema<TOutput>): TOutput[] =>
  records.flatMap((record) => {
    const parsed = schema.safeParse(record);

    return parsed.success ? [parsed.data] : [];
  });

const idOf = (value: unknown): string | null => {
  const id = (value as { id?: unknown } | null)?.id;

  return typeof id === 'string' ? id : null;
};

const searchCondition = (field: string, search: string | undefined) =>
  search !== undefined && search.trim() !== ''
    ? [{ field, comparator: 'ilike' as const, value: `%${search.trim().replace(/"/g, '')}%` }]
    : [];

export const listCompanies = async (
  client: TwentyClient,
  principal: Principal,
  { search }: { search?: string } = {},
): Promise<{ companies: Company[]; totalCount: number }> => {
  if (!isTeam(principal)) {
    return { companies: [], totalCount: 0 };
  }

  const result = await client.findMany({
    object: 'companies',
    filter: buildFilter(searchCondition('name', search)),
    orderBy: 'name[AscNullsLast]',
    limit: LIST_LIMIT,
  });

  return { companies: parseAll(result.records, companySchema), totalCount: result.totalCount };
};

export const getCompany = async (
  client: TwentyClient,
  principal: Principal,
  companyId: string,
): Promise<Company | null> => {
  if (!isTeam(principal)) {
    return null;
  }

  const record = await client.findOne({ object: 'companies', singular: 'company', id: companyId });
  const parsed = companySchema.safeParse(record);

  return parsed.success ? parsed.data : null;
};

export const createCompany = async (
  client: TwentyClient,
  principal: Principal,
  { name, domain }: { name: string; domain?: string },
): Promise<{ id: string } | null> => {
  if (!isTeam(principal) || name.trim() === '') {
    return null;
  }

  const created = await client.create({
    object: 'companies',
    singular: 'company',
    data: {
      name: name.trim(),
      ...(domain === undefined ? {} : { domainName: { primaryLinkUrl: domain } }),
    },
  });
  const id = idOf(created);

  return id === null ? null : { id };
};

export const listPeople = async (
  client: TwentyClient,
  principal: Principal,
  { companyId, search }: { companyId?: string; search?: string } = {},
): Promise<Person[]> => {
  if (!isTeam(principal)) {
    return [];
  }

  const result = await client.findMany({
    object: 'people',
    filter: buildFilter([
      ...(companyId === undefined ? [] : [{ field: 'companyId', comparator: 'eq' as const, value: companyId }]),
      ...searchCondition('jobTitle', search),
    ]),
    orderBy: 'createdAt[DescNullsLast]',
    limit: LIST_LIMIT,
  });

  return parseAll(result.records, personSchema);
};

export const createPerson = async (
  client: TwentyClient,
  principal: Principal,
  { firstName, lastName, email, jobTitle, companyId }: {
    firstName: string;
    lastName: string;
    email?: string;
    jobTitle?: string;
    companyId?: string;
  },
): Promise<{ id: string } | null> => {
  if (!isTeam(principal) || firstName.trim() === '') {
    return null;
  }

  const created = await client.create({
    object: 'people',
    singular: 'person',
    data: {
      name: { firstName: firstName.trim(), lastName: lastName.trim() },
      ...(email === undefined || email === '' ? {} : { emails: { primaryEmail: email } }),
      ...(jobTitle === undefined || jobTitle === '' ? {} : { jobTitle }),
      ...(companyId === undefined ? {} : { companyId }),
    },
  });
  const id = idOf(created);

  return id === null ? null : { id };
};

export const listOpportunities = async (
  client: TwentyClient,
  principal: Principal,
  { companyId }: { companyId?: string } = {},
): Promise<Opportunity[]> => {
  if (!isTeam(principal)) {
    return [];
  }

  const result = await client.findMany({
    object: 'opportunities',
    filter: buildFilter(
      companyId === undefined ? [] : [{ field: 'companyId', comparator: 'eq', value: companyId }],
    ),
    orderBy: 'createdAt[DescNullsLast]',
    limit: LIST_LIMIT,
  });

  return parseAll(result.records, opportunitySchema);
};

export const createOpportunity = async (
  client: TwentyClient,
  principal: Principal,
  { name, companyId, amount }: { name: string; companyId?: string; amount?: number },
): Promise<{ id: string } | null> => {
  if (!isTeam(principal) || name.trim() === '') {
    return null;
  }

  const created = await client.create({
    object: 'opportunities',
    singular: 'opportunity',
    data: {
      name: name.trim(),
      stage: 'NEW',
      ...(companyId === undefined ? {} : { companyId }),
      ...(amount === undefined
        ? {}
        : { amount: { amountMicros: Math.round(amount * MICROS_PER_UNIT), currencyCode: 'EUR' } }),
    },
  });
  const id = idOf(created);

  return id === null ? null : { id };
};

export const moveOpportunity = async (
  client: TwentyClient,
  principal: Principal,
  opportunityId: string,
  stage: OpportunityStage,
): Promise<boolean> => {
  if (!isTeam(principal) || !OPPORTUNITY_STAGES.includes(stage)) {
    return false;
  }

  const updated = await client.update({
    object: 'opportunities',
    singular: 'opportunity',
    id: opportunityId,
    data: { stage },
  });

  return updated !== null;
};

type TargetKind = 'note' | 'task';

const TARGET_CONFIG = {
  note: { targets: 'noteTargets', item: 'notes', singular: 'note', targetSingular: 'noteTarget', foreignKey: 'noteId' },
  task: { targets: 'taskTargets', item: 'tasks', singular: 'task', targetSingular: 'taskTarget', foreignKey: 'taskId' },
} as const;

const listLinked = async (
  client: TwentyClient,
  kind: TargetKind,
  companyId: string,
): Promise<unknown[]> => {
  const config = TARGET_CONFIG[kind];
  const targets = await client.findMany({
    object: config.targets,
    filter: buildFilter([{ field: 'companyId', comparator: 'eq', value: companyId }]),
    limit: RELATED_LIMIT,
  });
  const ids = targets.records.flatMap((target) => {
    const id = (target as Record<string, unknown>)[config.foreignKey];

    return typeof id === 'string' ? [id] : [];
  });

  if (ids.length === 0) {
    return [];
  }

  const items = await client.findMany({
    object: config.item,
    filter: buildFilter([{ field: 'id', comparator: 'in', value: ids }]),
    orderBy: 'createdAt[DescNullsLast]',
    limit: RELATED_LIMIT,
  });

  return items.records;
};

export const listCompanyNotes = async (
  client: TwentyClient,
  principal: Principal,
  companyId: string,
): Promise<Note[]> =>
  isTeam(principal) ? parseAll(await listLinked(client, 'note', companyId), noteSchema) : [];

export const listCompanyTasks = async (
  client: TwentyClient,
  principal: Principal,
  companyId: string,
): Promise<CrmTask[]> =>
  isTeam(principal) ? parseAll(await listLinked(client, 'task', companyId), crmTaskSchema) : [];

const createLinked = async (
  client: TwentyClient,
  kind: TargetKind,
  companyId: string,
  data: Record<string, unknown>,
): Promise<{ id: string } | null> => {
  const config = TARGET_CONFIG[kind];
  const created = await client.create({ object: config.item, singular: config.singular, data });
  const id = idOf(created);

  if (id === null) {
    return null;
  }

  await client.create({
    object: config.targets,
    singular: config.targetSingular,
    data: { [config.foreignKey]: id, companyId },
  });

  return { id };
};

export const createCompanyNote = async (
  client: TwentyClient,
  principal: Principal,
  companyId: string,
  { title, body }: { title: string; body: string },
): Promise<{ id: string } | null> =>
  !isTeam(principal) || title.trim() === ''
    ? null
    : createLinked(client, 'note', companyId, {
        title: title.trim(),
        bodyV2: { markdown: body },
      });

export const createCompanyTask = async (
  client: TwentyClient,
  principal: Principal,
  companyId: string,
  { title, dueAt }: { title: string; dueAt?: string },
): Promise<{ id: string } | null> =>
  !isTeam(principal) || title.trim() === ''
    ? null
    : createLinked(client, 'task', companyId, {
        title: title.trim(),
        status: 'TODO',
        ...(dueAt === undefined || dueAt === '' ? {} : { dueAt }),
      });

export const updateCrmTaskStatus = async (
  client: TwentyClient,
  principal: Principal,
  taskId: string,
  status: CrmTaskStatus,
): Promise<boolean> => {
  if (!isTeam(principal) || !CRM_TASK_STATUSES.includes(status)) {
    return false;
  }

  const updated = await client.update({
    object: 'tasks',
    singular: 'task',
    id: taskId,
    data: { status },
  });

  return updated !== null;
};
