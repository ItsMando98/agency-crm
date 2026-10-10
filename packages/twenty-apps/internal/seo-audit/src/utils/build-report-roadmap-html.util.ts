import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';

const HORIZONS = ['WEEK', 'MONTH', 'QUARTER'] as const;
const MAX_TASKS_PER_PHASE = 5;

export const buildReportRoadmapSection = (result: SeoAuditResult): ReportSection | null => {
  if (result.tasks.length === 0) {
    return null;
  }

  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];
  const horizonLabels = {
    WEEK: labels.horizonWeek,
    MONTH: labels.horizonMonth,
    QUARTER: labels.horizonQuarter,
  };

  return {
    id: 'roadmap',
    eyebrow: design.sections.roadmap.eyebrow,
    plain: design.sections.roadmap.plain,
    accent: design.sections.roadmap.accent,
    body: `<div class="road">${HORIZONS.map((horizon) => {
      const tasks = result.tasks.filter((task) => getTaskHorizon(task) === horizon);
      const hiddenCount = tasks.length - MAX_TASKS_PER_PHASE;

      return `<article class="phase">
      <div class="d">${escapeHtml(design.roadmapUnits[horizon])}<small>${escapeHtml(design.roadmapDaysUnit)}</small></div>
      <h3>${escapeHtml(horizonLabels[horizon])}</h3>
      <ul>${tasks
        .slice(0, MAX_TASKS_PER_PHASE)
        .map((task) => `<li>${escapeHtml(task.name)}</li>`)
        .join('')}${hiddenCount > 0 ? `<li>${escapeHtml(htmlLabels.moreItems(hiddenCount))}</li>` : ''}</ul>
      <p class="res"><span class="tiny">${escapeHtml(design.roadmapResult)}</span><br>${escapeHtml(htmlLabels.horizonHints[horizon])}</p>
    </article>`;
    }).join('')}</div>`,
  };
};
