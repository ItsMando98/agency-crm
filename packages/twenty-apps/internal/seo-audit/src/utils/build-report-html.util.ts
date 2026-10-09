import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_PRINT_SCRIPT } from 'src/constants/report-print-script.const';
import { type ReportBranding } from 'src/types/report-branding';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildReportAppendixHtml } from 'src/utils/build-report-appendix-html.util';
import { buildReportAiReadinessHtml } from 'src/utils/build-report-ai-readiness-html.util';
import { buildReportAiVisibilityHtml } from 'src/utils/build-report-ai-visibility-html.util';
import { buildReportAreasHtml } from 'src/utils/build-report-areas-html.util';
import { buildReportContentSecurityPolicy } from 'src/utils/build-report-content-security-policy.util';
import { buildReportCoverHtml } from 'src/utils/build-report-cover-html.util';
import { buildReportMarketHtml } from 'src/utils/build-report-market-html.util';
import { buildReportStyles } from 'src/utils/build-report-styles.util';
import { buildReportTasksHtml } from 'src/utils/build-report-tasks-html.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

// A standalone page: inline styles, no external assets. It reads well on
// screen and prints to A4, so the same HTML becomes the PDF.
export const buildReportHtml = (
  result: SeoAuditResult,
  branding: ReportBranding,
): string => {
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const hostname = new URL(result.origin).hostname;
  const footerText = [
    branding.brandName,
    `${htmlLabels.documentTitle} ${hostname}`,
    formatReportDate(result.generatedAt, result.language),
  ]
    .filter((part): part is string => part !== null)
    .join(' · ');

  return `<!doctype html>
<html lang="${result.language === 'DE' ? 'de' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${escapeHtml(buildReportContentSecurityPolicy())}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(`${htmlLabels.documentTitle} ${hostname}`)}</title>
<style>${buildReportStyles({ accentColor: branding.accentColor, footerText, pageWord: htmlLabels.pageWord })}</style>
</head>
<body>
<div class="toolbar"><span>${escapeHtml(htmlLabels.printHint)}</span><button type="button" id="print-report">${escapeHtml(htmlLabels.printButton)}</button></div>
<main class="document">
${buildReportCoverHtml(result, branding)}
${buildReportAreasHtml(result)}
${buildReportTasksHtml(result)}
${buildReportMarketHtml(result)}
${buildReportAiReadinessHtml(result)}
${buildReportAiVisibilityHtml(result)}
${buildReportAppendixHtml(result)}
</main>
<script>${REPORT_PRINT_SCRIPT}</script>
</body>
</html>`;
};
