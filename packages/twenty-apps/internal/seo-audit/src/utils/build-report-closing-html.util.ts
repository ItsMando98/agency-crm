import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_HTML_LABELS } from 'src/constants/report-html-labels.const';
import { type ReportBranding } from 'src/types/report-branding';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';

export const buildReportClosingHtml = (result: SeoAuditResult, branding: ReportBranding): string => {
  const design = REPORT_DESIGN_LABELS[result.language];
  const htmlLabels = REPORT_HTML_LABELS[result.language];
  const wordmark = branding.brandName ?? htmlLabels.documentTitle;

  const callToAction =
    branding.bookingUrl === null
      ? ''
      : `<section class="cta">
  <div class="wrap">
    <div class="eyebrow">${escapeHtml(design.ctaEyebrow)}</div>
    <h2>${escapeHtml(design.ctaLine1)}<br><span class="w">${escapeHtml(design.ctaLine2)}</span></h2>
    <div class="cta-row">
      <p>${escapeHtml(design.ctaText)}</p>
      <a class="btn invert" href="${escapeHtml(branding.bookingUrl)}" rel="noopener noreferrer">${escapeHtml(design.ctaButton)}</a>
    </div>
  </div>
</section>`;

  return `${callToAction}
<footer>
  <div class="wrap">
    <div class="wm" aria-hidden="true">${escapeHtml(wordmark)}</div>
    <div class="foot tiny"><span>${escapeHtml(design.footerLegal)}</span><span>${escapeHtml(design.footerStudio)}</span></div>
  </div>
</footer>`;
};
