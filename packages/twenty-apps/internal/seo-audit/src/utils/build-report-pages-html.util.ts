import { INSIGHTS_LABELS } from 'src/constants/insights-labels.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { sortWeakestFirst } from 'src/utils/sort-weakest-first.util';

const MAX_ROWS = 25;
const CARD_COUNT = 4;
const MAX_RATING = 5;

const ratingTone = (value: number): string => (value >= 4 ? 'c-good' : value === 3 ? 'c-mid' : 'c-crit');

export const buildReportPagesSection = (result: SeoAuditResult): ReportSection | null => {
  const assessments = sortWeakestFirst(result.assessments);

  if (assessments.length === 0) {
    return null;
  }

  const labels = INSIGHTS_LABELS[result.language];
  const design = REPORT_DESIGN_LABELS[result.language];
  const { confidence } = result.insights;
  const shown = assessments.slice(0, MAX_ROWS);
  const typeOf = (type: string): string => labels.pageTypes[type] ?? type;
  const intentOf = (intent: string): string => labels.intents[intent] ?? intent;
  const sure = (needsReview: boolean): string =>
    needsReview
      ? `<span class="chip st-n">${escapeHtml(labels.needsCheck)}</span>`
      : `<span class="chip st-y">${escapeHtml(labels.sure)}</span>`;
  const rating = (value: number): string => `<td class="h h${value}">${value}</td>`;

  const ratingBar = (label: string, value: number): string =>
    `<div style="display:grid;grid-template-columns:90px 1fr 30px;gap:10px;align-items:center;font-size:13px;color:var(--tx-2);margin-bottom:6px"><span>${escapeHtml(label)}</span><div class="bar ${ratingTone(value)}" style="margin:0"><i style="--v:${(value / MAX_RATING) * 100}"></i></div><b style="color:var(--tx)">${value}</b></div>`;

  return {
    id: 'pages',
    eyebrow: design.sections.pages.eyebrow,
    plain: design.sections.pages.plain,
    accent: design.sections.pages.accent,
    lead:
      confidence.sharePercent === null
        ? design.pagesLead
        : `${design.pagesLead} ${labels.confidenceSentence(confidence.definitive, confidence.total, confidence.sharePercent)}`,
    body: `<p class="sub">${escapeHtml(labels.weakestCardsHeading)}</p>
    <div class="cats" style="margin-top:16px">${assessments
      .slice(0, CARD_COUNT)
      .map(
        (assessment) => `<article class="cat ${assessment.needsReview ? 'c-crit' : ratingTone(Math.round((assessment.helpfulness + assessment.specificity + assessment.trust) / 3))}">
      <header><b style="font-size:16px;word-break:break-all;text-transform:none;font-family:var(--mono);font-weight:500">${escapeHtml(assessment.url)}</b></header>
      <p style="margin-bottom:12px">${escapeHtml(typeOf(assessment.pageType))} · ${escapeHtml(intentOf(assessment.searchIntent))} ${sure(assessment.needsReview)}</p>
      ${ratingBar(labels.columnHelpful, assessment.helpfulness)}${ratingBar(labels.columnSpecific, assessment.specificity)}${ratingBar(labels.columnTrust, assessment.trust)}
    </article>`,
      )
      .join('')}</div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${escapeHtml(labels.columnPage)}</th><th>${escapeHtml(labels.columnType)}</th><th>${escapeHtml(labels.columnIntent)}</th><th>${escapeHtml(labels.columnHelpful)}</th><th>${escapeHtml(labels.columnSpecific)}</th><th>${escapeHtml(labels.columnTrust)}</th><th>${escapeHtml(labels.columnSure)}</th></tr></thead><tbody>${shown
      .map(
        (assessment) =>
          `<tr><td class="url">${escapeHtml(assessment.url)}</td><td>${escapeHtml(typeOf(assessment.pageType))}</td><td>${escapeHtml(intentOf(assessment.searchIntent))}</td>${rating(assessment.helpfulness)}${rating(assessment.specificity)}${rating(assessment.trust)}<td>${sure(assessment.needsReview)}</td></tr>`,
      )
      .join('')}</tbody></table></div>
    ${assessments.length > shown.length ? `<p class="hint">${escapeHtml(labels.morePages(assessments.length - shown.length))}</p>` : ''}`,
  };
};
