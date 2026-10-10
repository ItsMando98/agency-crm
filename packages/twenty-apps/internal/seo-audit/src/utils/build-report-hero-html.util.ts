import { AI_ENGINES } from 'src/constants/ai-visibility.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type ReportBranding } from 'src/types/report-branding';
import { type SeoArea } from 'src/types/seo-area';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatNumber } from 'src/utils/format-number.util';
import { formatReportDate } from 'src/utils/format-report-date.util';
import { getBandClass } from 'src/utils/get-band-class.util';
import { getScoreBand } from 'src/utils/get-score-band.util';

const MARQUEE_REPEATS = 2;
const MARQUEE_SEPARATOR = '✦';

const metaItem = (label: string, value: string): string =>
  `<span>${escapeHtml(label)} <b>${escapeHtml(value)}</b></span>`;

const buildMarquee = (words: string[]): string => {
  const items = words
    .map(
      (word, index) =>
        `<span${index % 2 === 1 ? ' class="o"' : ''}>${escapeHtml(word)}</span><span>${MARQUEE_SEPARATOR}</span>`,
    )
    .join('');

  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${items.repeat(MARQUEE_REPEATS)}</div></div>`;
};

export const buildReportHeroHtml = (result: SeoAuditResult, branding: ReportBranding): string => {
  const { language } = result;
  const design = REPORT_DESIGN_LABELS[language];
  const htmlLabels = REPORT_HTML_LABELS[language];
  const labels = REPORT_LABELS[language];
  const domain = new URL(result.origin).hostname;
  const date = formatReportDate(result.generatedAt, language);
  const bandClass = getBandClass(getScoreBand(result.score));
  const rankedAreas = (Object.entries(result.areaScores) as [SeoArea, number][]).sort(
    (first, second) => second[1] - first[1],
  );
  const verdict =
    rankedAreas.length > 1
      ? htmlLabels.summarySentence(
          labels.areas[rankedAreas[0][0]],
          rankedAreas[0][1],
          labels.areas[rankedAreas[rankedAreas.length - 1][0]],
          rankedAreas[rankedAreas.length - 1][1],
        )
      : null;
  const hasAiAnswers = result.aiVisibility !== null && result.aiVisibility.rows.length > 0;
  const { rulesOnlyScore } = result.insights;
  const logoText = branding.brandName ?? htmlLabels.documentTitle;

  return `<header class="top">
  <div class="wrap">
    <span class="logo">${escapeHtml(logoText)}</span>
    <div class="top-actions">
      <button type="button" class="btn ghost" id="print-report">${escapeHtml(design.openReport)}</button>${
        branding.bookingUrl === null
          ? ''
          : `<a class="btn" href="${escapeHtml(branding.bookingUrl)}" rel="noopener noreferrer">${escapeHtml(design.headerButton)}</a>`
      }
    </div>
  </div>
</header>
<section class="hero">
  <div class="wrap">
    <div class="eyebrow">${escapeHtml(design.heroEyebrow(domain, date))}</div>
    <h1>${escapeHtml(design.heroHeadline)} <span class="serif red">${escapeHtml(domain)}</span></h1>
    <div class="hero-grid">
      <div>
        ${verdict === null ? '' : `<p class="verdict">${escapeHtml(verdict)}</p>`}
        <div class="meta">
          ${metaItem(design.metaPages, formatNumber(result.pages.length, language))}
          ${metaItem(design.metaDate, date)}
          ${hasAiAnswers ? metaItem(design.metaEngines, AI_ENGINES.map(({ label }) => label).join(', ')) : ''}
        </div>
      </div>
      <div class="gauge-card ${bandClass}" aria-label="${escapeHtml(htmlLabels.overallScore)}">
        <div class="gauge" style="--s:${Math.max(0, Math.min(100, result.score))}"><span>${result.score}</span></div>
        <p class="tiny" style="margin-bottom:14px">${escapeHtml(design.gaugeCaption)}</p>
        <span class="badge">${escapeHtml(design.gradeWord)} ${escapeHtml(result.grade)}</span>
        ${
          rulesOnlyScore === null || rulesOnlyScore === result.score
            ? ''
            : `<p class="tiny" style="margin-top:14px">${escapeHtml(design.rulesOnlyAverage(rulesOnlyScore))}</p>`
        }
      </div>
    </div>
  </div>
</section>
${buildMarquee(design.marquee)}`;
};
