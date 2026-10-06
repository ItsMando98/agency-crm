import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportBranding } from 'src/types/report-branding';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

type Tile = { label: string; value: string };

export const buildReportCoverHtml = (
  result: SeoAuditResult,
  branding: ReportBranding,
): string => {
  const { language } = result;
  const labels = REPORT_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const rankedAreas = (Object.entries(result.areaScores) as [SeoArea, number][]).sort(
    (first, second) => second[1] - first[1],
  );
  const criticalCount = result.tasks.filter((task) => task.priority === 'CRITICAL').length;
  const rankings = result.marketData?.rankings ?? null;
  const backlinks = result.marketData?.backlinks ?? null;

  const tiles: Tile[] = [
    { label: htmlLabels.kpiPages, value: formatNumber(result.pages.length, language) },
    { label: htmlLabels.kpiTasks, value: formatNumber(result.tasks.length, language) },
    { label: htmlLabels.kpiCritical, value: formatNumber(criticalCount, language) },
    ...(rankings === null
      ? []
      : [
          { label: htmlLabels.kpiKeywords, value: formatNumber(rankings.totalKeywords, language) },
          {
            label: htmlLabels.kpiTraffic,
            value: formatNumber(rankings.estimatedMonthlyTraffic, language),
          },
        ]),
    ...(backlinks === null
      ? []
      : [{ label: htmlLabels.kpiBacklinks, value: formatNumber(backlinks.backlinks, language) }]),
  ];

  const summary =
    rankedAreas.length > 1
      ? htmlLabels.summarySentence(
          labels.areas[rankedAreas[0][0]],
          rankedAreas[0][1],
          labels.areas[rankedAreas[rankedAreas.length - 1][0]],
          rankedAreas[rankedAreas.length - 1][1],
        )
      : '';

  return `<section class="cover">
  <div class="eyebrow">${escapeHtml(htmlLabels.documentTitle)}${
    branding.brandName === null
      ? ''
      : ` · ${escapeHtml(htmlLabels.preparedBy)} ${escapeHtml(branding.brandName)}`
  }</div>
  <h1 class="domain">${escapeHtml(new URL(result.origin).hostname)}</h1>
  <div class="meta">${escapeHtml(formatReportDate(result.generatedAt, language))}</div>
  <div class="hero" aria-label="${escapeHtml(htmlLabels.overallScore)}">
    <span class="hero-score">${result.score}</span>
    <span class="hero-unit">${escapeHtml(htmlLabels.outOf)}</span>
    <span class="grade">${escapeHtml(htmlLabels.gradeLabel)} ${escapeHtml(result.grade)}</span>
  </div>
  ${summary === '' ? '' : `<p class="summary">${escapeHtml(summary)}</p>`}
  <div class="tiles" style="--tile-columns: ${tiles.length === 4 ? 4 : Math.min(tiles.length, 3)}">
    ${tiles
      .map(
        (tile) =>
          `<div class="tile"><div class="tile-label">${escapeHtml(tile.label)}</div><div class="tile-value">${escapeHtml(tile.value)}</div></div>`,
      )
      .join('\n    ')}
  </div>
  ${
    result.assessments.length === 0
      ? `<p class="note">${escapeHtml(htmlLabels.contentNotAssessed)}</p>`
      : ''
  }
</section>`;
};
