import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { AREA_WEIGHTS } from 'src/constants/score-weights.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { type SeoArea } from 'src/types/seo-area';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getBandClass } from 'src/utils/get-band-class.util';
import { getScoreBand } from 'src/utils/get-score-band.util';

const MAX_SCORE = 100;

export const buildReportAreasSection = (result: SeoAuditResult): ReportSection => {
  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];
  const rankedAreas = (Object.entries(result.areaScores) as [SeoArea, number][]).sort(
    (first, second) => first[1] - second[1],
  );
  const totalWeight = rankedAreas.reduce((sum, [area]) => sum + AREA_WEIGHTS[area], 0);

  return {
    id: 'scorecard',
    eyebrow: design.sections.scorecard.eyebrow,
    plain: design.sections.scorecard.plain,
    accent: design.sections.scorecard.accent,
    lead: design.scorecardLead,
    body: `<div class="cats">${rankedAreas
      .map(([area, score]) => {
        const band = getScoreBand(score);
        const taskCount = result.tasks.filter((task) => task.area === area).length;
        const weight = totalWeight === 0 ? 0 : Math.round((AREA_WEIGHTS[area] / totalWeight) * MAX_SCORE);

        return `<article class="cat ${getBandClass(band)}"><header><b>${escapeHtml(labels.areas[area])} <span class="tiny">${weight} %</span></b><em>${score}</em></header><div class="bar"><i style="--v:${Math.max(0, Math.min(MAX_SCORE, score))}"></i></div><p>${escapeHtml(htmlLabels.bands[band])}${taskCount === 0 ? '' : ` · ${escapeHtml(design.tasksInArea(taskCount))}`}</p></article>`;
      })
      .join('')}</div>`,
  };
};
