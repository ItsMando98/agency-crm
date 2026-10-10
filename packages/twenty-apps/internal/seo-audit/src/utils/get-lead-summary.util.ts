import { type SummaryItem } from 'src/types/audit-insights';
import { type SeoAuditResult } from 'src/types/seo-audit-result';

export type LeadSummary = {
  headline: string | null;
  strengths: string[];
  blockers: string[];
  thisWeek: string[];
  thisMonth: string[];
  thisQuarter: string[];
};

const verifiedTexts = (items: SummaryItem[]): string[] =>
  items.filter((item) => item.unverifiedNumbers.length === 0).map((item) => item.text);

// The report goes to people outside the team. A sentence with a number the
// audit cannot back up is left out instead of being shown with a marker.
export const getLeadSummary = (result: SeoAuditResult): LeadSummary | null => {
  const { summary } = result.insights;

  if (summary === null) {
    return null;
  }

  return {
    headline: verifiedTexts([summary.headline])[0] ?? null,
    strengths: verifiedTexts(summary.strengths),
    blockers: verifiedTexts(summary.blockers),
    thisWeek: verifiedTexts(summary.thisWeek),
    thisMonth: verifiedTexts(summary.thisMonth),
    thisQuarter: verifiedTexts(summary.thisQuarter),
  };
};
