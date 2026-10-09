import { describe, expect, it } from 'vitest';

import { buildDataForSeoEnvelope } from 'src/__mocks__/build-dataforseo-envelope.mock';
import { buildLlmResult } from 'src/__mocks__/build-llm-result.mock';
import {
  buildTextMessage,
  createFakeAnthropicClient,
} from 'src/__mocks__/create-fake-anthropic-client.mock';
import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { runSeoAuditPipeline } from 'src/utils/run-seo-audit-pipeline.util';

const goodPage = (title: string) => `<html lang="de"><head>
  <title>${title} | Fliesen Müller Berlin</title>
  <meta name="description" content="Beschreibung ${title}">
  <meta name="viewport" content="width=device-width">
  <link rel="canonical" href="https://example.com/">
  <script type="application/ld+json">{"@type":"LocalBusiness"}</script>
</head><body><h1>${title}</h1><p>${'Wir verkaufen Fliesen in Berlin. '.repeat(40)}</p></body></html>`;

const json = (payload: unknown) => ({ contentType: 'application/json', body: JSON.stringify(payload) });

const QUERIES = Array.from({ length: 10 }, (_, index) => `Wo kaufe ich gute Fliesen in Berlin, Fall ${index}?`);
const RIVAL_ANSWER = buildDataForSeoEnvelope(
  buildLlmResult({ sourceUrls: ['https://rival.de/fliesen', 'https://www.other.de/'] }),
  { cost: 0.01 },
);

const buildSite = () =>
  createFakeFetch({
    'https://example.com/': { body: goodPage('Start') },
    'https://api.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/live': json(RIVAL_ANSWER),
    'https://api.dataforseo.com/v3/ai_optimization/perplexity/llm_responses/live': json(RIVAL_ANSWER),
    'https://api.dataforseo.com/v3/ai_optimization/gemini/llm_responses/live': json(RIVAL_ANSWER),
  });

const respondAsClassifier = ({ system }: { system: string }) => {
  if (system.includes('questions that real customers ask')) {
    return buildTextMessage({ queries: QUERIES });
  }

  if (system.includes('what kind of business')) {
    return buildTextMessage({ businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.9 });
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
const NOW = new Date('2026-10-09T10:00:00Z');

describe('runSeoAuditPipeline with the AI visibility check', () => {
  it('stays off by default and costs nothing', async () => {
    const { client } = createFakeAnthropicClient(respondAsClassifier);

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'DE',
      anthropicClient: client,
      dataForSeoCredentials: CREDENTIALS,
      fetchImplementation: buildSite(),
      now: NOW,
    });

    expect(result.aiVisibility).toBeNull();
    expect(result.tasks.map((task) => task.ruleId)).not.toContain('AI_NOT_CITED');
    expect(result.reportMarkdown).not.toContain('## KI-Antworten');
  });

  it('asks the AI assistants, scores the presence and turns a missing mention into tasks', async () => {
    const { client } = createFakeAnthropicClient(respondAsClassifier);

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'DE',
      anthropicClient: client,
      dataForSeoCredentials: CREDENTIALS,
      isAiVisibilityEnabled: true,
      fetchImplementation: buildSite(),
      now: NOW,
    });
    const ruleIds = result.tasks.map((task) => task.ruleId);

    expect(result.aiVisibility?.rows).toHaveLength(8);
    expect(result.aiVisibility?.presenceRate).toBe(0);
    expect(result.aiVisibility?.costUsd).toBeCloseTo(0.24);
    expect(ruleIds).toEqual(expect.arrayContaining(['AI_NOT_CITED', 'AI_COMPETITOR_PREFERRED']));
    expect(result.tasks.find((task) => task.ruleId === 'AI_COMPETITOR_PREFERRED')?.description).toContain(
      'rival.de: in 8 Fragen genannt',
    );
    // No presence, readiness 80 (all crawlers, organization markup, no llms.txt, no FAQ markup).
    expect(result.areaScores.AI_VISIBILITY).toBe(24);
    expect(result.reportMarkdown).toContain('## KI-Antworten');
  });

  it('explains in the result that it needs the keys when they are missing', async () => {
    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: null,
      dataForSeoCredentials: null,
      isAiVisibilityEnabled: true,
      fetchImplementation: buildSite(),
      now: NOW,
    });

    expect(result.aiVisibility?.notes).toEqual([
      'AI visibility needs DataForSEO and an Anthropic key. It was skipped.',
    ]);
    expect(result.aiVisibility?.presenceRate).toBeNull();
    expect(result.areaScores.AI_VISIBILITY).toBe(80);
  });
});
