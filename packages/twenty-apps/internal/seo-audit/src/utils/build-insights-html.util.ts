import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SummaryItem } from 'src/types/audit-insights';
import { type InsightsSource } from 'src/types/insights-source';
import { escapeHtml } from 'src/utils/escape-html.util';
import { sortWeakestFirst } from 'src/utils/sort-weakest-first.util';

const MAX_HEATMAP_ROWS = 25;
const MAX_CARDS = 5;

const itemHtml = (item: SummaryItem, language: InsightsSource['language']): string => {
  const marker =
    item.unverifiedNumbers.length === 0
      ? ''
      : ` <span class="unverified">${escapeHtml(INSIGHTS_LABELS[language].unverifiedMarker(item.unverifiedNumbers.join(', ')))}</span>`;

  return `${escapeHtml(item.text)}${marker}`;
};

export const buildSummaryHtml = (result: InsightsSource): string => {
  const { summary } = result.insights;

  if (summary === null) {
    return '';
  }

  const labels = INSIGHTS_LABELS[result.language];
  const sections: [string, SummaryItem[]][] = [
    [labels.summaryStrengths, summary.strengths],
    [labels.summaryBlockers, summary.blockers],
    [labels.summaryWeek, summary.thisWeek],
    [labels.summaryMonth, summary.thisMonth],
    [labels.summaryQuarter, summary.thisQuarter],
  ];

  return `<section class="section summary">
  <h2>${escapeHtml(labels.summaryHeading)}</h2>
  <p class="lead"><strong>${itemHtml(summary.headline, result.language)}</strong></p>
  <div class="summary-grid">
    ${sections
      .filter(([, items]) => items.length > 0)
      .map(
        ([heading, items]) => `<div class="summary-block keep-together">
      <h3>${escapeHtml(heading)}</h3>
      <ul>${items.map((item) => `<li>${itemHtml(item, result.language)}</li>`).join('')}</ul>
    </div>`,
      )
      .join('\n    ')}
  </div>
  <p class="methodology">${escapeHtml(labels.summaryWrittenBy(summary.model))} ${escapeHtml(summary.isFullyVerified ? labels.summaryAllVerified : labels.summarySomeUnverified)}</p>
</section>`;
};

export const buildStrengthsHtml = (result: InsightsSource): string => {
  const labels = INSIGHTS_LABELS[result.language];
  const reportLabels = REPORT_LABELS[result.language];
  const { insights } = result;
  const parts: string[] = [];

  if (insights.strengths.length > 0) {
    parts.push(`<section class="section keep-together">
  <h2>${escapeHtml(labels.strengthsHeading)}</h2>
  <ul class="small-list">${insights.strengths
    .map((strength) => `<li>${escapeHtml(labels.describeStrength(strength, reportLabels.areas))}</li>`)
    .join('')}</ul>
</section>`);
  }

  if (insights.rulesOnlyScore !== null && insights.rulesOnlyScore !== result.score) {
    parts.push(`<section class="section keep-together">
  <h2>${escapeHtml(labels.comparisonHeading)}</h2>
  <div class="compare">
    <div class="compare-cell"><span class="compare-value">${insights.rulesOnlyScore}</span><span class="compare-label">${escapeHtml(result.language === 'DE' ? 'nur Regeln' : 'rules only')}</span></div>
    <div class="compare-cell"><span class="compare-value">${result.score}</span><span class="compare-label">${escapeHtml(result.language === 'DE' ? 'mit Inhaltsbewertung' : 'with content judgement')}</span></div>
  </div>
  <p class="lead">${escapeHtml(labels.comparisonSentence(insights.rulesOnlyScore, result.score))} ${escapeHtml(labels.comparisonHint)}</p>
</section>`);
  }

  return parts.join('\n');
};

const heatCell = (value: number): string =>
  `<td class="heat heat-${Math.max(1, Math.min(5, value))}">${value}</td>`;

export const buildPagesHtml = (result: InsightsSource): string => {
  const assessments = sortWeakestFirst(result.assessments);

  if (assessments.length === 0) {
    return '';
  }

  const labels = INSIGHTS_LABELS[result.language];
  const { confidence } = result.insights;
  const shown = assessments.slice(0, MAX_HEATMAP_ROWS);
  const cards = assessments.slice(0, MAX_CARDS);

  const typeOf = (type: string): string => labels.pageTypes[type] ?? type;
  const intentOf = (intent: string): string => labels.intents[intent] ?? intent;
  const sureOf = (needsReview: boolean): string =>
    needsReview
      ? `<span class="check">${escapeHtml(labels.needsCheck)}</span>`
      : escapeHtml(labels.sure);

  return `<section class="section">
  <h2>${escapeHtml(labels.pagesHeading)}</h2>
  <p class="lead">${escapeHtml(labels.pagesIntro)}</p>
  ${
    confidence.sharePercent === null
      ? ''
      : `<p class="lead">${escapeHtml(labels.confidenceSentence(confidence.definitive, confidence.total, confidence.sharePercent))}</p>`
  }
  <div class="cards">${cards
    .map(
      (assessment) => `<div class="page-card keep-together">
    <div class="page-card-url">${escapeHtml(assessment.url)}</div>
    <div class="page-card-meta">${escapeHtml(typeOf(assessment.pageType))} · ${escapeHtml(intentOf(assessment.searchIntent))} · ${sureOf(assessment.needsReview)}</div>
    <div class="page-card-scores">
      <span class="heat heat-${assessment.helpfulness}">${escapeHtml(labels.columnHelpful)} ${assessment.helpfulness}</span>
      <span class="heat heat-${assessment.specificity}">${escapeHtml(labels.columnSpecific)} ${assessment.specificity}</span>
      <span class="heat heat-${assessment.trust}">${escapeHtml(labels.columnTrust)} ${assessment.trust}</span>
    </div>
  </div>`,
    )
    .join('')}</div>
  <table class="heatmap">
    <thead><tr><th>${escapeHtml(labels.columnPage)}</th><th>${escapeHtml(labels.columnType)}</th><th>${escapeHtml(labels.columnIntent)}</th><th class="num">${escapeHtml(labels.columnHelpful)}</th><th class="num">${escapeHtml(labels.columnSpecific)}</th><th class="num">${escapeHtml(labels.columnTrust)}</th><th>${escapeHtml(labels.columnSure)}</th></tr></thead>
    <tbody>${shown
      .map(
        (assessment) =>
          `<tr><td class="url">${escapeHtml(assessment.url)}</td><td>${escapeHtml(typeOf(assessment.pageType))}</td><td>${escapeHtml(intentOf(assessment.searchIntent))}</td>${heatCell(assessment.helpfulness)}${heatCell(assessment.specificity)}${heatCell(assessment.trust)}<td>${sureOf(assessment.needsReview)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>
  ${assessments.length > shown.length ? `<p class="methodology">${escapeHtml(labels.morePages(assessments.length - shown.length))}</p>` : ''}
</section>`;
};

export const buildOpportunitiesHtml = (result: InsightsSource): string => {
  const labels = INSIGHTS_LABELS[result.language];
  const { competingPages, missingLocations } = result.insights;
  const locale = result.language === 'DE' ? 'de-DE' : 'en-US';
  const parts: string[] = [];

  if (competingPages.length > 0) {
    parts.push(`<section class="section">
  <h2>${escapeHtml(labels.competingHeading)}</h2>
  <p class="lead">${escapeHtml(labels.competingIntro)}</p>
  ${competingPages
    .map(
      (group) => `<div class="keep-together"><strong>${escapeHtml(group.topic)}</strong><div class="urls">${group.urls.map((url) => `<div>${escapeHtml(url)}</div>`).join('')}</div></div>`,
    )
    .join('\n  ')}
</section>`);
  }

  if (missingLocations.length > 0) {
    parts.push(`<section class="section keep-together">
  <h2>${escapeHtml(labels.locationsHeading)}</h2>
  <p class="lead">${escapeHtml(labels.locationsIntro)}</p>
  <table>
    <tbody>${missingLocations
      .map(
        (location) =>
          `<tr><td><strong>${escapeHtml(location.place)}</strong></td><td class="num">${new Intl.NumberFormat(locale).format(location.searchVolume)} ${escapeHtml(labels.searchesPerMonth)}</td><td class="url">${escapeHtml(location.keywords.join(', '))}</td></tr>`,
      )
      .join('')}</tbody>
  </table>
</section>`);
  }

  return parts.join('\n');
};
