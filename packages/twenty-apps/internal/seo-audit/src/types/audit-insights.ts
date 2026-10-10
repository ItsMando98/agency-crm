import { type SeoArea } from 'src/types/seo-area';

export type Strength =
  | { kind: 'STRONG_AREAS'; areas: { area: SeoArea; score: number }[] }
  | {
      kind: 'TOP_RANKINGS';
      count: number;
      examples: { keyword: string; position: number; searchVolume: number }[];
    }
  | { kind: 'HELPFUL_PAGES'; count: number; total: number }
  | { kind: 'AI_READINESS'; passed: ('CRAWLERS' | 'LLMS_TXT' | 'ORGANIZATION' | 'FAQ')[] }
  | { kind: 'AI_PRESENCE'; ratePercent: number; queriesTested: number };

// Share of page judgements the classifier was sure about.
export type AssessmentConfidence = {
  total: number;
  definitive: number;
  sharePercent: number | null;
};

export type CompetingPageGroup = { topic: string; urls: string[] };

export type MissingLocation = {
  place: string;
  searchVolume: number;
  keywords: string[];
};

export type SummaryItem = {
  text: string;
  // Numbers in the text that no fact of the audit backs up.
  unverifiedNumbers: string[];
};

export type AuditSummary = {
  model: string;
  headline: SummaryItem;
  strengths: SummaryItem[];
  blockers: SummaryItem[];
  thisWeek: SummaryItem[];
  thisMonth: SummaryItem[];
  thisQuarter: SummaryItem[];
  isFullyVerified: boolean;
};

export type AuditInsights = {
  // The score the measured rules alone would give, without any judgement of the classifier.
  rulesOnlyScore: number | null;
  confidence: AssessmentConfidence;
  strengths: Strength[];
  competingPages: CompetingPageGroup[];
  missingLocations: MissingLocation[];
  summary: AuditSummary | null;
};
