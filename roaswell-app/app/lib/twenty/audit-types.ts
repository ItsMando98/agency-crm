import { z } from 'zod';

const nullableString = z.string().nullish().transform((value) => value ?? null);
const nullableNumber = z.number().nullish().transform((value) => value ?? null);

export const AUDIT_STATUSES = ['QUEUED', 'RUNNING', 'DONE', 'FAILED'] as const;
export const TASK_STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE', 'WONT_FIX'] as const;
export const TASK_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export type AuditStatus = (typeof AUDIT_STATUSES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

const auditStatus = z
  .string()
  .nullish()
  .transform((value): AuditStatus =>
    AUDIT_STATUSES.find((status) => status === value) ?? 'QUEUED',
  );

const areaScores = z
  .record(z.string(), z.unknown())
  .nullish()
  .transform((value): Record<string, number> =>
    Object.fromEntries(
      Object.entries(value ?? {}).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number',
      ),
    ),
  );

export const auditSummarySchema = z.object({
  id: z.string(),
  name: nullableString,
  domain: nullableString,
  status: auditStatus,
  score: nullableNumber,
  grade: nullableString,
  areaScores,
  pagesCrawled: nullableNumber,
  companyId: nullableString,
  createdAt: nullableString,
  finishedAt: nullableString,
  aiPresenceRate: nullableNumber,
  mobilePerformanceScore: nullableNumber,
});

export type AuditSummary = z.infer<typeof auditSummarySchema>;

const aiAnswerStatus = z.enum(['CITED', 'MENTIONED', 'ABSENT', 'UNKNOWN']);

export const aiVisibilitySchema = z.object({
  rows: z.array(
    z.object({
      query: z.string(),
      results: z.record(z.string(), aiAnswerStatus),
      instead: z.array(z.string()).default([]),
    }),
  ),
  engines: z.array(z.string()).default([]),
  presenceRate: z.number().nullable().default(null),
  queriesTested: z.number().default(0),
  testedAt: z.string().nullable().default(null),
  costUsd: z.number().default(0),
  notes: z.array(z.string()).default([]),
});

export type AiVisibility = z.infer<typeof aiVisibilitySchema>;

export const auditDetailSchema = auditSummarySchema.extend({
  language: nullableString,
  failureReason: nullableString,
  startedAt: nullableString,
  reportUrl: nullableString,
  shareToken: nullableString,
  aiQueriesTested: nullableNumber,
  organicKeywordCount: nullableNumber,
  estimatedMonthlyTraffic: nullableNumber,
  backlinkCount: nullableNumber,
  referringDomainCount: nullableNumber,
  mobileLcpMs: nullableNumber,
  mobileCls: nullableNumber,
  mobileTbtMs: nullableNumber,
  marketDataNotes: nullableString,
  exportNotes: nullableString,
  insights: z.unknown().optional().transform((value): AuditInsights | null => {
    const parsed = insightsSchema.safeParse(value);

    return parsed.success ? parsed.data : null;
  }),
  aiVisibility: z.unknown().optional().transform((value): AiVisibility | null => {
    const parsed = aiVisibilitySchema.safeParse(value);

    return parsed.success ? parsed.data : null;
  }),
});

export type AuditDetail = z.infer<typeof auditDetailSchema>;

export const auditTaskSchema = z.object({
  id: z.string(),
  name: nullableString,
  description: nullableString,
  status: z
    .string()
    .nullish()
    .transform((value): TaskStatus => TASK_STATUSES.find((status) => status === value) ?? 'OPEN'),
  priority: z
    .string()
    .nullish()
    .transform((value): TaskPriority => TASK_PRIORITIES.find((priority) => priority === value) ?? 'MEDIUM'),
  effort: nullableString,
  area: nullableString,
  source: nullableString,
  affectedUrls: z
    .string()
    .nullish()
    .transform((value) => (value ?? '').split('\n').map((url) => url.trim()).filter((url) => url !== '')),
});

export type AuditTask = z.infer<typeof auditTaskSchema>;

export const keywordSchema = z.object({
  id: z.string(),
  keyword: nullableString,
  rankPosition: nullableNumber,
  searchVolume: nullableNumber,
  estimatedTraffic: nullableNumber,
  url: nullableString,
  category: nullableString,
});

export type AuditKeyword = z.infer<typeof keywordSchema>;

const summaryItemSchema = z.object({
  text: z.string(),
  unverifiedNumbers: z.array(z.string()).default([]),
});

export type SummaryItem = z.infer<typeof summaryItemSchema>;

const strengthSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('STRONG_AREAS'),
    areas: z.array(z.object({ area: z.string(), score: z.number() })),
  }),
  z.object({
    kind: z.literal('TOP_RANKINGS'),
    count: z.number(),
    examples: z.array(z.object({ keyword: z.string(), position: z.number(), searchVolume: z.number() })),
  }),
  z.object({ kind: z.literal('HELPFUL_PAGES'), count: z.number(), total: z.number() }),
  z.object({ kind: z.literal('AI_READINESS'), passed: z.array(z.string()) }),
  z.object({ kind: z.literal('AI_PRESENCE'), ratePercent: z.number(), queriesTested: z.number() }),
]);

export type Strength = z.infer<typeof strengthSchema>;

export const insightsSchema = z.object({
  rulesOnlyScore: z.number().nullable().default(null),
  confidence: z
    .object({
      total: z.number().default(0),
      definitive: z.number().default(0),
      sharePercent: z.number().nullable().default(null),
    })
    .default({ total: 0, definitive: 0, sharePercent: null }),
  strengths: z
    .array(z.unknown())
    .default([])
    .transform((items) =>
      items.flatMap((item) => {
        const parsed = strengthSchema.safeParse(item);

        return parsed.success ? [parsed.data] : [];
      }),
    ),
  competingPages: z
    .array(z.object({ topic: z.string(), urls: z.array(z.string()) }))
    .default([]),
  missingLocations: z
    .array(z.object({ place: z.string(), searchVolume: z.number(), keywords: z.array(z.string()) }))
    .default([]),
  summary: z
    .object({
      model: z.string(),
      headline: summaryItemSchema,
      strengths: z.array(summaryItemSchema).default([]),
      blockers: z.array(summaryItemSchema).default([]),
      thisWeek: z.array(summaryItemSchema).default([]),
      thisMonth: z.array(summaryItemSchema).default([]),
      thisQuarter: z.array(summaryItemSchema).default([]),
      isFullyVerified: z.boolean().default(false),
    })
    .nullable()
    .default(null),
});

export type AuditInsights = z.infer<typeof insightsSchema>;

export const pageAssessmentSchema = z.object({
  id: z.string(),
  url: nullableString,
  title: nullableString,
  pageType: nullableString,
  searchIntent: nullableString,
  helpfulness: nullableNumber,
  specificity: nullableNumber,
  trust: nullableNumber,
  needsReview: z.boolean().nullish().transform((value) => value ?? false),
});

export type AuditPage = z.infer<typeof pageAssessmentSchema>;
