import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { MAX_KEYWORDS_SHOWN_PER_CATEGORY } from 'src/constants/seo-thresholds.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type MarketData } from 'src/types/market-data';
import { type ScoredKeyword } from 'src/types/scored-keyword';

type BuildMarketReportSectionParams = {
  marketData: MarketData;
  keywords: ScoredKeyword[];
  language: AuditLanguage;
};

const MAX_NOT_RELEVANT_SHOWN = 8;

const escapeCell = (value: string): string => value.replace(/\|/g, '\\|');

export const buildMarketReportSection = ({
  marketData,
  keywords,
  language,
}: BuildMarketReportSectionParams): string[] => {
  const labels = REPORT_LABELS[language];
  const lines: string[] = [`## ${labels.marketHeading}`, ''];
  const { rankings, backlinks, competitors } = marketData;

  if (rankings !== null) {
    lines.push(
      `- ${labels.keywordsTotal}: ${rankings.totalKeywords}`,
      `- ${labels.trafficEstimate}: ${Math.round(rankings.estimatedMonthlyTraffic)}`,
    );

    if (rankings.positionCounts !== null) {
      const { position1, positions2To3, positions4To10, positions11To20 } =
        rankings.positionCounts;

      lines.push(
        `- ${labels.positionsHeading}: #1: ${position1} | #2-3: ${positions2To3} | #4-10: ${positions4To10} | #11-20: ${positions11To20}`,
      );
    }

    lines.push('');
  }

  const opportunityCategories = [
    { category: KEYWORD_CATEGORY.QUICK_WIN, heading: labels.keywordCategories.QUICK_WIN },
    { category: KEYWORD_CATEGORY.NEAR_PAGE_ONE, heading: labels.keywordCategories.NEAR_PAGE_ONE },
  ] as const;

  for (const { category, heading } of opportunityCategories) {
    const categoryKeywords = keywords
      .filter((keyword) => keyword.category === category)
      .sort((first, second) => second.searchVolume - first.searchVolume)
      .slice(0, MAX_KEYWORDS_SHOWN_PER_CATEGORY);

    if (categoryKeywords.length === 0) {
      continue;
    }

    lines.push(
      `### ${labels.opportunitiesHeading}: ${heading}`,
      '',
      `| ${labels.keywordColumn} | ${labels.positionColumn} | ${labels.volumeColumn} | ${labels.pageColumn} |`,
      '| --- | --- | --- | --- |',
      ...categoryKeywords.map(
        (keyword) =>
          `| ${escapeCell(keyword.keyword)} | ${keyword.position} | ${keyword.searchVolume} | ${escapeCell(keyword.url ?? '')} |`,
      ),
      '',
    );
  }

  const notRelevantKeywords = keywords
    .filter((keyword) => keyword.category === KEYWORD_CATEGORY.NOT_RELEVANT)
    .sort((first, second) => second.searchVolume - first.searchVolume)
    .slice(0, MAX_NOT_RELEVANT_SHOWN);

  if (notRelevantKeywords.length > 0) {
    lines.push(
      `### ${labels.notRelevantHeading}`,
      '',
      labels.notRelevantIntro,
      '',
      ...notRelevantKeywords.map(
        (keyword) =>
          `- ${keyword.keyword} (${labels.positionColumn} ${keyword.position}, ${keyword.searchVolume})`,
      ),
      '',
    );
  }

  if (backlinks !== null) {
    lines.push(
      `### ${labels.backlinksHeading}`,
      '',
      `- ${labels.backlinksTotal}: ${backlinks.backlinks}`,
      `- ${labels.referringDomains}: ${backlinks.referringDomains}`,
      ...(backlinks.brokenPages === null
        ? []
        : [`- ${labels.brokenBacklinkPages}: ${backlinks.brokenPages}`]),
      '',
    );
  }

  if (competitors.length > 0) {
    lines.push(
      `### ${labels.competitorsHeading}`,
      '',
      `| ${labels.domainColumn} | ${labels.commonKeywordsColumn} | ${labels.trafficColumn} |`,
      '| --- | --- | --- |',
      ...competitors.map(
        (competitor) =>
          `| ${escapeCell(competitor.domain)} | ${competitor.commonKeywords} | ${Math.round(competitor.estimatedTraffic)} |`,
      ),
      '',
    );
  }

  if (marketData.notes.length > 0) {
    lines.push(
      `> ${labels.marketNotes}:`,
      ...marketData.notes.map((note) => `> - ${note}`),
      '',
    );
  }

  return lines;
};
