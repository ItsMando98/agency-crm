import { MARKETS } from 'src/constants/dataforseo.const';
import { type AiQuerySiteContext } from 'src/types/ai-query-site-context';
import { type Market } from 'src/types/market';

const describeFlag = (value: boolean | null): string => {
  if (value === null) {
    return 'unknown';
  }

  return value ? 'yes' : 'no';
};

export const buildAiQueryInput = (
  context: AiQuerySiteContext,
  market: Market,
): string => {
  const { label, languageCode } = MARKETS[market];

  return [
    `Website title: ${context.title ?? 'unknown'}`,
    `Website description: ${context.metaDescription ?? 'unknown'}`,
    `Business model: ${context.businessModel ?? 'unknown'}`,
    `Serves a local area: ${describeFlag(context.servesLocalArea)}`,
    `Market: ${label}`,
    `Write the questions in this language: ${languageCode}`,
    'Page titles:',
    ...context.pageTitles.map((title) => `- ${title}`),
  ].join('\n');
};
