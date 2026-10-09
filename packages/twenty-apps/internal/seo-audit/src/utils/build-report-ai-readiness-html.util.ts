import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildAiReadinessDisplayRows } from 'src/utils/build-ai-readiness-display-rows.util';
import { escapeHtml } from 'src/utils/escape-html.util';

export const buildReportAiReadinessHtml = (result: SeoAuditResult): string => {
  const labels = REPORT_LABELS[result.language];
  const rows = buildAiReadinessDisplayRows(result.aiReadiness, result.language);

  return `<section class="section"><h2>${escapeHtml(labels.aiReadinessHeading)}</h2>
<p class="lead">${escapeHtml(labels.aiReadinessIntro)}</p>
<div class="keep-together"><table><thead><tr><th>${escapeHtml(labels.aiReadinessCheckColumn)}</th><th>${escapeHtml(labels.aiReadinessStatusColumn)}</th></tr></thead><tbody>${rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`,
    )
    .join('')}</tbody></table></div></section>`;
};
