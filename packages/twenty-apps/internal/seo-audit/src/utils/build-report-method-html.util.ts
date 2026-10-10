import { MAX_REVIEW_ITEMS_IN_REPORT } from 'src/constants/report.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

export const buildReportMethodSection = (result: SeoAuditResult): ReportSection => {
  const { language } = result;
  const labels = REPORT_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const design = REPORT_DESIGN_LABELS[language];
  const { summary } = result.insights;
  const reviewPages = result.assessments
    .filter((assessment) => assessment.needsReview)
    .map((assessment) => assessment.url);
  const reviewKeywords = result.keywords
    .filter((keyword) => keyword.needsReview && keyword.relevance !== null)
    .map((keyword) => keyword.keyword);

  const renderList = (heading: string, items: string[]): string => {
    if (items.length === 0) {
      return '';
    }

    const shown = items.slice(0, MAX_REVIEW_ITEMS_IN_REPORT);
    const hiddenCount = items.length - shown.length;

    return `<p class="sub">${escapeHtml(heading)}</p><div class="evidence" style="margin-top:14px">${shown
      .map((item) => `<div>${escapeHtml(item)}</div>`)
      .join('')}${hiddenCount > 0 ? `<div>${escapeHtml(htmlLabels.moreItems(hiddenCount))}</div>` : ''}</div>`;
  };

  const card = (title: string, text: string, isWide = false): string =>
    `<div${isWide ? ' class="wide"' : ''}><b>${escapeHtml(title)}</b>${escapeHtml(text)}</div>`;

  const reviewBlock = [
    renderList(htmlLabels.reviewPagesHeading, reviewPages),
    renderList(htmlLabels.reviewKeywordsHeading, reviewKeywords),
  ].join('');

  return {
    id: 'method',
    eyebrow: design.sections.method.eyebrow,
    plain: design.sections.method.plain,
    accent: design.sections.method.accent,
    body: `<div class="method">
      ${card(design.methodCards.crawl, design.methodCrawl(result.pages.length, formatReportDate(result.generatedAt, language)))}
      ${card(design.methodCards.judged, design.methodJudged)}
      ${card(design.methodCards.summary, summary === null ? design.methodNoSummary : design.methodSummary(summary.model, summary.isFullyVerified))}
      ${card(design.methodCards.limits, labels.methodology, true)}
    </div>
    ${
      reviewBlock === ''
        ? ''
        : `<div class="review"><p class="muted">${escapeHtml(labels.reviewIntro)}</p>${reviewBlock}</div>`
    }`,
  };
};
