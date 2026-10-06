import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildRankedKeywordsResult } from 'src/__mocks__/build-ranked-keywords-result.mock';
import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { runSeoAuditPipeline } from 'src/utils/run-seo-audit-pipeline.util';

const goodPage = (title: string, links: string[] = []) => `<html lang="de"><head>
  <title>${title} | Fliesen Müller Berlin</title>
  <meta name="description" content="Beschreibung ${title}">
  <meta name="viewport" content="width=device-width">
  <link rel="canonical" href="https://example.com/">
  <script type="application/ld+json">{"@type":"LocalBusiness"}</script>
</head><body><h1>${title}</h1><p>${'Wir verkaufen Fliesen in Berlin. '.repeat(40)}</p>
${links.map((href) => `<a href="${href}">x</a>`).join('')}</body></html>`;

const json = (payload: unknown) => ({ contentType: 'application/json', body: JSON.stringify(payload) });

const KEYWORDS = [
  { keyword: 'bodenfliesen kaufen', position: 17, volume: 5400, url: 'https://example.com/boden' },
  { keyword: 'wandfliesen', position: 6, volume: 2900, url: 'https://example.com/wand' },
  { keyword: 'keramik butterdose', position: 2, volume: 880, url: 'https://example.com/' },
  { keyword: 'fliesen', position: 1, volume: 40500, url: 'https://example.com/' },
];

const buildSite = (overrides: Record<string, ReturnType<typeof json>> = {}) =>
  createFakeFetch({
    'https://example.com/': { body: goodPage('Start', ['/boden', '/wand']) },
    'https://example.com/boden': { body: goodPage('Bodenfliesen') },
    'https://example.com/wand': { body: goodPage('Wandfliesen') },
    'https://example.com/alt-seite': { status: 404 },
    'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live': json(
      buildDataForSeoEnvelope(buildRankedKeywordsResult(KEYWORDS), { cost: 0.07 }),
    ),
    'https://api.dataforseo.com/v3/backlinks/summary/live': json(
      buildDataForSeoEnvelope({ backlinks: 900, referring_domains: 70, broken_pages: 1 }, { cost: 0.02 }),
    ),
    'https://api.dataforseo.com/v3/backlinks/domain_pages_summary/live': json(
      buildDataForSeoEnvelope({ items: [{ url: 'https://example.com/alt-seite', backlinks: 31, referring_domains: 12 }] }, { cost: 0.03 }),
    ),
    'https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live': json(
      buildDataForSeoEnvelope({ items: [{ domain: 'rival.de', intersections: 340 }] }, { cost: 0.04 }),
    ),
    ...overrides,
  });

const respondAsClassifier = ({ system, messages }: { system: string; messages: { content: string }[] }) => {
  if (system.includes('judge whether search keywords fit')) {
    const lines = messages[0].content.split('\n').filter((line) => /^\d+: /.test(line));

    return buildTextMessage({
      keywords: lines.map((line) => ({
        index: Number(line.split(':')[0]),
        relevance: line.includes('butterdose') ? 0.03 : 0.9,
        confidence: 0.95,
      })),
    });
  }

  if (system.includes('what kind of business')) {
    return buildTextMessage({ businessModel: 'ECOMMERCE', servesLocalArea: false, confidence: 0.9 });
  }

  return buildTextMessage({
    pageType: 'SERVICE',
    searchIntent: 'COMMERCIAL',
    helpfulness: 4,
    specificity: 4,
    trust: 4,
    confidence: 0.9,
  });
};

const CREDENTIALS = { login: 'agency@example.com', password: 'api-secret' };
const NOW = new Date('2026-10-06T10:00:00Z');

describe('runSeoAuditPipeline with DataForSEO', () => {
  it('turns rankings, backlinks and competitors into scored keywords, tasks and a report section', async () => {
    const { client } = createFakeAnthropicClient(respondAsClassifier);

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'DE',
      anthropicClient: client,
      dataForSeoCredentials: CREDENTIALS,
      market: 'DE',
      fetchImplementation: buildSite(),
      now: NOW,
    });

    expect(result.keywords.map((keyword) => [keyword.keyword, keyword.category])).toEqual(
      expect.arrayContaining([
        ['bodenfliesen kaufen', 'NEAR_PAGE_ONE'],
        ['wandfliesen', 'QUICK_WIN'],
        ['keramik butterdose', 'NOT_RELEVANT'],
        ['fliesen', 'TOP_3'],
      ]),
    );
    expect(result.tasks.map((task) => task.ruleId)).toEqual(
      expect.arrayContaining(['KEYWORD_NEAR_PAGE_ONE', 'KEYWORD_QUICK_WINS', 'BACKLINKS_TO_BROKEN_PAGES']),
    );
    expect(result.tasks.find((task) => task.ruleId === 'KEYWORD_NEAR_PAGE_ONE')?.description).toContain(
      '"bodenfliesen kaufen": Platz 17, 5400 Suchen pro Monat',
    );
    expect(result.tasks.find((task) => task.ruleId === 'BACKLINKS_TO_BROKEN_PAGES')?.affectedUrls).toEqual([
      'https://example.com/alt-seite',
    ]);
    expect(result.areaScores.VISIBILITY).toBeGreaterThan(0);
    expect(result.marketData?.costUsd).toBeCloseTo(0.16);
    expect(result.reportMarkdown).toContain('## Sichtbarkeit und Markt');
    expect(result.reportMarkdown).toContain('### Aussortierte Rankings');
    expect(result.reportMarkdown).toContain('- keramik butterdose');
    expect(result.reportMarkdown).toContain('| rival.de | 340 |');
    expect(result.reportMarkdown).not.toContain('DataForSEO nicht eingerichtet');
  });

  it('still finishes with partial market data when the backlinks subscription is missing', async () => {
    const { client } = createFakeAnthropicClient(respondAsClassifier);
    const denied = json(buildDataForSeoEnvelope(null, { taskStatusCode: 40204, statusMessage: 'Access denied.' }));

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: client,
      dataForSeoCredentials: CREDENTIALS,
      fetchImplementation: buildSite({
        'https://api.dataforseo.com/v3/backlinks/summary/live': denied,
        'https://api.dataforseo.com/v3/backlinks/domain_pages_summary/live': denied,
      }),
      now: NOW,
    });

    expect(result.marketData?.rankings).not.toBeNull();
    expect(result.marketData?.backlinks).toBeNull();
    expect(result.tasks.map((task) => task.ruleId)).not.toContain('BACKLINKS_TO_BROKEN_PAGES');
    expect(result.reportMarkdown).toContain('> - Backlinks: Access denied.');
  });

  it('reports rejected credentials in the report instead of failing the audit', async () => {
    const { client } = createFakeAnthropicClient(respondAsClassifier);
    const rejected = { status: 401, ...json({ status_code: 40100, status_message: 'Authentication failed' }) };

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: client,
      dataForSeoCredentials: CREDENTIALS,
      fetchImplementation: createFakeFetch({
        'https://example.com/': { body: goodPage('Start') },
        'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live': rejected,
        'https://api.dataforseo.com/v3/backlinks/summary/live': rejected,
        'https://api.dataforseo.com/v3/backlinks/domain_pages_summary/live': rejected,
        'https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live': rejected,
      }),
      now: NOW,
    });

    expect(result.marketData?.rankings).toBeNull();
    expect(result.areaScores.VISIBILITY).toBeUndefined();
    expect(result.reportMarkdown).toContain('> - Rankings: Authentication failed');
  });

  it('keeps keywords for review when no Anthropic key is configured', async () => {
    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: null,
      dataForSeoCredentials: CREDENTIALS,
      fetchImplementation: buildSite(),
      now: NOW,
    });

    expect(result.keywords.every((keyword) => keyword.category === 'NEEDS_REVIEW')).toBe(true);
    expect(result.areaScores.VISIBILITY).toBeUndefined();
    expect(result.tasks.map((task) => task.ruleId)).not.toContain('KEYWORD_NEAR_PAGE_ONE');
    expect(result.marketData?.notes).toContain(
      'Keyword relevance was not judged because no Anthropic key is configured.',
    );
  });

  it('skips market data without credentials', async () => {
    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: null,
      fetchImplementation: buildSite(),
      now: NOW,
    });

    expect(result.marketData).toBeNull();
    expect(result.keywords).toEqual([]);
  });
});
