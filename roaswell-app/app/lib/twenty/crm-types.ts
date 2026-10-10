import { z } from 'zod';

const nullableString = z.string().nullish().transform((value) => value ?? null);

const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

export const OPPORTUNITY_STAGES = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'] as const;
export const CRM_TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];
export type CrmTaskStatus = (typeof CRM_TASK_STATUSES)[number];

const MICROS_PER_UNIT = 1_000_000;

export const companySchema = z
  .object({
    id: z.string(),
    name: nullableString,
    domainName: z.unknown().optional(),
    address: z.unknown().optional(),
    employees: z.number().nullish().transform((value) => value ?? null),
    createdAt: nullableString,
  })
  .transform((raw) => ({
    id: raw.id,
    name: raw.name,
    domain: text(record(raw.domainName).primaryLinkUrl),
    city: text(record(raw.address).addressCity),
    employees: raw.employees,
    createdAt: raw.createdAt,
  }));

export type Company = z.infer<typeof companySchema>;

export const personSchema = z
  .object({
    id: z.string(),
    name: z.unknown().optional(),
    emails: z.unknown().optional(),
    phones: z.unknown().optional(),
    jobTitle: nullableString,
    city: nullableString,
    companyId: nullableString,
  })
  .transform((raw) => {
    const name = record(raw.name);
    const firstName = text(name.firstName) ?? '';
    const lastName = text(name.lastName) ?? '';

    return {
      id: raw.id,
      fullName: `${firstName} ${lastName}`.trim() || 'Ohne Namen',
      email: text(record(raw.emails).primaryEmail),
      phone: text(record(raw.phones).primaryPhoneNumber),
      jobTitle: raw.jobTitle,
      city: raw.city,
      companyId: raw.companyId,
    };
  });

export type Person = z.infer<typeof personSchema>;

export const opportunitySchema = z
  .object({
    id: z.string(),
    name: nullableString,
    stage: z.string().nullish(),
    amount: z.unknown().optional(),
    closeDate: nullableString,
    companyId: nullableString,
    pointOfContactId: nullableString,
  })
  .transform((raw) => {
    const amount = record(raw.amount);
    const micros = typeof amount.amountMicros === 'number' ? amount.amountMicros : null;

    return {
      id: raw.id,
      name: raw.name,
      stage: OPPORTUNITY_STAGES.find((stage) => stage === raw.stage) ?? 'NEW',
      amount: micros === null ? null : micros / MICROS_PER_UNIT,
      currency: text(amount.currencyCode) ?? 'EUR',
      closeDate: raw.closeDate,
      companyId: raw.companyId,
      pointOfContactId: raw.pointOfContactId,
    };
  });

export type Opportunity = z.infer<typeof opportunitySchema>;

export const noteSchema = z
  .object({ id: z.string(), title: nullableString, bodyV2: z.unknown().optional(), createdAt: nullableString })
  .transform((raw) => ({
    id: raw.id,
    title: raw.title,
    body: text(record(raw.bodyV2).markdown),
    createdAt: raw.createdAt,
  }));

export type Note = z.infer<typeof noteSchema>;

export const crmTaskSchema = z
  .object({
    id: z.string(),
    title: nullableString,
    bodyV2: z.unknown().optional(),
    dueAt: nullableString,
    status: z.string().nullish(),
  })
  .transform((raw) => ({
    id: raw.id,
    title: raw.title,
    body: text(record(raw.bodyV2).markdown),
    dueAt: raw.dueAt,
    status: CRM_TASK_STATUSES.find((status) => status === raw.status) ?? 'TODO',
  }));

export type CrmTask = z.infer<typeof crmTaskSchema>;
