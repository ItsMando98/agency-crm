import { type AuditLanguage } from 'src/types/audit-language';
import { type InsightsLabels } from 'src/types/insights-labels';

const formatNumber = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale).format(value);

export const INSIGHTS_LABELS: Record<AuditLanguage, InsightsLabels> = {
  DE: {
    summaryHeading: 'Zusammenfassung',
    summaryStrengths: 'Was gut läuft',
    summaryBlockers: 'Was bremst',
    summaryWeek: 'Diese Woche',
    summaryMonth: 'Diesen Monat',
    summaryQuarter: 'Dieses Quartal',
    summaryWrittenBy: (model) => `Geschrieben von ${model}. Jede Zahl wurde mit den Messwerten des Audits abgeglichen.`,
    summaryAllVerified: 'Alle genannten Zahlen sind durch den Audit belegt.',
    summarySomeUnverified: 'Zahlen, die der Audit nicht belegt, sind markiert.',
    unverifiedMarker: (numbers) => `nicht belegt: ${numbers}`,
    strengthsHeading: 'Was schon funktioniert',
    strengthsEmpty: 'Der Audit hat noch keine klaren Stärken gefunden.',
    describeStrength: (strength, areaLabels) => {
      switch (strength.kind) {
        case 'STRONG_AREAS':
          return `Stark aufgestellt: ${strength.areas.map(({ area, score }) => `${areaLabels[area] ?? area} (${score})`).join(', ')}.`;
        case 'TOP_RANKINGS':
          return `${strength.count} relevante Keywords stehen auf Platz 1 bis 3, zum Beispiel ${strength.examples
            .map(({ keyword, position, searchVolume }) => `„${keyword}" auf Platz ${position} mit ${formatNumber(searchVolume, 'de-DE')} Suchen im Monat`)
            .join('; ')}.`;
        case 'HELPFUL_PAGES':
          return `${strength.count} von ${strength.total} bewerteten Seiten sind hilfreich, konkret und vertrauenswürdig (jeweils 4 oder 5).`;
        case 'AI_READINESS':
          return `Für die KI-Suche vorbereitet: ${strength.passed.map((item) => INSIGHTS_LABELS.DE.aiReadinessItems[item]).join(', ')}.`;
        case 'AI_PRESENCE':
          return `KI-Assistenten nennen die Website in ${strength.ratePercent} % der Antworten (${strength.queriesTested} Fragen getestet).`;
      }
    },
    aiReadinessItems: {
      CRAWLERS: 'KI-Crawler dürfen die Seite lesen',
      LLMS_TXT: 'llms.txt vorhanden',
      ORGANIZATION: 'Organisations-Markup vorhanden',
      FAQ: 'FAQ-Markup vorhanden',
    },
    comparisonHeading: 'Was die Inhaltsbewertung ausmacht',
    comparisonSentence: (rulesOnly, withJudgement) =>
      `Allein nach den gemessenen Regeln läge der Score bei ${rulesOnly}. Mit der Bewertung von Inhalt und Keywords liegt er bei ${withJudgement}.`,
    comparisonHint: 'Ein rein technischer Audit sieht diesen Unterschied nicht.',
    pagesHeading: 'Seiten im Detail',
    pagesIntro: 'Jede Seite wurde einzeln bewertet. 1 ist schwach, 5 ist stark. Bei Unsicherheit steht "bitte prüfen".',
    confidenceSentence: (definitive, total, percent) =>
      `${definitive} von ${total} Bewertungen (${percent} %) waren eindeutig. Bei den übrigen sollte ein Mensch die Seite selbst ansehen.`,
    columnPage: 'Seite',
    columnType: 'Typ',
    columnIntent: 'Suchabsicht',
    columnHelpful: 'Hilfreich',
    columnSpecific: 'Konkret',
    columnTrust: 'Vertrauen',
    columnSure: 'Sicherheit',
    needsCheck: 'bitte prüfen',
    sure: 'eindeutig',
    morePages: (count) => `und ${count} weitere Seiten`,
    weakestCardsHeading: 'Die schwächsten Seiten',
    pageTypes: {
      HOME: 'Startseite', SERVICE: 'Leistung', PRODUCT: 'Produkt', CATEGORY: 'Kategorie', ARTICLE: 'Artikel',
      ABOUT: 'Über uns', CONTACT: 'Kontakt', LEGAL: 'Rechtliches', LANDING: 'Landingpage', OTHER: 'Sonstiges',
    },
    intents: {
      INFORMATIONAL: 'informieren', COMMERCIAL: 'vergleichen', TRANSACTIONAL: 'kaufen', NAVIGATIONAL: 'finden', NONE: 'keine',
    },
    competingHeading: 'Seiten, die um dasselbe Thema konkurrieren',
    competingIntro: 'Diese Seiten beantworten dieselbe Suche. Fasse sie zusammen oder trenne sie klar, sonst bremsen sie sich gegenseitig.',
    locationsHeading: 'Orte mit Suchvolumen, aber ohne eigene Seite',
    locationsIntro: 'Für diese Orte wird gesucht, die Website hat dafür aber keine eigene Seite.',
    searchesPerMonth: 'Suchen im Monat',
  },
  EN: {
    summaryHeading: 'Summary',
    summaryStrengths: 'What works',
    summaryBlockers: 'What holds the site back',
    summaryWeek: 'This week',
    summaryMonth: 'This month',
    summaryQuarter: 'This quarter',
    summaryWrittenBy: (model) => `Written by ${model}. Every number was checked against the measurements of the audit.`,
    summaryAllVerified: 'Every number mentioned is backed by the audit.',
    summarySomeUnverified: 'Numbers the audit cannot back up are marked.',
    unverifiedMarker: (numbers) => `not backed up: ${numbers}`,
    strengthsHeading: 'What already works',
    strengthsEmpty: 'The audit has not found clear strengths yet.',
    describeStrength: (strength, areaLabels) => {
      switch (strength.kind) {
        case 'STRONG_AREAS':
          return `Strong areas: ${strength.areas.map(({ area, score }) => `${areaLabels[area] ?? area} (${score})`).join(', ')}.`;
        case 'TOP_RANKINGS':
          return `${strength.count} relevant keywords rank on positions 1 to 3, for example ${strength.examples
            .map(({ keyword, position, searchVolume }) => `"${keyword}" on position ${position} with ${formatNumber(searchVolume, 'en-US')} searches per month`)
            .join('; ')}.`;
        case 'HELPFUL_PAGES':
          return `${strength.count} of ${strength.total} assessed pages are helpful, specific and trustworthy (4 or 5 each).`;
        case 'AI_READINESS':
          return `Ready for AI search: ${strength.passed.map((item) => INSIGHTS_LABELS.EN.aiReadinessItems[item]).join(', ')}.`;
        case 'AI_PRESENCE':
          return `AI assistants name the website in ${strength.ratePercent}% of the answers (${strength.queriesTested} questions tested).`;
      }
    },
    aiReadinessItems: {
      CRAWLERS: 'AI crawlers may read the site',
      LLMS_TXT: 'llms.txt present',
      ORGANIZATION: 'organization markup present',
      FAQ: 'FAQ markup present',
    },
    comparisonHeading: 'What the content judgement adds',
    comparisonSentence: (rulesOnly, withJudgement) =>
      `By the measured rules alone the score would be ${rulesOnly}. With the judgement of content and keywords it is ${withJudgement}.`,
    comparisonHint: 'A purely technical audit does not see this difference.',
    pagesHeading: 'Pages in detail',
    pagesIntro: 'Every page was judged on its own. 1 is weak, 5 is strong. When the model is unsure it says "please check".',
    confidenceSentence: (definitive, total, percent) =>
      `${definitive} of ${total} judgements (${percent}%) were clear. A person should look at the other pages themselves.`,
    columnPage: 'Page',
    columnType: 'Type',
    columnIntent: 'Search intent',
    columnHelpful: 'Helpful',
    columnSpecific: 'Specific',
    columnTrust: 'Trust',
    columnSure: 'Confidence',
    needsCheck: 'please check',
    sure: 'clear',
    morePages: (count) => `and ${count} more pages`,
    weakestCardsHeading: 'The weakest pages',
    pageTypes: {
      HOME: 'Home', SERVICE: 'Service', PRODUCT: 'Product', CATEGORY: 'Category', ARTICLE: 'Article',
      ABOUT: 'About', CONTACT: 'Contact', LEGAL: 'Legal', LANDING: 'Landing page', OTHER: 'Other',
    },
    intents: {
      INFORMATIONAL: 'learn', COMMERCIAL: 'compare', TRANSACTIONAL: 'buy', NAVIGATIONAL: 'find', NONE: 'none',
    },
    competingHeading: 'Pages competing for the same topic',
    competingIntro: 'These pages answer the same search. Merge them or separate them clearly, otherwise they hold each other back.',
    locationsHeading: 'Places with search volume but no page of their own',
    locationsIntro: 'People search for these places, but the website has no dedicated page for them.',
    searchesPerMonth: 'searches per month',
  },
};
