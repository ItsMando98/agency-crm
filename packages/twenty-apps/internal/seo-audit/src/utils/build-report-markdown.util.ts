import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AreaScores } from 'src/types/area-scores';
import { type AuditLanguage } from 'src/types/audit-language';
import { type AuditTask } from 'src/types/audit-task';
import { type MarketData } from 'src/types/market-data';
import { type PageAssessment } from 'src/types/page-assessment';
import { type ScoredKeyword } from 'src/types/scored-keyword';
import { type SeoArea } from 'src/types/seo-area';
import { buildAiReadinessReportSection } from 'src/utils/build-ai-readiness-report-section.util';
import { buildMarketReportSection } from 'src/utils/build-market-report-section.util';
import { getTaskHorizon } from 'src/utils/get-task-horizon.util';

type BuildReportMarkdownParams = {
  origin: string;
  language: AuditLanguage;
  generatedAt: Date;
  score: number;
  grade: string;
  areaScores: AreaScores;
  pageCount: number;
  tasks: AuditTask[];
  assessments: PageAssessment[];
  contentQualityAssessed: boolean;
  marketData?: MarketData | null;
  keywords?: ScoredKeyword[];
  isMarketDataConfigured?: boolean;
  aiReadiness?: AiReadiness | null;
};

const MAX_URLS_SHOWN_PER_TASK = 5;
const MAX_REVIEW_URLS_SHOWN = 20;

const escapeCell = (value: string): string => value.replace(/\|/g, '\\|');

export const buildReportMarkdown = ({
  origin,
  language,
  generatedAt,
  score,
  grade,
  areaScores,
  pageCount,
  tasks,
  assessments,
  contentQualityAssessed,
  marketData = null,
  keywords = [],
  isMarketDataConfigured = false,
  aiReadiness = null,
}: BuildReportMarkdownParams): string => {
  const labels = REPORT_LABELS[language];
  const lines: string[] = [
    `# ${labels.title}: ${origin}`,
    '',
    `${labels.generatedOn} ${generatedAt.toISOString().slice(0, 10)} | ${labels.score}: **${score}/100** | ${labels.grade}: **${grade}** | ${pageCount} ${labels.pagesChecked}`,
    '',
  ];

  if (!contentQualityAssessed) {
    lines.push(`> ${labels.contentNotAssessed}`, '');
  }

  if (!isMarketDataConfigured) {
    lines.push(`> ${labels.marketDataNotConfigured}`, '');
  }

  const rankedAreas = (Object.entries(areaScores) as [SeoArea, number][]).sort(
    (first, second) => second[1] - first[1],
  );

  lines.push(
    `## ${labels.areasHeading}`,
    '',
    `| ${labels.areaColumn} | ${labels.scoreColumn} |`,
    '| --- | --- |',
    ...rankedAreas.map(([area, areaScore]) => `| ${labels.areas[area]} | ${areaScore} |`),
    '',
    `## ${labels.summaryHeading}`,
    '',
  );

  if (rankedAreas.length > 0) {
    const [strongestArea, strongestScore] = rankedAreas[0];
    const [weakestArea, weakestScore] = rankedAreas[rankedAreas.length - 1];

    lines.push(
      `- ${labels.strongestArea}: ${labels.areas[strongestArea]} (${strongestScore})`,
      `- ${labels.weakestArea}: ${labels.areas[weakestArea]} (${weakestScore})`,
    );
  }

  lines.push(
    `- ${labels.taskCount}: ${tasks.length}, ${labels.criticalCount}: ${tasks.filter((task) => task.priority === 'CRITICAL').length}`,
    '',
    `## ${labels.tasksHeading}`,
    '',
  );

  if (tasks.length === 0) {
    lines.push(labels.noTasks, '');
  }

  const horizons = [
    { key: 'WEEK', heading: labels.horizonWeek },
    { key: 'MONTH', heading: labels.horizonMonth },
    { key: 'QUARTER', heading: labels.horizonQuarter },
  ] as const;

  for (const { key, heading } of horizons) {
    const horizonTasks = tasks.filter((task) => getTaskHorizon(task) === key);

    if (horizonTasks.length === 0) {
      continue;
    }

    lines.push(
      `### ${heading}`,
      '',
      `| # | ${labels.priorityColumn} | ${labels.effortColumn} | ${labels.areaColumn} | ${labels.sourceColumn} | ${labels.taskColumn} |`,
      '| --- | --- | --- | --- | --- | --- |',
    );

    horizonTasks.forEach((task) => {
      lines.push(
        `| ${tasks.indexOf(task) + 1} | ${labels.priorities[task.priority]} | ${labels.efforts[task.effort]} | ${labels.areas[task.area]} | ${labels.sources[task.source]} | ${escapeCell(task.name)} |`,
      );
    });

    lines.push('');

    horizonTasks.forEach((task) => {
      lines.push(`**${tasks.indexOf(task) + 1}. ${task.name}**`, '', task.description, '');

      if (task.affectedUrls.length > 0) {
        const shownUrls = task.affectedUrls.slice(0, MAX_URLS_SHOWN_PER_TASK);
        const hiddenCount = task.affectedUrls.length - shownUrls.length;

        lines.push(
          `${labels.affectedUrls}:`,
          ...shownUrls.map((url) => `- ${url}`),
          ...(hiddenCount > 0 ? [`- ... ${hiddenCount} ${labels.moreUrls}`] : []),
          '',
        );
      }
    });
  }

  if (marketData !== null) {
    lines.push(...buildMarketReportSection({ marketData, keywords, language }));
  }

  if (aiReadiness !== null) {
    lines.push(...buildAiReadinessReportSection({ aiReadiness, language }));
  }

  const reviewUrls = assessments
    .filter((assessment) => assessment.needsReview)
    .map((assessment) => assessment.url);

  if (reviewUrls.length > 0) {
    lines.push(
      `## ${labels.reviewHeading}`,
      '',
      labels.reviewIntro,
      '',
      ...reviewUrls.slice(0, MAX_REVIEW_URLS_SHOWN).map((url) => `- ${url}`),
      ...(reviewUrls.length > MAX_REVIEW_URLS_SHOWN
        ? [`- ... ${reviewUrls.length - MAX_REVIEW_URLS_SHOWN} ${labels.moreUrls}`]
        : []),
      '',
    );
  }

  lines.push(`## ${labels.methodologyHeading}`, '', labels.methodology, '');

  return lines.join('\n');
};
