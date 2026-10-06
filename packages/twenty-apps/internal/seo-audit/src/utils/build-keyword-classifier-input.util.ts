import { type KeywordSiteContext } from 'src/types/keyword-site-context';

export const buildKeywordClassifierInput = (
  context: KeywordSiteContext,
  keywords: string[],
): string =>
  [
    'Business description:',
    '<business>',
    `Homepage title: ${context.title ?? '(none)'}`,
    `Homepage description: ${context.metaDescription ?? '(none)'}`,
    `Business model guess: ${context.businessModel ?? '(unknown)'}`,
    `Page titles: ${context.pageTitles.join(' | ') || '(none)'}`,
    '</business>',
    '',
    'Keywords:',
    '<keywords>',
    ...keywords.map((keyword, index) => `${index}: ${keyword}`),
    '</keywords>',
  ].join('\n');
