import { type ReportSection } from 'src/types/report-section';
import { escapeHtml } from 'src/utils/escape-html.util';

const MIN_NUMBER_DIGITS = 2;

export const renderReportSection = (section: ReportSection, number: number): string => {
  const label = String(number).padStart(MIN_NUMBER_DIGITS, '0');

  return `<section id="${escapeHtml(section.id)}">
  <div class="wrap">
    <div class="eyebrow">${label} / ${escapeHtml(section.eyebrow)}</div>
    <h2>${escapeHtml(section.plain)}${
      section.accent === '' ? '' : ` <span class="serif red">${escapeHtml(section.accent)}</span>`
    }</h2>
    ${section.lead === undefined ? '' : `<p class="lead">${escapeHtml(section.lead)}</p>`}
    ${section.body}
    ${section.source === undefined ? '' : `<p class="src">${escapeHtml(section.source)}</p>`}
  </div>
</section>`;
};
