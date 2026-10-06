import { MAX_TASK_URLS_IN_REPORT } from 'src/constants/report.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AuditTask } from 'src/types/audit-task';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';
import { renderTaskDescriptionHtml } from 'src/utils/render-task-description-html.util';

export const buildReportTasksHtml = (result: SeoAuditResult): string => {
  const labels = REPORT_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const horizons = [
    { key: 'WEEK', heading: labels.horizonWeek },
    { key: 'MONTH', heading: labels.horizonMonth },
    { key: 'QUARTER', heading: labels.horizonQuarter },
  ] as const;

  const renderTask = (task: AuditTask, number: number): string => {
    const shownUrls = task.affectedUrls.slice(0, MAX_TASK_URLS_IN_REPORT);
    const hiddenCount = task.affectedUrls.length - shownUrls.length;

    return `<article class="task">
    <div class="task-meta">
      <span class="chip"><span class="dot dot-${task.priority}"></span><strong>${escapeHtml(labels.priorities[task.priority])}</strong></span>
      <span>${escapeHtml(htmlLabels.effort)}: ${escapeHtml(labels.efforts[task.effort])}</span>
      <span>${escapeHtml(labels.areas[task.area])}</span>
      <span>${escapeHtml(labels.sources[task.source])}</span>
    </div>
    <div class="task-title">${number}. ${escapeHtml(task.name)}</div>
    <div class="task-body">${renderTaskDescriptionHtml(task.description)}</div>
    ${
      shownUrls.length === 0
        ? ''
        : `<div class="urls">${shownUrls.map((url) => `<div>${escapeHtml(url)}</div>`).join('')}${
            hiddenCount > 0 ? `<div>${escapeHtml(htmlLabels.moreItems(hiddenCount))}</div>` : ''
          }</div>`
    }
  </article>`;
  };

  const blocks = horizons.flatMap(({ key, heading }) => {
    const horizonTasks = result.tasks.filter((task) => getTaskHorizon(task) === key);

    return horizonTasks.length === 0
      ? []
      : [
          `<div class="horizon">
    <div class="horizon-head"><h3>${escapeHtml(heading)}</h3><span class="horizon-hint">${escapeHtml(htmlLabels.horizonHints[key])}</span></div>
    ${horizonTasks.map((task) => renderTask(task, result.tasks.indexOf(task) + 1)).join('\n    ')}
  </div>`,
        ];
  });

  return `<section class="section">
  <h2>${escapeHtml(labels.tasksHeading)}</h2>
  ${result.tasks.length === 0 ? `<p class="lead">${escapeHtml(labels.noTasks)}</p>` : blocks.join('\n  ')}
</section>`;
};
