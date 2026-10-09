import { KEYWORD_CATEGORY } from 'src/constants/seo-audit.constants';
import { MAX_KEYWORDS_SHOWN_PER_CATEGORY } from 'src/constants/seo-thresholds.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildLighthouseDisplayRows } from 'src/utils/build-lighthouse-display-rows.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';

const MAX_NOT_RELEVANT_SHOWN = 8;
const MAX_BROKEN_TARGETS_SHOWN = 8;

export const buildReportMarketHtml = (result: SeoAuditResult): string => {
  const { marketData, keywords, language } = result;

  if (marketData === null) {
    return '';
  }

  const labels = REPORT_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const { rankings, backlinks, competitors } = marketData;
  const parts: string[] = [`<h2>${escapeHtml(labels.marketHeading)}</h2>`];

  const lighthouseRows =
    marketData.lighthouse === null
      ? []
      : buildLighthouseDisplayRows(marketData.lighthouse, language);

  if (lighthouseRows.length > 0) {
    parts.push(
      `<h3>${escapeHtml(labels.lighthouseHeading)}</h3>`,
      `<div class="tiles" style="--tile-columns: ${lighthouseRows.length}">${lighthouseRows
        .map(
          (row) =>
            `<div class="tile"><div class="tile-label">${escapeHtml(row.label)}</div><div class="tile-value">${escapeHtml(row.value)}</div></div>`,
        )
        .join('')}</div>`,
    );
  }

  if (rankings?.positionCounts) {
    const { position1, positions2To3, positions4To10, positions11To20 } = rankings.positionCounts;
    const rows = [
      { label: '#1', count: position1, color: 'var(--rank-1)' },
      { label: '#2-3', count: positions2To3, color: 'var(--rank-2)' },
      { label: '#4-10', count: positions4To10, color: 'var(--rank-3)' },
      { label: '#11-20', count: positions11To20, color: 'var(--rank-4)' },
    ];
    const maxCount = Math.max(...rows.map((row) => row.count), 1);

    parts.push(
      `<h3>${escapeHtml(labels.positionsHeading)}</h3>`,
      `<div class="keep-together">${rows
        .map(
          (row) =>
            `<div class="rank-row"><span>${row.label}</span><div class="rank-track"><div class="rank-bar" style="width: ${(row.count / maxCount) * 100}%; background: ${row.color}"></div></div><strong class="num" style="text-align: right">${escapeHtml(formatNumber(row.count, language))}</strong></div>`,
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
      `<div class="keep-together"><h3>${escapeHtml(labels.opportunitiesHeading)}: ${escapeHtml(heading)}</h3>`,
      `<table><thead><tr><th>${escapeHtml(labels.keywordColumn)}</th><th class="num">${escapeHtml(labels.positionColumn)}</th><th class="num">${escapeHtml(labels.volumeColumn)}</th><th>${escapeHtml(labels.pageColumn)}</th></tr></thead><tbody>${categoryKeywords
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
      `<h3>${escapeHtml(labels.notRelevantHeading)}</h3>`,
      `<p class="lead">${escapeHtml(labels.notRelevantIntro)}</p>`,
      `<ul class="small-list">${notRelevant
        .map(
          (keyword) =>
            `<li>${escapeHtml(keyword.keyword)} (${escapeHtml(labels.positionColumn)} ${keyword.position}, ${escapeHtml(formatNumber(keyword.searchVolume, language))})</li>`,
        )
        .join('')}</ul>`,
    );
  }

  if (backlinks !== null) {
    parts.push(
      `<h3>${escapeHtml(labels.backlinksHeading)}</h3>`,
      `<div class="tiles"><div class="tile"><div class="tile-label">${escapeHtml(htmlLabels.kpiBacklinks)}</div><div class="tile-value">${escapeHtml(formatNumber(backlinks.backlinks, language))}</div></div><div class="tile"><div class="tile-label">${escapeHtml(htmlLabels.kpiDomains)}</div><div class="tile-value">${escapeHtml(formatNumber(backlinks.referringDomains, language))}</div></div></div>`,
    );
  }

  if (result.brokenBacklinkTargets.length > 0) {
    parts.push(
      `<h3>${escapeHtml(htmlLabels.brokenBacklinksHeading)}</h3>`,
      `<table><thead><tr><th>${escapeHtml(labels.pageColumn)}</th><th class="num">${escapeHtml(htmlLabels.backlinksColumn)}</th><th class="num">${escapeHtml(htmlLabels.domainsColumn)}</th></tr></thead><tbody>${result.brokenBacklinkTargets
        .slice(0, MAX_BROKEN_TARGETS_SHOWN)
        .map(
          (target) =>
            `<tr><td class="url">${escapeHtml(target.url)}</td><td class="num">${escapeHtml(formatNumber(target.backlinks, language))}</td><td class="num">${escapeHtml(formatNumber(target.referringDomains, language))}</td></tr>`,
        )
        .join('')}</tbody></table>`,
    );
  }

  if (competitors.length > 0) {
    parts.push(
      `<h3>${escapeHtml(labels.competitorsHeading)}</h3>`,
      `<table><thead><tr><th>${escapeHtml(labels.domainColumn)}</th><th class="num">${escapeHtml(labels.commonKeywordsColumn)}</th><th class="num">${escapeHtml(labels.trafficColumn)}</th></tr></thead><tbody>${competitors
        .map(
          (competitor) =>
            `<tr><td>${escapeHtml(competitor.domain)}</td><td class="num">${escapeHtml(formatNumber(competitor.commonKeywords, language))}</td><td class="num">${escapeHtml(formatNumber(competitor.estimatedTraffic, language))}</td></tr>`,
        )
        .join('')}</tbody></table>`,
    );
  }

  if (marketData.notes.length > 0) {
    parts.push(
      `<p class="note"><strong>${escapeHtml(labels.marketNotes)}:</strong> ${marketData.notes.map((note) => escapeHtml(note)).join(' · ')}</p>`,
    );
  }

  return `<section class="section">${parts.join('\n')}</section>`;
};
