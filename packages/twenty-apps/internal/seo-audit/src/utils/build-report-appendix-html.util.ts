import { MAX_REVIEW_ITEMS_IN_REPORT } from 'src/constants/report.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';

export const buildReportAppendixHtml = (result: SeoAuditResult): string => {
  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
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

    return `<h3>${escapeHtml(heading)}</h3><ul class="small-list">${shown
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('')}${hiddenCount > 0 ? `<li>${escapeHtml(htmlLabels.moreItems(hiddenCount))}</li>` : ''}</ul>`;
  };

  const reviewBlock = [
    renderList(htmlLabels.reviewPagesHeading, reviewPages),
    renderList(htmlLabels.reviewKeywordsHeading, reviewKeywords),
  ].join('');

  return `<section class="section">
  ${
    reviewBlock === ''
      ? ''
      : `<h2>${escapeHtml(labels.reviewHeading)}</h2><p class="lead">${escapeHtml(labels.reviewIntro)}</p>${reviewBlock}`
  }
  <div class="keep-together">
    <h3>${escapeHtml(labels.methodologyHeading)}</h3>
    <p class="methodology">${escapeHtml(labels.methodology)}</p>
  </div>
</section>`;
};
