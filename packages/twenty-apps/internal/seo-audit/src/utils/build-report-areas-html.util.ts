import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getScoreBand } from 'src/utils/get-score-band.util';

export const buildReportAreasHtml = (result: SeoAuditResult): string => {
  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const rankedAreas = (Object.entries(result.areaScores) as [SeoArea, number][]).sort(
    (first, second) => second[1] - first[1],
  );

  return `<section class="section keep-together">
  <h2>${escapeHtml(labels.areasHeading)}</h2>
  <p class="lead">${escapeHtml(htmlLabels.areasIntro)}</p>
  ${rankedAreas
    .map(([area, score]) => {
      const band = getScoreBand(score);

      return `<div class="meter-row">
    <span class="meter-label">${escapeHtml(labels.areas[area])}</span>
    <div class="meter-track"><div class="meter-fill" style="width: ${Math.max(0, Math.min(100, score))}%"></div></div>
    <span class="meter-value"><strong>${score}</strong><span class="band"><span class="dot dot-${band}"></span>${escapeHtml(htmlLabels.bands[band])}</span></span>
  </div>`;
    })
    .join('\n  ')}
</section>`;
};
