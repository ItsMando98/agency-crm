import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';

export const buildReportOpportunitiesSection = (result: SeoAuditResult): ReportSection | null => {
  const { competingPages, missingLocations } = result.insights;

  if (competingPages.length === 0 && missingLocations.length === 0) {
    return null;
  }

  const labels = INSIGHTS_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];
  const parts: string[] = [];

  if (competingPages.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.competingHeading)}</p>`,
      `<p class="muted" style="margin-top:12px">${escapeHtml(labels.competingIntro)}</p>`,
      `<div class="cats">${competingPages
        .map(
          (group) =>
            `<article class="cat c-mid"><header><b>${escapeHtml(group.topic)}</b></header><div class="evidence">${group.urls
              .map((url) => `<div>${escapeHtml(url)}</div>`)
              .join('')}</div></article>`,
        )
        .join('')}</div>`,
    );
  }

  if (missingLocations.length > 0) {
    parts.push(
      `<p class="sub">${escapeHtml(labels.locationsHeading)}</p>`,
      `<p class="muted" style="margin-top:12px">${escapeHtml(labels.locationsIntro)}</p>`,
      `<div class="tbl-wrap"><table class="tbl"><tbody>${missingLocations
        .map(
          (location) =>
            `<tr><td>${escapeHtml(location.place)}</td><td class="num">${escapeHtml(formatNumber(location.searchVolume, result.language))} ${escapeHtml(labels.searchesPerMonth)}</td><td class="url">${escapeHtml(location.keywords.join(', '))}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }

  return {
    id: 'opportunities',
    eyebrow: design.sections.opportunities.eyebrow,
    plain: design.sections.opportunities.plain,
    accent: design.sections.opportunities.accent,
    body: parts.join('\n'),
  };
};
