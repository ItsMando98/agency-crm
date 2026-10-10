import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SummaryItem } from 'src/types/audit-insights';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { type SeoArea } from 'src/types/seo-area';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';
import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';

type Language = SeoAuditResult['language'];

const itemHtml = (item: SummaryItem, language: Language): string => {
  const marker =
    item.unverifiedNumbers.length === 0
      ? ''
      : `<span class="unverified">${escapeHtml(INSIGHTS_LABELS[language].unverifiedMarker(item.unverifiedNumbers.join(', ')))}</span>`;

  return `${escapeHtml(item.text)}${marker}`;
};

const digestCard = (title: string, items: SummaryItem[], tone: string, language: Language): string =>
  items.length === 0
    ? ''
    : `<article class="digest-card ${tone}"><h3>${escapeHtml(title)}</h3><ul>${items
        .map((item) => `<li>${itemHtml(item, language)}</li>`)
        .join('')}</ul></article>`;

const kpi = (value: string, label: string, isHot = false): string =>
  `<div class="kpi"><div class="num${isHot ? ' hot' : ''}">${escapeHtml(value)}</div><p>${escapeHtml(label)}</p></div>`;

export const buildReportSummarySection = (result: SeoAuditResult): ReportSection => {
  const { language, insights, marketData } = result;
  const design = REPORT_DESIGN_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const labels = REPORT_LABELS[language];
  const insightLabels = INSIGHTS_LABELS[language];
  const rankings = marketData?.rankings ?? null;
  const backlinks = marketData?.backlinks ?? null;
  const criticalCount = result.tasks.filter((task) => task.priority === 'CRITICAL').length;
  const rankedAreas = (Object.entries(result.areaScores) as [SeoArea, number][]).sort(
    (first, second) => second[1] - first[1],
  );
  const fallbackSentence =
    rankedAreas.length > 1
      ? htmlLabels.summarySentence(
          labels.areas[rankedAreas[0][0]],
          rankedAreas[0][1],
          labels.areas[rankedAreas[rankedAreas.length - 1][0]],
          rankedAreas[rankedAreas.length - 1][1],
        )
      : undefined;
  const summary = insights.summary;

  const kpis = [
    kpi(formatNumber(result.pages.length, language), htmlLabels.kpiPages),
    kpi(formatNumber(result.tasks.length, language), htmlLabels.kpiTasks),
    kpi(formatNumber(criticalCount, language), htmlLabels.kpiCritical, criticalCount > 0),
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

  const digest =
    summary === null
      ? ''
      : `<div class="digest">
      ${digestCard(insightLabels.summaryStrengths, summary.strengths, 'c-good', language)}
      ${digestCard(insightLabels.summaryBlockers, summary.blockers, 'c-crit', language)}
      ${digestCard(insightLabels.summaryWeek, summary.thisWeek, '', language)}
      ${digestCard(insightLabels.summaryMonth, summary.thisMonth, '', language)}
      ${digestCard(insightLabels.summaryQuarter, summary.thisQuarter, '', language)}
    </div>`;

  const impact =
    insights.rulesOnlyScore !== null && insights.rulesOnlyScore !== result.score
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
    lead: summary === null ? fallbackSentence : summary.headline.text,
    body: `${
      summary !== null && summary.headline.unverifiedNumbers.length > 0
        ? `<p class="hint">${escapeHtml(insightLabels.unverifiedMarker(summary.headline.unverifiedNumbers.join(', ')))}</p>`
        : ''
    }
    ${digest}
    <div class="kpis">${kpis.join('')}</div>
    ${impact}
    ${result.assessments.length === 0 ? `<p class="hint">${escapeHtml(htmlLabels.contentNotAssessed)}</p>` : ''}`,
    source:
      summary === null
        ? undefined
        : `${insightLabels.summaryWrittenBy(summary.model)} ${summary.isFullyVerified ? insightLabels.summaryAllVerified : insightLabels.summarySomeUnverified}`,
  };
};
