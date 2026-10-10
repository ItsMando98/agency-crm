import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';
import { getLeadSummary } from 'src/utils/get-lead-summary.util';

const digestCard = (title: string, items: string[], tone: string): string =>
  items.length === 0
    ? ''
    : `<article class="digest-card ${tone}"><h3>${escapeHtml(title)}</h3><ul>${items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul></article>`;

const kpi = (value: string, label: string, isHot = false): string =>
  `<div class="kpi"><div class="num${isHot ? ' hot' : ''}">${escapeHtml(value)}</div><p>${escapeHtml(label)}</p></div>`;

export const buildReportSummarySection = (result: SeoAuditResult): ReportSection => {
  const { language, insights, marketData } = result;
  const design = REPORT_DESIGN_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const insightLabels = INSIGHTS_LABELS[language];
  const leadSummary = getLeadSummary(result);
  const rankings = marketData?.rankings ?? null;
  const backlinks = marketData?.backlinks ?? null;
  const criticalCount = result.tasks.filter((task) => task.priority === 'CRITICAL').length;

  const kpis = [
    kpi(formatNumber(result.pages.length, language), htmlLabels.kpiPages),
    kpi(formatNumber(result.tasks.length, language), htmlLabels.kpiTasks),
    ...(criticalCount === 0 ? [] : [kpi(formatNumber(criticalCount, language), htmlLabels.kpiCritical, true)]),
    ...(rankings === null
      ? []
      : [
          kpi(formatNumber(rankings.totalKeywords, language), htmlLabels.kpiKeywords),
          kpi(formatNumber(rankings.estimatedMonthlyTraffic, language), htmlLabels.kpiTraffic),
        ]),
    ...(backlinks === null
      ? []
      : [kpi(formatNumber(backlinks.backlinks, language), htmlLabels.kpiBacklinks)]),
  ];

  const digest = [
    leadSummary === null ? '' : digestCard(insightLabels.summaryStrengths, leadSummary.strengths, 'c-good'),
    leadSummary === null ? '' : digestCard(insightLabels.summaryBlockers, leadSummary.blockers, 'c-crit'),
  ].join('');

  const impact =
    insights.rulesOnlyScore !== null && insights.rulesOnlyScore > result.score
      ? `<div class="impact">
      <div>
        <div class="eyebrow" style="margin-bottom:12px">${escapeHtml(design.impactEyebrow)}</div>
        <h3>${escapeHtml(design.impactTitle(insights.rulesOnlyScore, result.score))}</h3>
        <p class="muted" style="margin-top:10px;font-size:14px">${escapeHtml(design.impactHint)}</p>
      </div>
      <div class="num">${insights.rulesOnlyScore} → ${result.score}</div>
    </div>`
      : '';

  return {
    id: 'summary',
    eyebrow: design.sections.summary.eyebrow,
    plain: design.sections.summary.plain,
    accent: design.sections.summary.accent,
    body: `${digest === '' ? '' : `<div class="digest">${digest}</div>`}
    <div class="kpis">${kpis.join('')}</div>
    ${impact}
    ${result.assessments.length === 0 ? `<p class="hint">${escapeHtml(htmlLabels.contentNotAssessed)}</p>` : ''}`,
  };
};
