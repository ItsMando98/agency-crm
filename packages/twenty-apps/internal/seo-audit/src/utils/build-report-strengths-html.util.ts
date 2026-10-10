import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';

export const buildReportStrengthsSection = (result: SeoAuditResult): ReportSection | null => {
  const { strengths } = result.insights;

  if (strengths.length === 0) {
    return null;
  }

  const insightLabels = INSIGHTS_LABELS[result.language];
  const labels = REPORT_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];

  return {
    id: 'strengths',
    eyebrow: design.sections.strengths.eyebrow,
    plain: design.sections.strengths.plain,
    accent: design.sections.strengths.accent,
    body: `<div class="strengths">${strengths
      .map(
        (strength) =>
          `<article class="strength"><b>${escapeHtml(design.strengthTitles[strength.kind])}</b><p>${escapeHtml(insightLabels.describeStrength(strength, labels.areas))}</p></article>`,
      )
      .join('')}</div>`,
  };
};
