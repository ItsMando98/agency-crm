import { type AuditLanguage } from 'src/types/audit-language';
import { type ReportHtmlLabels } from 'src/types/report-html-labels';

export const REPORT_HTML_LABELS: Record<AuditLanguage, ReportHtmlLabels> = {
  DE: {
    documentTitle: 'SEO-Audit',
    overallScore: 'Gesamtscore',
    kpiPages: 'Seiten geprüft',
    kpiTasks: 'Maßnahmen',
    kpiCritical: 'davon kritisch',
    kpiKeywords: 'Keywords im Ranking',
    kpiTraffic: 'Besucher pro Monat (geschätzt)',
    kpiBacklinks: 'Backlinks',
    kpiDomains: 'Verweisende Domains',
    bands: { STRONG: 'Stark', OKAY: 'Solide', WEAK: 'Schwach' },
    summarySentence: (strongest, strongestScore, weakest, weakestScore) =>
      `Am stärksten ist der Bereich ${strongest} (${strongestScore}), am schwächsten ${weakest} (${weakestScore}).`,
    horizonHints: {
      WEEK: 'Hoher Hebel bei geringem Aufwand',
      MONTH: 'Als Nächstes umsetzen',
      QUARTER: 'Langfristig einplanen',
    },
    contentNotAssessed:
      'Die Inhaltsqualität wurde nicht bewertet. Der Score beruht nur auf gemessenen Regeln.',
    brokenBacklinksHeading: 'Backlinks auf nicht mehr existierende Seiten',
    backlinksColumn: 'Backlinks',
    domainsColumn: 'Domains',
    reviewKeywordsHeading: 'Keywords mit unsicherer Bewertung',
    reviewPagesHeading: 'Seiten mit unsicherer Bewertung',
    moreItems: (count) => `und ${count} weitere`,
  },
  EN: {
    documentTitle: 'SEO audit',
    overallScore: 'Overall score',
    kpiPages: 'Pages checked',
    kpiTasks: 'Actions',
    kpiCritical: 'of which critical',
    kpiKeywords: 'Ranking keywords',
    kpiTraffic: 'Visitors per month (estimated)',
    kpiBacklinks: 'Backlinks',
    kpiDomains: 'Referring domains',
    bands: { STRONG: 'Strong', OKAY: 'Okay', WEAK: 'Weak' },
    summarySentence: (strongest, strongestScore, weakest, weakestScore) =>
      `The strongest area is ${strongest} (${strongestScore}), the weakest is ${weakest} (${weakestScore}).`,
    horizonHints: {
      WEEK: 'High impact for low effort',
      MONTH: 'Tackle next',
      QUARTER: 'Plan for the longer term',
    },
    contentNotAssessed:
      'Content quality was not assessed. The score only reflects measured rules.',
    brokenBacklinksHeading: 'Backlinks pointing to pages that no longer exist',
    backlinksColumn: 'Backlinks',
    domainsColumn: 'Domains',
    reviewKeywordsHeading: 'Keywords with an unsure assessment',
    reviewPagesHeading: 'Pages with an unsure assessment',
    moreItems: (count) => `and ${count} more`,
  },
};
