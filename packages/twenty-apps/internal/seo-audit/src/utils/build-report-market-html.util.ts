import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { MAX_KEYWORDS_SHOWN_PER_CATEGORY } from 'src/constants/seo-thresholds.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildLighthouseDisplayRows } from 'src/utils/build-lighthouse-display-rows.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';

const MAX_NOT_RELEVANT_SHOWN = 8;
const MAX_BROKEN_TARGETS_SHOWN = 8;
const PERCENT = 100;

const RANK_TONES = ['c-good', 'c-good', 'c-mid', 'c-crit'] as const;

const kpi = (value: string, label: string): string =>
  `<div class="kpi"><div class="num">${escapeHtml(value)}</div><p>${escapeHtml(label)}</p></div>`;

export const buildReportMarketSection = (result: SeoAuditResult): ReportSection | null => {
  const { marketData, keywords, language } = result;

  if (marketData === null) {
    return null;
  }

  const labels = REPORT_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const design = REPORT_DESIGN_LABELS[language];
  const { rankings, backlinks, competitors } = marketData;
  const parts: string[] = [];

  const lighthouseRows =
    marketData.lighthouse === null ? [] : buildLighthouseDisplayRows(marketData.lighthouse, language);

  if (lighthouseRows.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.lighthouseHeading)}</p>`,
      `<div class="kpis" style="margin-top:20px">${lighthouseRows.map((row) => kpi(row.value, row.label)).join('')}</div>`,
    );
  }

  if (rankings?.positionCounts) {
    const { position1, positions2To3, positions4To10, positions11To20 } = rankings.positionCounts;
    const rows = [
      { label: '#1', count: position1 },
      { label: '#2-3', count: positions2To3 },
      { label: '#4-10', count: positions4To10 },
      { label: '#11-20', count: positions11To20 },
    ];
    const maxCount = Math.max(...rows.map((row) => row.count), 1);

    parts.push(
      `<p class="sub">${escapeHtml(labels.positionsHeading)}</p>`,
      `<div class="ranks">${rows
        .map(
          (row, index) =>
            `<div class="rank"><span>${row.label}</span><div class="bar ${RANK_TONES[index]}"><i style="--v:${(row.count / maxCount) * PERCENT}"></i></div><b>${escapeHtml(formatNumber(row.count, language))}</b></div>`,
        )
        .join('')}</div>`,
    );
  }

  const categories = [
    { category: KEYWORD_CATEGORY.QUICK_WIN, heading: labels.keywordCategories.QUICK_WIN },
    { category: KEYWORD_CATEGORY.NEAR_PAGE_ONE, heading: labels.keywordCategories.NEAR_PAGE_ONE },
  ] as const;

  for (const { category, heading } of categories) {
    const categoryKeywords = keywords
      .filter((keyword) => keyword.category === category)
      .sort((first, second) => second.searchVolume - first.searchVolume)
      .slice(0, MAX_KEYWORDS_SHOWN_PER_CATEGORY);

    if (categoryKeywords.length === 0) {
      continue;
    }

    parts.push(
      `<p class="sub">${escapeHtml(labels.opportunitiesHeading)}: ${escapeHtml(heading)}</p>`,
      `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${escapeHtml(labels.keywordColumn)}</th><th class="num">${escapeHtml(labels.positionColumn)}</th><th class="num">${escapeHtml(labels.volumeColumn)}</th><th>${escapeHtml(labels.pageColumn)}</th></tr></thead><tbody>${categoryKeywords
        .map(
          (keyword) =>
            `<tr><td>${escapeHtml(keyword.keyword)}</td><td class="num">${keyword.position}</td><td class="num">${escapeHtml(formatNumber(keyword.searchVolume, language))}</td><td class="url">${escapeHtml(keyword.url ?? '')}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }

  const notRelevant = keywords
    .filter((keyword) => keyword.category === KEYWORD_CATEGORY.NOT_RELEVANT)
    .sort((first, second) => second.searchVolume - first.searchVolume)
    .slice(0, MAX_NOT_RELEVANT_SHOWN);

  if (notRelevant.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.notRelevantHeading)}</p>`,
      `<p class="muted" style="margin-top:12px">${escapeHtml(labels.notRelevantIntro)}</p>`,
      `<div class="chips" style="margin-top:16px">${notRelevant
        .map(
          (keyword) =>
            `<span class="chip">${escapeHtml(keyword.keyword)} (${escapeHtml(labels.positionColumn)} ${keyword.position}, ${escapeHtml(formatNumber(keyword.searchVolume, language))})</span>`,
        )
        .join('')}</div>`,
    );
  }

  if (backlinks !== null) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.backlinksHeading)}</p>`,
      `<div class="kpis" style="margin-top:20px">${kpi(formatNumber(backlinks.backlinks, language), htmlLabels.kpiBacklinks)}${kpi(formatNumber(backlinks.referringDomains, language), htmlLabels.kpiDomains)}</div>`,
    );
  }

  if (result.brokenBacklinkTargets.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(htmlLabels.brokenBacklinksHeading)}</p>`,
      `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${escapeHtml(labels.pageColumn)}</th><th class="num">${escapeHtml(htmlLabels.backlinksColumn)}</th><th class="num">${escapeHtml(htmlLabels.domainsColumn)}</th></tr></thead><tbody>${result.brokenBacklinkTargets
        .slice(0, MAX_BROKEN_TARGETS_SHOWN)
        .map(
          (target) =>
            `<tr><td class="url">${escapeHtml(target.url)}</td><td class="num">${escapeHtml(formatNumber(target.backlinks, language))}</td><td class="num">${escapeHtml(formatNumber(target.referringDomains, language))}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }

  if (competitors.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.competitorsHeading)}</p>`,
      `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${escapeHtml(labels.domainColumn)}</th><th class="num">${escapeHtml(labels.commonKeywordsColumn)}</th><th class="num">${escapeHtml(labels.trafficColumn)}</th></tr></thead><tbody>${competitors
        .map(
          (competitor) =>
            `<tr><td>${escapeHtml(competitor.domain)}</td><td class="num">${escapeHtml(formatNumber(competitor.commonKeywords, language))}</td><td class="num">${escapeHtml(formatNumber(competitor.estimatedTraffic, language))}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }

  if (marketData.notes.length > 0) {
    parts.push(
      `<p class="hint">${escapeHtml(labels.marketNotes)}: ${marketData.notes.map((note) => escapeHtml(note)).join(' · ')}</p>`,
    );
  }

  return {
    id: 'market',
    eyebrow: design.sections.market.eyebrow,
    plain: design.sections.market.plain,
    accent: design.sections.market.accent,
    body: parts.join('\n'),
  };
};
