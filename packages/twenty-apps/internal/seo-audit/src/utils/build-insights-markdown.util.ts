import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AuditSummary, type SummaryItem } from 'src/types/audit-insights';
import { type AuditLanguage } from 'src/types/audit-language';
import { type InsightsSource } from 'src/types/insights-source';
import { sortWeakestFirst } from 'src/utils/sort-weakest-first.util';

const MAX_HEATMAP_ROWS = 25;
const MAX_CARDS = 5;

const formatItem = (item: SummaryItem, language: AuditLanguage): string =>
  item.unverifiedNumbers.length === 0
    ? item.text
    : `${item.text} (${INSIGHTS_LABELS[language].unverifiedMarker(item.unverifiedNumbers.join(', '))})`;

const summaryLines = (summary: AuditSummary, language: AuditLanguage): string[] => {
  const labels = INSIGHTS_LABELS[language];
  const sections: [string, SummaryItem[]][] = [
    [labels.summaryStrengths, summary.strengths],
    [labels.summaryBlockers, summary.blockers],
    [labels.summaryWeek, summary.thisWeek],
    [labels.summaryMonth, summary.thisMonth],
    [labels.summaryQuarter, summary.thisQuarter],
  ];

  return [
    `## ${labels.summaryHeading}`,
    '',
    `**${formatItem(summary.headline, language)}**`,
    '',
    ...sections.flatMap(([heading, items]) =>
      items.length === 0 ? [] : [`### ${heading}`, '', ...items.map((item) => `- ${formatItem(item, language)}`), ''],
    ),
    `_${labels.summaryWrittenBy(summary.model)} ${summary.isFullyVerified ? labels.summaryAllVerified : labels.summarySomeUnverified}_`,
    '',
  ];
};

// The summary of the strong model comes first, so an agent reads it before the tables.
export const buildSummaryMarkdown = (result: InsightsSource): string[] =>
  result.insights.summary === null ? [] : summaryLines(result.insights.summary, result.language);

export const buildInsightsMarkdown = (result: InsightsSource): string[] => {
  const labels = INSIGHTS_LABELS[result.language];
  const reportLabels = REPORT_LABELS[result.language];
  const { insights } = result;
  const lines: string[] = [];

  if (insights.strengths.length > 0) {
    lines.push(
      `## ${labels.strengthsHeading}`,
      '',
      ...insights.strengths.map(
        (strength) => `- ${labels.describeStrength(strength, reportLabels.areas)}`,
      ),
      '',
    );
  }

  if (insights.rulesOnlyScore !== null && insights.rulesOnlyScore !== result.score) {
    lines.push(
      `## ${labels.comparisonHeading}`,
      '',
      `${labels.comparisonSentence(insights.rulesOnlyScore, result.score)} ${labels.comparisonHint}`,
      '',
    );
  }

  const assessments = sortWeakestFirst(result.assessments);

  if (assessments.length > 0) {
    const shown = assessments.slice(0, MAX_HEATMAP_ROWS);

    lines.push(`## ${labels.pagesHeading}`, '', labels.pagesIntro, '');

    if (insights.confidence.sharePercent !== null) {
      lines.push(
        labels.confidenceSentence(
          insights.confidence.definitive,
          insights.confidence.total,
          insights.confidence.sharePercent,
        ),
        '',
      );
    }

    lines.push(
      `| ${labels.columnPage} | ${labels.columnType} | ${labels.columnIntent} | ${labels.columnHelpful} | ${labels.columnSpecific} | ${labels.columnTrust} | ${labels.columnSure} |`,
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...shown.map(
        (assessment) =>
          `| ${assessment.url} | ${labels.pageTypes[assessment.pageType] ?? assessment.pageType} | ${labels.intents[assessment.searchIntent] ?? assessment.searchIntent} | ${assessment.helpfulness} | ${assessment.specificity} | ${assessment.trust} | ${assessment.needsReview ? labels.needsCheck : labels.sure} |`,
      ),
      '',
    );

    if (assessments.length > shown.length) {
      lines.push(`_${labels.morePages(assessments.length - shown.length)}_`, '');
    }
  }

  if (insights.competingPages.length > 0) {
    lines.push(
      `## ${labels.competingHeading}`,
      '',
      labels.competingIntro,
      '',
      ...insights.competingPages.flatMap((group) => [
        `- **${group.topic}**`,
        ...group.urls.map((url) => `  - ${url}`),
      ]),
      '',
    );
  }

  if (insights.missingLocations.length > 0) {
    lines.push(
      `## ${labels.locationsHeading}`,
      '',
      labels.locationsIntro,
      '',
      ...insights.missingLocations.map(
        (location) =>
          `- **${location.place}**: ${new Intl.NumberFormat(result.language === 'DE' ? 'de-DE' : 'en-US').format(location.searchVolume)} ${labels.searchesPerMonth} (${location.keywords.join(', ')})`,
      ),
      '',
    );
  }

  return lines;
};

export { MAX_CARDS };
