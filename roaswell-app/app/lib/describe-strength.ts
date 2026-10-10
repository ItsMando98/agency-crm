import { getAreaLabel } from '~/lib/labels';
import { type Strength } from '~/lib/twenty/audit-types';

const AI_READINESS_ITEMS: Record<string, string> = {
  CRAWLERS: 'KI-Crawler dürfen die Seite lesen',
  LLMS_TXT: 'llms.txt vorhanden',
  ORGANIZATION: 'Organisations-Markup vorhanden',
  FAQ: 'FAQ-Markup vorhanden',
};

const formatNumber = (value: number): string => new Intl.NumberFormat('de-DE').format(value);

export const describeStrength = (strength: Strength): string => {
  switch (strength.kind) {
    case 'STRONG_AREAS':
      return `Stark aufgestellt: ${strength.areas.map(({ area, score }) => `${getAreaLabel(area)} (${score})`).join(', ')}.`;
    case 'TOP_RANKINGS':
      return `${strength.count} relevante Keywords stehen auf Platz 1 bis 3, zum Beispiel ${strength.examples
        .map(({ keyword, position, searchVolume }) => `\u201e${keyword}\u201c auf Platz ${position} mit ${formatNumber(searchVolume)} Suchen im Monat`)
        .join('; ')}.`;
    case 'HELPFUL_PAGES':
      return `${strength.count} von ${strength.total} bewerteten Seiten sind hilfreich, konkret und vertrauenswürdig.`;
    case 'AI_READINESS':
      return `Für die KI-Suche vorbereitet: ${strength.passed.map((item) => AI_READINESS_ITEMS[item] ?? item).join(', ')}.`;
    case 'AI_PRESENCE':
      return `KI-Assistenten nennen die Website in ${strength.ratePercent} % der Antworten (${strength.queriesTested} Fragen getestet).`;
  }
};
