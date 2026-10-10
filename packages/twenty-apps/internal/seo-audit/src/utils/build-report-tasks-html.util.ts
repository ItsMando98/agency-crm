import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AuditTask } from 'src/types/audit-task';
import { type ReportSection } from 'src/types/report-section';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';

const MAX_DETAILED_FINDINGS = 6;
const MAX_EXAMPLE_URLS = 2;
const PAD = 2;

const PRIORITY_CLASS = {
  CRITICAL: 'c-crit',
  HIGH: 'c-crit',
  MEDIUM: 'c-mid',
  LOW: 'c-good',
} as const;

// Names the problem and what it costs, never the steps to fix it. The steps
// stay in the Markdown and Excel exports for the team.
export const buildReportTasksSection = (result: SeoAuditResult): ReportSection | null => {
  const labels = REPORT_LABELS[result.language];
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

  const renderFinding = (task: AuditTask, index: number): string => {
    const shownUrls = task.affectedUrls.slice(0, MAX_EXAMPLE_URLS);
    const hiddenCount = task.affectedUrls.length - shownUrls.length;

    return `<article class="finding ${PRIORITY_CLASS[task.priority]}">
      <div class="head">
        <span class="id">#${String(index + 1).padStart(PAD, '0')}</span>
        <span class="badge">${escapeHtml(labels.priorities[task.priority])}</span>
        <span class="chip">${escapeHtml(labels.areas[task.area])}</span>
      </div>
      <h3>${escapeHtml(task.name)}</h3>
      <dl>
        <dt>${escapeHtml(design.whyItMatters)}</dt><dd>${escapeHtml(design.areaImpact[task.area])}</dd>
        ${
          shownUrls.length === 0
            ? ''
            : `<dt>${escapeHtml(design.affected)}</dt><dd><div class="evidence">${shownUrls
                .map((url) => `<div>${escapeHtml(url)}</div>`)
                .join('')}${hiddenCount > 0 ? `<div>${escapeHtml(design.affectedMore(hiddenCount))}</div>` : ''}</div></dd>`
        }
      </dl>
    </article>`;
  };

  const detailed = result.tasks.slice(0, MAX_DETAILED_FINDINGS);
  const rest = result.tasks.slice(MAX_DETAILED_FINDINGS);
  const restCountByArea = rest.reduce<Partial<Record<SeoArea, number>>>(
    (counts, task) => ({ ...counts, [task.area]: (counts[task.area] ?? 0) + 1 }),
    {},
  );
  const restAreas = Object.entries(restCountByArea) as [SeoArea, number][];

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
        : `<p class="sub">${escapeHtml(design.otherFindingsHeading)}</p>
    <p class="muted" style="margin-top:12px">${escapeHtml(design.otherFindingsLead(rest.length, restAreas.length))}</p>
    <div class="chips" style="margin-top:16px">${restAreas
      .sort((first, second) => second[1] - first[1])
      .map(([area, count]) => `<span class="chip">${escapeHtml(labels.areas[area])} · ${count}</span>`)
      .join('')}</div>`
    }`,
  };
};
