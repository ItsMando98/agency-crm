import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { buildAiVisibilityTable } from 'src/utils/build-ai-visibility-table.util';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

const PERCENT = 100;

export const buildReportAiVisibilityHtml = (result: SeoAuditResult): string => {
  const { aiVisibility, language } = result;

  if (aiVisibility === null) {
    return '';
  }

  const labels = REPORT_LABELS[language];
  const parts: string[] = [`<h2>${escapeHtml(labels.aiVisibilityHeading)}</h2>`];

  if (aiVisibility.rows.length > 0) {
    const { header, rows } = buildAiVisibilityTable(aiVisibility, language);

    parts.push(`<p class="lead">${escapeHtml(labels.aiVisibilityIntro)}</p>`);

    if (aiVisibility.presenceRate !== null) {
      parts.push(
        `<div class="tiles" style="--tile-columns: 1"><div class="tile"><div class="tile-label">${escapeHtml(labels.aiVisibilityPresence)}</div><div class="tile-value">${escapeHtml(`${Math.round(aiVisibility.presenceRate * PERCENT)} %`)}</div></div></div>`,
        `<p class="tiny">${escapeHtml(`${labels.aiVisibilityTestedOn} ${formatReportDate(aiVisibility.testedAt, language)}`)}</p>`,
      );
    }

    parts.push(
      `<div class="keep-together"><table><thead><tr>${header
        .map((cell) => `<th>${escapeHtml(cell)}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
        )
        .join('')}</tbody></table></div>`,
    );
  }

  if (aiVisibility.notes.length > 0) {
    parts.push(
      `<p class="note"><strong>${escapeHtml(labels.marketNotes)}:</strong> ${aiVisibility.notes.map((note) => escapeHtml(note)).join(' · ')}</p>`,
    );
  }

  return `<section class="section">${parts.join('\n')}</section>`;
};
