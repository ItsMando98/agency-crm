import { describe, expect, it } from 'vitest';

import { createFakeAnthropicClient, buildTextMessage } from 'src/__mocks__/create-fake-anthropic-client.mock';
import { createFakeFetch } from 'src/__mocks__/create-fake-fetch.mock';
import { runSeoAuditPipeline } from 'src/utils/run-seo-audit-pipeline.util';

const goodPage = (title: string, extraLinks: string[] = []) => `<html lang="de"><head>
  <title>${title} | Musterfirma Berlin</title>
  <meta name="description" content="Beschreibung für ${title}">
  <meta name="viewport" content="width=device-width">
  <link rel="canonical" href="https://example.com/">
  <script type="application/ld+json">{"@type":"Organization"}</script>
</head><body><h1>${title}</h1><p>${'Wir sind ein Handwerksbetrieb in Berlin und helfen schnell. '.repeat(30)}</p>
${extraLinks.map((href) => `<a href="${href}">x</a>`).join('')}</body></html>`;

const SITE = createFakeFetch({
  'https://example.com/': { body: goodPage('Start', ['/leistungen', '/kaputt']) },
  'https://example.com/leistungen': { body: goodPage('Leistungen') },
  'https://example.com/kaputt': { status: 404 },
  'https://example.com/robots.txt': { contentType: 'text/plain', body: 'User-agent: *\nDisallow:' },
  'https://example.com/sitemap.xml': {
    contentType: 'application/xml',
    body: '<urlset><url><loc>https://example.com/leistungen</loc></url></urlset>',
  },
});

const NOW = new Date('2026-10-06T10:00:00Z');

describe('runSeoAuditPipeline', () => {
  it('produces score, tasks and a report from crawl, rules and classifier', async () => {
    const { client } = createFakeAnthropicClient(({ system }) =>
      system.includes('what kind of business')
        ? buildTextMessage({ businessModel: 'LOCAL_SERVICE', servesLocalArea: true, confidence: 0.95 })
        : buildTextMessage({
            pageType: 'SERVICE',
            searchIntent: 'COMMERCIAL',
            helpfulness: 1,
            specificity: 2,
            trust: 4,
            confidence: 0.9,
          }),
    );

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'DE',
      anthropicClient: client,
      fetchImplementation: SITE,
      now: NOW,
    });
    const ruleIds = result.tasks.map((task) => task.ruleId);

    expect(result.pages.map((page) => page.url).sort()).toEqual([
      'https://example.com/',
      'https://example.com/kaputt',
      'https://example.com/leistungen',
    ]);
    expect(result.assessments).toHaveLength(2);
    expect(ruleIds).toEqual(
      expect.arrayContaining([
        'BROKEN_LINK_ON_HOMEPAGE',
        'BROKEN_INTERNAL_LINKS',
        'LOW_HELPFULNESS',
        'LOCAL_BUSINESS_SCHEMA_MISSING',
      ]),
    );
    expect(result.areaScores.CONTENT_QUALITY).toBeLessThan(40);
    expect(result.areaScores.SECURITY).toBe(100);
    expect(result.score).toBeLessThan(90);
    expect(result.grade).toMatch(/^[A-F]$/);
    expect(result.reportMarkdown).toContain('# SEO-Audit: https://example.com');
    expect(result.reportMarkdown).toContain('Seiten helfen dem Besucher kaum weiter');
  });

  it('checks how ready the site is for AI crawlers and scores it as its own area', async () => {
    const site = createFakeFetch({
      'https://example.com/': { body: goodPage('Start') },
      'https://example.com/robots.txt': {
        contentType: 'text/plain',
        body: 'User-agent: GPTBot\nDisallow: /',
      },
      'https://example.com/llms.txt': { contentType: 'text/plain', body: '# Example\n> Handwerk in Berlin' },
    });

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: null,
      fetchImplementation: site,
      now: NOW,
    });
    const ruleIds = result.tasks.map((task) => task.ruleId);

    expect(result.aiReadiness.crawlerAccess.GPTBOT).toBe('BLOCKED');
    expect(result.aiReadiness.llmsTxtFound).toBe(true);
    expect(ruleIds).toContain('AI_CRAWLERS_BLOCKED');
    expect(ruleIds).toContain('FAQ_SCHEMA_MISSING');
    expect(ruleIds).not.toContain('LLMS_TXT_MISSING');
    expect(result.areaScores.AI_VISIBILITY).toBe(80);
    expect(result.reportMarkdown).toContain('## AI readiness');
    expect(result.reportMarkdown).toContain('| Crawler access: GPTBot | blocked |');
  });

  it('runs on measured rules only when no classifier is configured', async () => {
    const result = await runSeoAuditPipeline({
      domain: 'https://example.com',
      language: 'EN',
      anthropicClient: null,
      fetchImplementation: SITE,
      now: NOW,
    });

    expect(result.assessments).toEqual([]);
    expect(result.areaScores.CONTENT_QUALITY).toBeUndefined();
    expect(result.reportMarkdown).toContain('Content quality was not assessed');
  });

  it('rejects domains in the private network before any request', async () => {
    await expect(
      runSeoAuditPipeline({
        domain: 'http://169.254.169.254',
        language: 'EN',
        anthropicClient: null,
        fetchImplementation: SITE,
      }),
    ).rejects.toThrow('not a public hostname');
  });

  it('keeps going when single pages cannot be classified', async () => {
    const { client } = createFakeAnthropicClient(() => ({ stop_reason: 'max_tokens', content: [] }));

    const result = await runSeoAuditPipeline({
      domain: 'example.com',
      language: 'EN',
      anthropicClient: client,
      fetchImplementation: SITE,
      now: NOW,
    });

    expect(result.assessments).toEqual([]);
    expect(result.tasks.length).toBeGreaterThan(0);
  });
});
