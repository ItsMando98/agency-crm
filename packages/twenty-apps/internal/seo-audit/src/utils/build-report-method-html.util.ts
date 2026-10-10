import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

// Names no models, tools or data providers. The technical notes stay in the
// Markdown report for the team.
export const buildReportMethodSection = (result: SeoAuditResult): ReportSection => {
  const { language } = result;
  const design = REPORT_DESIGN_LABELS[language];
  const hasSummary = result.insights.summary !== null;

  const card = (title: string, text: string, isWide = false): string =>
    `<div${isWide ? ' class="wide"' : ''}><b>${escapeHtml(title)}</b>${escapeHtml(text)}</div>`;

  return {
    id: 'method',
    eyebrow: design.sections.method.eyebrow,
    plain: design.sections.method.plain,
    accent: design.sections.method.accent,
    body: `<div class="method">
      ${card(design.methodCards.crawl, design.methodCrawl(result.pages.length, formatReportDate(result.generatedAt, language)))}
      ${card(design.methodCards.judged, design.methodJudged)}
      ${hasSummary ? card(design.methodCards.summary, design.methodSummary) : ''}
      ${card(design.methodCards.limits, design.methodLimits, true)}
    </div>`,
  };
};
