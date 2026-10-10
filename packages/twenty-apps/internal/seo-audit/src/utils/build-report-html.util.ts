import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_PRINT_SCRIPT } from 'src/constants/report-print-script.const';
import { type ReportBranding } from 'src/types/report-branding';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildReportAiSection } from 'src/utils/build-report-ai-html.util';
import { buildReportAreasSection } from 'src/utils/build-report-areas-html.util';
import { buildReportClosingHtml } from 'src/utils/build-report-closing-html.util';
import { buildReportContentSecurityPolicy } from 'src/utils/build-report-content-security-policy.util';
import { buildReportHeroHtml } from 'src/utils/build-report-hero-html.util';
import { buildReportMarketSection } from 'src/utils/build-report-market-html.util';
import { buildReportMethodSection } from 'src/utils/build-report-method-html.util';
import { buildReportOpportunitiesSection } from 'src/utils/build-report-opportunities-html.util';
import { buildReportPagesSection } from 'src/utils/build-report-pages-html.util';
import { buildReportRoadmapSection } from 'src/utils/build-report-roadmap-html.util';
import { buildReportStrengthsSection } from 'src/utils/build-report-strengths-html.util';
import { buildReportStyles } from 'src/utils/build-report-styles.util';
import { buildReportSummarySection } from 'src/utils/build-report-summary-html.util';
import { buildReportTasksSection } from 'src/utils/build-report-tasks-html.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { renderReportSection } from 'src/utils/render-report-section.util';

const FIRST_SECTION_NUMBER = 1;

// A standalone page: inline styles, no external assets. It reads well on
// screen and prints to A4, so the same HTML becomes the PDF.
export const buildReportHtml = (result: SeoAuditResult, branding: ReportBranding): string => {
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const hostname = new URL(result.origin).hostname;
  const sections = [
    buildReportSummarySection(result),
    buildReportAreasSection(result),
    buildReportStrengthsSection(result),
    buildReportAiSection(result),
    buildReportTasksSection(result),
    buildReportPagesSection(result),
    buildReportMarketSection(result),
    buildReportOpportunitiesSection(result),
    buildReportRoadmapSection(result),
    buildReportMethodSection(result),
  ].filter((section): section is ReportSection => section !== null);

  return `<!doctype html>
<html lang="${result.language === 'DE' ? 'de' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${escapeHtml(buildReportContentSecurityPolicy())}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(`${htmlLabels.documentTitle} ${hostname}`)}</title>
<style>${buildReportStyles({ accentColor: branding.accentColor })}</style>
</head>
<body>
${buildReportHeroHtml(result, branding)}
<main>
${sections.map((section, index) => renderReportSection(section, FIRST_SECTION_NUMBER + index)).join('\n')}
</main>
${buildReportClosingHtml(result, branding)}
<script>${REPORT_PRINT_SCRIPT}</script>
</body>
</html>`;
};
