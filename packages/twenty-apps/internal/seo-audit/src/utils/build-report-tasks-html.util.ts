import { MAX_TASK_URLS_IN_REPORT } from 'src/constants/report.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AuditTask } from 'src/types/audit-task';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';
import { renderTaskDescriptionHtml } from 'src/utils/render-task-description-html.util';

const MAX_DETAILED_TASKS = 12;
const MAX_COMPACT_TASKS = 30;
const PAD = 2;

const PRIORITY_CLASS = {
  CRITICAL: 'c-crit',
  HIGH: 'c-crit',
  MEDIUM: 'c-mid',
  LOW: 'c-good',
} as const;

export const buildReportTasksSection = (result: SeoAuditResult): ReportSection | null => {
  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];

  if (result.tasks.length === 0) {
    return {
      id: 'findings',
      eyebrow: design.sections.findings.eyebrow,
      plain: design.sections.findings.plain,
      accent: design.sections.findings.accent,
      lead: labels.noTasks,
      body: '',
    };
  }

  const horizonLabel = (task: AuditTask): string =>
    ({
      WEEK: labels.horizonWeek,
      MONTH: labels.horizonMonth,
      QUARTER: labels.horizonQuarter,
    })[getTaskHorizon(task)];

  const renderFinding = (task: AuditTask, index: number): string => {
    const shownUrls = task.affectedUrls.slice(0, MAX_TASK_URLS_IN_REPORT);
    const hiddenCount = task.affectedUrls.length - shownUrls.length;

    return `<article class="finding ${PRIORITY_CLASS[task.priority]}">
      <div class="head">
        <span class="id">#${String(index + 1).padStart(PAD, '0')}</span>
        <span class="badge">${escapeHtml(labels.priorities[task.priority])}</span>
        <span class="chip">${escapeHtml(labels.areas[task.area])}</span>
      </div>
      <h3>${escapeHtml(task.name)}</h3>
      <dl>
        <dt>${escapeHtml(design.recommendation)}</dt><dd>${renderTaskDescriptionHtml(task.description)}</dd>
        ${
          shownUrls.length === 0
            ? ''
            : `<dt>${escapeHtml(design.affected)}</dt><dd><div class="evidence">${shownUrls
                .map((url) => `<div>${escapeHtml(url)}</div>`)
                .join('')}${hiddenCount > 0 ? `<div>${escapeHtml(htmlLabels.moreItems(hiddenCount))}</div>` : ''}</div></dd>`
        }
        <dt>${escapeHtml(design.horizonLabel)}</dt><dd class="chips"><span class="chip">${escapeHtml(design.effortLabel)}: ${escapeHtml(labels.efforts[task.effort])}</span><span class="chip">${escapeHtml(design.sourceLabel)}: ${escapeHtml(labels.sources[task.source])}</span><span class="chip">${escapeHtml(horizonLabel(task))}</span></dd>
      </dl>
    </article>`;
  };

  const detailed = result.tasks.slice(0, MAX_DETAILED_TASKS);
  const rest = result.tasks.slice(MAX_DETAILED_TASKS, MAX_DETAILED_TASKS + MAX_COMPACT_TASKS);
  const hiddenCount = result.tasks.length - detailed.length - rest.length;

  return {
    id: 'findings',
    eyebrow: design.sections.findings.eyebrow,
    plain: design.sections.findings.plain,
    accent: design.sections.findings.accent,
    lead: design.findingsLead(detailed.length, result.tasks.length),
    body: `${detailed.map((task, index) => renderFinding(task, index)).join('\n')}
    ${
      rest.length === 0
        ? ''
        : `<p class="sub">${escapeHtml(design.moreMeasures)}</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>${escapeHtml(labels.taskColumn)}</th><th>${escapeHtml(labels.areaColumn)}</th><th>${escapeHtml(labels.priorityColumn)}</th><th>${escapeHtml(design.horizonLabel)}</th></tr></thead><tbody>${rest
            .map(
              (task, index) =>
                `<tr><td class="num">${MAX_DETAILED_TASKS + index + 1}</td><td>${escapeHtml(task.name)}</td><td>${escapeHtml(labels.areas[task.area])}</td><td>${escapeHtml(labels.priorities[task.priority])}</td><td>${escapeHtml(horizonLabel(task))}</td></tr>`,
            )
            .join('')}</tbody></table></div>${hiddenCount > 0 ? `<p class="hint">${escapeHtml(htmlLabels.moreItems(hiddenCount))}</p>` : ''}`
    }`,
  };
};
