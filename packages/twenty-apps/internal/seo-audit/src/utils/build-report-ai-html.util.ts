import { AI_ENGINES } from 'src/constants/ai-visibility.const';
import { AI_CRAWLERS } from 'src/constants/ai-readiness.const';
import { REPORT_DESIGN_LABELS } from 'src/constants/report-design-labels.const';
import { REPORT_LABELS } from 'src/constants/report-labels.const';
import { type AiAnswerStatus } from 'src/types/ai-visibility';
import { type ReportSection } from 'src/types/report-section';
import { type SeoAuditResult } from 'src/types/seo-audit-result';
import { escapeHtml } from 'src/utils/escape-html.util';
import { formatReportDate } from 'src/utils/format-report-date.util';

const PERCENT = 100;
const NO_DOMAIN = '-';

const STATUS_CLASS: Record<AiAnswerStatus, string> = {
  CITED: 'st-y',
  MENTIONED: 'st-p',
  ABSENT: 'st-n',
  UNKNOWN: 'st-v',
};

const chip = (isOk: boolean, label: string, value: string): string =>
  `<span class="chip ${isOk ? 'st-y' : 'st-n'}">${isOk ? '✓' : '✗'} ${escapeHtml(label)}: ${escapeHtml(value)}</span>`;

export const buildReportAiSection = (result: SeoAuditResult): ReportSection => {
  const { aiReadiness, aiVisibility, language } = result;
  const labels = REPORT_LABELS[language];
  const design = REPORT_DESIGN_LABELS[language];

  const statusLabels: Record<AiAnswerStatus, string> = {
    CITED: labels.statusCited,
    MENTIONED: labels.statusMentioned,
    ABSENT: labels.statusAbsent,
    UNKNOWN: labels.statusUnknown,
  };

  const readiness = [
    ...AI_CRAWLERS.map(({ id, label }) =>
      chip(
        aiReadiness.crawlerAccess[id] === 'ALLOWED',
        label,
        aiReadiness.crawlerAccess[id] === 'ALLOWED' ? labels.crawlerAllowed : labels.crawlerBlocked,
      ),
    ),
    chip(aiReadiness.llmsTxtFound, labels.llmsTxt, aiReadiness.llmsTxtFound ? labels.present : labels.missing),
    chip(
      aiReadiness.organizationSchemaFound,
      labels.organizationMarkup,
      aiReadiness.organizationSchemaFound ? labels.present : labels.missing,
    ),
    chip(aiReadiness.faqSchemaFound, labels.faqMarkup, aiReadiness.faqSchemaFound ? labels.present : labels.missing),
  ];

  const parts: string[] = [];

  if (aiVisibility !== null && aiVisibility.rows.length > 0) {
    if (aiVisibility.presenceRate !== null) {
      parts.push(
        `<div class="kpis"><div class="kpi"><div class="num${aiVisibility.presenceRate === 0 ? ' hot' : ''}">${Math.round(aiVisibility.presenceRate * PERCENT)} %</div><p>${escapeHtml(design.aiPresence)}</p></div></div>`,
      );
    }

    parts.push(
      `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${escapeHtml(labels.questionColumn)}</th>${AI_ENGINES.map(
        ({ label }) => `<th>${escapeHtml(label)}</th>`,
      ).join('')}<th>${escapeHtml(labels.namedInsteadColumn)}</th></tr></thead><tbody>${aiVisibility.rows
        .map(
          (row) =>
            `<tr><td>„${escapeHtml(row.query)}"</td>${AI_ENGINES.map(
              ({ id }) =>
                `<td class="st ${STATUS_CLASS[row.results[id]]}">${escapeHtml(statusLabels[row.results[id]])}</td>`,
            ).join('')}<td>${escapeHtml(row.instead.length === 0 ? NO_DOMAIN : row.instead.join(', '))}</td></tr>`,
        )
        .join('')}</tbody></table></div>`,
      `<p class="src">${escapeHtml(design.aiTestedOn(formatReportDate(aiVisibility.testedAt, language)))}</p>`,
    );
  }

  parts.push(
    `<p class="sub">${escapeHtml(design.aiReadinessChips)}</p><div class="chips" style="margin-top:16px">${readiness.join('')}</div>`,
  );

  const hasAnswers = aiVisibility !== null && aiVisibility.rows.length > 0;
  const sectionLabels = hasAnswers ? design.sections.ai : design.sections.aiReadiness;

  return {
    id: 'ai',
    eyebrow: sectionLabels.eyebrow,
    plain: sectionLabels.plain,
    accent: sectionLabels.accent,
    lead: hasAnswers ? labels.aiVisibilityIntro : labels.aiReadinessIntro,
    body: parts.join('\n'),
  };
};
