import { type SeoAuditResult } from 'src/types/seo-audit-result';

// What the insight sections read from a result.
export type InsightsSource = Pick<SeoAuditResult, 'language' | 'score' | 'assessments' | 'insights'>;
