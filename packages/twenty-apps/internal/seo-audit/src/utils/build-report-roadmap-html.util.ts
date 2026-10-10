import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getLeadSummary } from 'src/utils/get-lead-summary.util';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';

const HORIZONS = ['WEEK', 'MONTH', 'QUARTER'] as const;

// Shows how much work each step holds and where it lands, not the task list.
export const buildReportRoadmapSection = (result: SeoAuditResult): ReportSection | null => {
  if (result.tasks.length === 0) {
    return null;
  }

  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];
  const leadSummary = getLeadSummary(result);
  const horizonLabels = {
    WEEK: labels.horizonWeek,
    MONTH: labels.horizonMonth,
    QUARTER: labels.horizonQuarter,
  };
  const summaryItems = {
    WEEK: leadSummary?.thisWeek ?? [],
    MONTH: leadSummary?.thisMonth ?? [],
    QUARTER: leadSummary?.thisQuarter ?? [],
  };

  return {
    id: 'roadmap',
    eyebrow: design.sections.roadmap.eyebrow,
    plain: design.sections.roadmap.plain,
    accent: design.sections.roadmap.accent,
    lead: design.roadmapLead,
    body: `<div class="road">${HORIZONS.map((horizon) => {
      const tasks = result.tasks.filter((task) => getTaskHorizon(task) === horizon);
      const areas = [...new Set(tasks.map((task) => task.area))] as SeoArea[];
      const items = summaryItems[horizon];

      return `<article class="phase">
      <div class="d">${escapeHtml(design.roadmapUnits[horizon])}<small>${escapeHtml(design.roadmapDaysUnit)}</small></div>
      <h3>${escapeHtml(horizonLabels[horizon])}</h3>
      <p class="muted">${escapeHtml(tasks.length === 0 ? design.roadmapNothing : design.roadmapMeasures(tasks.length))}</p>
      ${items.length === 0 ? '' : `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`}
      ${
        areas.length === 0
          ? ''
          : `<div class="chips" style="margin-top:16px">${areas
              .map((area) => `<span class="chip">${escapeHtml(labels.areas[area])}</span>`)
              .join('')}</div>`
      }
      ${
        tasks.length === 0
          ? ''
          : `<p class="res"><span class="tiny">${escapeHtml(design.roadmapResult)}</span><br>${escapeHtml(htmlLabels.horizonHints[horizon])}</p>`
      }
    </article>`;
    }).join('')}</div>`,
  };
};
