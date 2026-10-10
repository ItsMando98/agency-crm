// Builds docs/audit-ablauf.html from the app source.
// Run: node scripts/build-flow-doc.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as source from './flow-doc-source.mjs';

const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'audit-ablauf.html');
const { num, str, template } = source;

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const seconds = (milliseconds) => `${milliseconds / 1000} s`;
const code = (value) => `<code>${esc(value)}</code>`;

// ---------------------------------------------------------------- facts

const crawl = {
  userAgent: str('constants/crawl.const.ts', 'CRAWL_USER_AGENT'),
  maxPages: num('constants/crawl.const.ts', 'MAX_CRAWLED_PAGES'),
  linkChecks: num('constants/crawl.const.ts', 'MAX_LINK_TARGET_CHECKS'),
  concurrency: num('constants/crawl.const.ts', 'CRAWL_CONCURRENCY'),
  fetchTimeout: num('constants/crawl.const.ts', 'FETCH_TIMEOUT_MS'),
  redirects: num('constants/crawl.const.ts', 'MAX_REDIRECTS'),
  bodyBytes: num('constants/crawl.const.ts', 'MAX_BODY_BYTES'),
  excerpt: num('constants/crawl.const.ts', 'MAX_TEXT_EXCERPT_CHARS'),
  sitemapDepth: num('constants/crawl.const.ts', 'SITEMAP_NESTING_LIMIT'),
  budget: num('constants/crawl.const.ts', 'CRAWL_TIME_BUDGET_MS'),
};

const model = str('constants/classifier.const.ts', 'CLASSIFIER_MODEL');
const classifier = {
  concurrency: num('constants/classifier.const.ts', 'CLASSIFIER_CONCURRENCY'),
  pageTokens: num('constants/classifier.const.ts', 'PAGE_ASSESSMENT_MAX_TOKENS'),
  profileTokens: num('constants/classifier.const.ts', 'SITE_PROFILE_MAX_TOKENS'),
  keywordTokens: num('constants/keyword-classifier.const.ts', 'KEYWORD_ASSESSMENT_MAX_TOKENS'),
  keywordBatch: num('constants/seo-thresholds.const.ts', 'KEYWORD_BATCH_SIZE'),
  keywordMax: num('constants/seo-thresholds.const.ts', 'MAX_CLASSIFIED_KEYWORDS'),
};

const dfs = {
  timeout: num('constants/dataforseo.const.ts', 'DATAFORSEO_REQUEST_TIMEOUT_MS'),
  lighthouseTimeout: num('constants/dataforseo.const.ts', 'DATAFORSEO_LIGHTHOUSE_TIMEOUT_MS'),
  rankedLimit: num('constants/dataforseo.const.ts', 'RANKED_KEYWORDS_LIMIT'),
  competitorsLimit: num('constants/dataforseo.const.ts', 'COMPETITORS_LIMIT'),
  backlinkLimit: num('constants/dataforseo.const.ts', 'BACKLINK_TARGETS_LIMIT'),
};

const ai = {
  queryCount: num('constants/ai-visibility.const.ts', 'AI_QUERY_COUNT'),
  minQueries: num('constants/ai-visibility.const.ts', 'AI_MIN_QUERIES'),
  minLength: num('constants/ai-visibility.const.ts', 'AI_QUERY_MIN_LENGTH'),
  maxLength: num('constants/ai-visibility.const.ts', 'AI_QUERY_MAX_LENGTH'),
  maxRequests: num('constants/ai-visibility.const.ts', 'AI_MAX_REQUESTS'),
  attempts: num('constants/ai-visibility.const.ts', 'AI_MAX_ATTEMPTS'),
  retryDelay: num('constants/ai-visibility.const.ts', 'AI_RETRY_DELAY_MS'),
  attemptsWhenTold: num('constants/ai-visibility.const.ts', 'AI_MAX_ATTEMPTS_WHEN_TOLD_TO_WAIT'),
  maxRetryAfter: num('constants/ai-visibility.const.ts', 'AI_MAX_RETRY_AFTER_MS'),
  dfsConcurrency: num('constants/ai-visibility.const.ts', 'AI_REQUEST_CONCURRENCY'),
  dfsTimeout: num('constants/ai-visibility.const.ts', 'AI_REQUEST_TIMEOUT_MS'),
  dfsDeadline: num('constants/ai-visibility.const.ts', 'AI_DEADLINE_MS'),
  tregConcurrency: num('constants/ai-visibility.const.ts', 'TREG_REQUEST_CONCURRENCY'),
  tregTimeout: num('constants/ai-visibility.const.ts', 'TREG_REQUEST_TIMEOUT_MS'),
  tregDeadline: num('constants/ai-visibility.const.ts', 'TREG_DEADLINE_MS'),
  tregMaxCost: str('constants/ai-visibility.const.ts', 'TREG_MAX_COST_PER_CALL_USD'),
  queryTokens: num('constants/ai-visibility.const.ts', 'QUERY_GENERATION_MAX_TOKENS'),
  mentionedWeight: num('constants/ai-visibility.const.ts', 'AI_MENTIONED_WEIGHT'),
  presenceShare: num('constants/ai-visibility.const.ts', 'AI_SCORE_PRESENCE_SHARE'),
  minForFindings: num('constants/ai-visibility.const.ts', 'AI_MIN_QUERIES_FOR_FINDINGS'),
  minAnswer: num('constants/ai-visibility.const.ts', 'AI_MIN_ANSWER_LENGTH'),
  minBrand: num('constants/ai-visibility.const.ts', 'AI_MIN_BRAND_NAME_LENGTH'),
  engines: source.engines(),
  treg: source.tregEndpoints(),
  retryPattern: source.retryPattern(),
};

const summaryModel = str('constants/classifier.const.ts', 'SUMMARY_MODEL');
const competing = {
  tokens: num('constants/competing-pages.const.ts', 'COMPETING_PAGES_MAX_TOKENS'),
  minPages: num('constants/competing-pages.const.ts', 'COMPETING_PAGES_MIN_PAGES'),
  maxGroups: num('constants/competing-pages.const.ts', 'COMPETING_PAGES_MAX_GROUPS'),
  maxInput: num('constants/competing-pages.const.ts', 'COMPETING_PAGES_MAX_INPUT_PAGES'),
  prompt: template('constants/competing-pages.const.ts', 'COMPETING_PAGES_SYSTEM_PROMPT'),
};
const summary = {
  tokens: num('constants/audit-summary.const.ts', 'AUDIT_SUMMARY_MAX_TOKENS'),
  maxItems: num('constants/audit-summary.const.ts', 'SUMMARY_MAX_ITEMS_PER_SECTION'),
  maxLength: num('constants/audit-summary.const.ts', 'SUMMARY_MAX_ITEM_LENGTH'),
  maxTasks: num('constants/audit-summary.const.ts', 'FACT_SHEET_MAX_TASKS'),
  prompt: template('constants/audit-summary.const.ts', 'AUDIT_SUMMARY_SYSTEM_PROMPT'),
};
const stuckMinutes = num('constants/seo-audit.constants.ts', 'STUCK_AUDIT_TIMEOUT_MINUTES');
const pdfTimeout = num('constants/report.const.ts', 'PDF_RENDER_TIMEOUT_MS');
const keywordRecords = num('constants/seo-thresholds.const.ts', 'MAX_KEYWORD_RECORDS');
const notRelevantRecords = num('constants/seo-thresholds.const.ts', 'MAX_NOT_RELEVANT_KEYWORD_RECORDS');

const untrustedNotice = str('constants/classifier-system-prompts.const.ts', 'UNTRUSTED_CONTENT_NOTICE');
const pagePrompt = template('constants/classifier-system-prompts.const.ts', 'PAGE_ASSESSMENT_SYSTEM_PROMPT', {
  UNTRUSTED_CONTENT_NOTICE: untrustedNotice,
});
const profilePrompt = template('constants/classifier-system-prompts.const.ts', 'SITE_PROFILE_SYSTEM_PROMPT', {
  UNTRUSTED_CONTENT_NOTICE: untrustedNotice,
});
const keywordPrompt = template('constants/keyword-classifier.const.ts', 'KEYWORD_ASSESSMENT_SYSTEM_PROMPT');
const queryPrompt = template(
  'constants/ai-query-generation.const.ts',
  'AI_QUERY_SYSTEM_PROMPT',
  { AI_QUERY_REQUESTED_COUNT: ai.queryCount + 2 },
);

const pageTypes = source.objectKeys('constants/seo-audit.constants.ts', 'PAGE_TYPE');
const intents = source.objectKeys('constants/seo-audit.constants.ts', 'SEARCH_INTENT');
const businessModels = source.objectKeys('constants/seo-audit.constants.ts', 'BUSINESS_MODEL');

const schemas = {
  page: {
    type: 'object',
    properties: {
      pageType: { type: 'string', enum: pageTypes },
      searchIntent: { type: 'string', enum: intents },
      helpfulness: { type: 'integer', enum: [1, 2, 3, 4, 5] },
      specificity: { type: 'integer', enum: [1, 2, 3, 4, 5] },
      trust: { type: 'integer', enum: [1, 2, 3, 4, 5] },
      confidence: { type: 'number' },
    },
    required: ['pageType', 'searchIntent', 'helpfulness', 'specificity', 'trust', 'confidence'],
    additionalProperties: false,
  },
  profile: {
    type: 'object',
    properties: {
      businessModel: { type: 'string', enum: businessModels },
      servesLocalArea: { type: 'boolean' },
      confidence: { type: 'number' },
    },
    required: ['businessModel', 'servesLocalArea', 'confidence'],
    additionalProperties: false,
  },
  keywords: {
    type: 'object',
    properties: {
      keywords: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            index: { type: 'integer' },
            relevance: { type: 'number' },
            confidence: { type: 'number' },
            place: { type: 'string' },
          },
          required: ['index', 'relevance', 'confidence', 'place'],
          additionalProperties: false,
        },
      },
    },
    required: ['keywords'],
    additionalProperties: false,
  },
  queries: {
    type: 'object',
    properties: { queries: { type: 'array', items: { type: 'string' } } },
    required: ['queries'],
    additionalProperties: false,
  },
};

schemas.competing = {
  type: 'object',
  properties: {
    groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: { topic: { type: 'string' }, pages: { type: 'array', items: { type: 'integer' } } },
        required: ['topic', 'pages'],
        additionalProperties: false,
      },
    },
  },
  required: ['groups'],
  additionalProperties: false,
};
schemas.summary = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
    thisWeek: { type: 'array', items: { type: 'string' } },
    thisMonth: { type: 'array', items: { type: 'string' } },
    thisQuarter: { type: 'array', items: { type: 'string' } },
  },
  required: ['headline', 'strengths', 'blockers', 'thisWeek', 'thisMonth', 'thisQuarter'],
  additionalProperties: false,
};

const dfsPaths = {
  rankings: source.dataForSeoPath('fetch-ranked-keywords.ts'),
  summary: source.dataForSeoPath('fetch-backlink-summary.ts'),
  targets: source.dataForSeoPath('fetch-backlink-targets.ts'),
  competitors: source.dataForSeoPath('fetch-competitors.ts'),
  lighthouse: source.dataForSeoPath('fetch-lighthouse.ts'),
};

// The prompt templates hold code placeholders. They are replaced by what they
// stand for, so the text reads like the message the model really gets.
function readableCreatorPrompt(text) {
  const replacements = [
    ['${describeCreator(creator)}', '[Aussehen, Persona und Themenfeld aus dem Profil]'],
    ['${scene}', '[Szene aus dem Auftrag]'],
    ['${rulesSuffix(creator)}', ' [Regeln aus dem Profil, falls vorhanden: "Rules to respect: ..."]'],
    ['${speech}', '[Sprechtext, siehe unten]'],
  ];

  return replacements.reduce((current, [placeholder, value]) => current.replaceAll(placeholder, value), text);
}

const creator = {
  imageEndpoint: source.creatorStr('constants/creator-studio.const.ts', 'IMAGE_MODEL'),
  imageWait: source.creatorNum('constants/creator-studio.const.ts', 'IMAGE_MAX_WAIT_MS'),
  videoWait: source.creatorNum('constants/creator-studio.const.ts', 'VIDEO_MAX_WAIT_MS'),
  poll: source.creatorNum('constants/creator-studio.const.ts', 'POLL_INTERVAL_MS'),
  stuck: source.creatorNum('constants/creator-studio.const.ts', 'STUCK_ASSET_TIMEOUT_MINUTES'),
  imagePrompt: readableCreatorPrompt(source.creatorPromptSource('buildImagePrompt')),
  videoPrompt: readableCreatorPrompt(source.creatorPromptSource('buildVideoPrompt')),
};

// ---------------------------------------------------------------- html parts

const SERVICES = {
  TWENTY: { label: 'Twenty (CRM)', className: 'svc-twenty' },
  WEB: { label: 'Ziel-Website', className: 'svc-web' },
  ANTHROPIC: { label: 'Anthropic', className: 'svc-anthropic' },
  DATAFORSEO: { label: 'DataForSEO', className: 'svc-dataforseo' },
  TREG: { label: 'treg', className: 'svc-treg' },
  PDF: { label: 'PDF-Renderer', className: 'svc-pdf' },
  CODE: { label: 'Eigener Code', className: 'svc-code' },
};

const badge = (service) =>
  `<span class="badge ${SERVICES[service].className}">${esc(SERVICES[service].label)}</span>`;

const rows = (entries) =>
  `<dl class="facts">${entries
    .map(([key, value]) => `<dt>${esc(key)}</dt><dd>${value}</dd>`)
    .join('')}</dl>`;

const promptBlock = (title, system, userTemplate, schema, meta) => `
  <details class="prompt">
    <summary>${esc(title)}</summary>
    ${meta ? `<p class="meta">${meta}</p>` : ''}
    <h5>System-Prompt</h5>
    <pre>${esc(system)}</pre>
    <h5>User-Nachricht (Vorlage)</h5>
    <pre>${esc(userTemplate)}</pre>
    ${schema ? `<h5>Erzwungenes Antwortformat (JSON-Schema)</h5><pre>${esc(JSON.stringify(schema, null, 2))}</pre>` : ''}
  </details>`;

const call = ({ service, method, target, title, facts = [], extra = '' }) => `
  <article class="call" data-service="${service}">
    <header>
      ${badge(service)}
      <span class="method">${esc(method)}</span>
      <span class="target">${esc(target)}</span>
    </header>
    ${title ? `<p class="call-title">${title}</p>` : ''}
    ${facts.length > 0 ? rows(facts) : ''}
    ${extra}
  </article>`;

const step = (text, services = []) => `
  <li data-service="${services.join(' ')}">${services.map(badge).join(' ')} ${text}</li>`;

const phase = ({ id, marker, title, when, summary, services, body }) => `
  <section class="phase" id="${id}" data-services="${services.join(' ')}">
    <div class="phase-marker"><span>${esc(marker)}</span></div>
    <div class="phase-body">
      <h3>${esc(title)}</h3>
      <p class="when">${when}</p>
      <p>${summary}</p>
      ${body}
    </div>
  </section>`;

const userPage = [
  'URL: https://beispiel.de/leistungen/seo',
  'Title: SEO Agentur Berlin | Beispiel',
  'Meta description: Wir bringen Ihre Website in Google nach vorne.',
  'H1 count: 1',
  'Word count: 640',
  '',
  'Text excerpt (may be cut off):',
  '<page_content>',
  `(bis zu ${crawl.excerpt} Zeichen sichtbarer Text der Seite)`,
  '</page_content>',
].join('\n');

const userKeywords = [
  'Business description:',
  '<business>',
  'Homepage title: SEO Agentur Berlin | Beispiel',
  'Homepage description: Wir bringen Ihre Website in Google nach vorne.',
  'Business model guess: SERVICE',
  'Page titles: Start | Leistungen | Kontakt | ... (bis zu 20)',
  '</business>',
  '',
  'Keywords:',
  '<keywords>',
  '0: seo agentur berlin',
  '1: backrezept apfelkuchen',
  `... (bis zu ${classifier.keywordBatch} pro Anfrage)`,
  '</keywords>',
].join('\n');

const userQueries = [
  'Website title: SEO Agentur Berlin | Beispiel',
  'Website description: Wir bringen Ihre Website in Google nach vorne.',
  'Business model: SERVICE',
  'Serves a local area: yes',
  'Market: Germany',
  'Write the questions in this language: de',
  'Page titles:',
  '- Start',
  '- Leistungen',
  '- ... (bis zu 20)',
].join('\n');

const userCompeting = [
  'Pages of one website:',
  '<pages>',
  '0: Kündigungsfrist berechnen | https://beispiel.de/kuendigungsfrist | SERVICE | COMMERCIAL',
  '1: Kündigungsfristen im Überblick | https://beispiel.de/blog/kuendigungsfristen | ARTICLE | INFORMATIONAL',
  '2: Kontakt | https://beispiel.de/kontakt | CONTACT | NAVIGATIONAL',
  `... (bis zu ${competing.maxInput} Seiten)`,
  '</pages>',
].join('\n');

const userSummary = [
  'Write the summary in German.',
  '',
  'Facts of the audit:',
  '<facts>',
  '{ "website": "https://beispiel.de", "score": 74, "grade": "C", "scoreWithoutContentJudgement": 91,',
  '  "areas": { "Sicherheit": 100, "Inhaltsqualität": 34, ... },',
  `  "tasks": { "total": 10, "critical": 0, "items": [ { "number": 1, "title": "...", "horizon": "WEEK", ... } ] },  // bis zu ${summary.maxTasks}`,
  '  "pages": { "assessed": 60, "clearJudgementsPercent": 69, "weakest": [ ... ] },',
  '  "keywords": { "rankedTotal": 6500, "topThree": 122, "quickWins": 8, "best": [ ... ] },',
  '  "backlinks": { "total": ..., "deadTargetPages": 6 }, "aiVisibility": { ... },',
  '  "strengths": [ "..." ], "competingTopics": [ ... ], "placesWithoutPage": [ ... ] }',
  '</facts>',
].join('\n');

// ---------------------------------------------------------------- phases

const phases = [];

phases.push(
  phase({
    id: 'p-trigger',
    marker: '0',
    title: 'Auslöser: ein Audit-Datensatz entsteht',
    when: 'Zeitpunkt t = 0. Du klickst "Audit starten" in der Webapp, auf der Setup-Seite in Twenty oder ein Agent ruft das Tool auf.',
    summary:
      'Ein Audit ist ein Datensatz vom Typ <code>seoAudit</code> mit dem Status <code>QUEUED</code>. Erst dieser Datensatz löst die eigentliche Arbeit aus.',
    services: ['TWENTY'],
    body: `
      ${call({
        service: 'TWENTY',
        method: 'POST',
        target: '{TWENTY_API_URL}/rest/seoAudits',
        title: 'Webapp: legt den Datensatz an (Bearer API-Key, nur serverseitig)',
        facts: [
          ['Body', code('{ name, domain, language: "DE"|"EN", status: "QUEUED" }')],
          ['Wer', 'Nur Team-Login. Kunden im Portal dürfen keine Audits starten.'],
        ],
      })}
      ${call({
        service: 'TWENTY',
        method: 'GraphQL',
        target: 'createSeoAudit  (CoreApiClient in der Twenty-App)',
        title: 'Setup-Seite in Twenty: derselbe Datensatz, andere Tür',
      })}
      ${call({
        service: 'TWENTY',
        method: 'Tool',
        target: 'start_seo_audit  { domain | companyId, language? }',
        title: 'Agent: prüft zuerst, ob für die Domain schon ein Audit der letzten 30 Minuten läuft',
      })}
      ${call({
        service: 'CODE',
        method: 'Event',
        target: 'seoAudit.created  ->  Funktion run-seo-audit  (Timeout 600 s)',
        title:
          'Twenty ruft die Funktion sofort nach dem Anlegen auf. Läuft nichts, wenn die Domain leer ist (Entwurf) oder der Status schon etwas anderes als QUEUED ist.',
        facts: [
          ['Zweiter Auslöser', `${code('seoAudit.updated')} auf den Feldern domain und status: startet erneut, wenn die Domain geändert oder der Status wieder auf QUEUED gesetzt wird. Läufe mit Status RUNNING oder DONE starten nie neu.`],
        ],
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-prepare',
    marker: '1',
    title: 'Vorbereitung',
    when: 'Direkt nach dem Auslöser, einige Millisekunden.',
    summary:
      'Die Funktion liest ihre Einstellungen aus den App-Variablen (Keys, Markt, Sprache, Seitenlimit, KI-Schalter), normalisiert die Domain und setzt den Status auf RUNNING.',
    services: ['TWENTY'],
    body: `
      ${call({
        service: 'TWENTY',
        method: 'GraphQL',
        target: 'updateSeoAudit',
        title: 'Status auf RUNNING setzen',
        facts: [['Daten', code('{ status: "RUNNING", startedAt, failureReason: null, finishedAt: null }')]],
      })}
      <p class="note">Die Domain wird zu einem Ursprung wie <code>https://beispiel.de</code> normalisiert. Ist sie ungültig, endet der Audit sofort als FAILED.</p>`,
  }),
);

phases.push(
  phase({
    id: 'p-crawl',
    marker: '2',
    title: 'Crawl der Website',
    when: 'Beginnt sofort. Die Dauer hängt von der Website ab, das harte Zeitbudget liegt bei ' + seconds(crawl.budget) + '.',
    summary:
      'Der Crawler arbeitet ohne bezahlte Dienste. Er ruft nur die Website selbst ab, höflich und mit Grenzen. Danach steht fest, welche Seiten es gibt und was auf ihnen steht.',
    services: ['WEB'],
    body: `
      <ol class="steps">
        ${step(`${code('GET /')} Startseite. Ist sie nicht erreichbar (Status 0 oder 400 und höher), bricht der Audit mit Fehler ab.`, ['WEB'])}
        ${step(`${code('GET /robots.txt')} Regeln und Sitemap-Verweise. Die Regeln für ${code('twentyseoauditbot')} werden beim Crawlen eingehalten.`, ['WEB'])}
        ${step(`${code('GET /llms.txt')} Nur für die KI-Bereitschaft. Eine HTML-Fehlerseite mit Status 200 zählt nicht als Datei.`, ['WEB'])}
        ${step(`Sitemap: aus robots.txt oder ${code('/sitemap.xml')}, verschachtelte Sitemaps bis Tiefe ${crawl.sitemapDepth}, höchstens das Fünffache des Seitenlimits an URLs.`, ['WEB'])}
        ${step(`Wellen: je ${crawl.concurrency * 2} URLs, ${crawl.concurrency} parallel, bis ${crawl.maxPages} Seiten oder das Zeitbudget erreicht ist. Links einer Seite kommen in die Warteschlange.`, ['WEB'])}
        ${step(`Linkprüfung: bis zu ${crawl.linkChecks} noch unbekannte interne Link-Ziele per ${code('HEAD')} (bei 405 oder 501 per GET), ${crawl.concurrency} parallel.`, ['WEB'])}
      </ol>
      ${rows([
        ['User-Agent', code(crawl.userAgent)],
        ['Timeout pro Abruf', seconds(crawl.fetchTimeout)],
        ['Weiterleitungen', `höchstens ${crawl.redirects}, jede Stufe wird erneut geprüft`],
        ['Größe pro Seite', `höchstens ${(crawl.bodyBytes / 1_000_000).toFixed(0)} MB`],
        ['Schutz', 'Private und interne Adressen werden nie abgerufen (kein Weg ins eigene Netz).'],
        ['Pro Seite gespeichert', `Status, Antwortzeit, Titel, Meta-Beschreibung, H1-Anzahl, Wortzahl, strukturierte Daten, Links, Textauszug bis ${crawl.excerpt} Zeichen`],
      ])}
      <p class="note">Danach, ohne weiteren Abruf: die <strong>KI-Bereitschaft</strong> wird aus dem Ergebnis berechnet (robots.txt für GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended; llms.txt; Organization-Markup; FAQ-Markup).</p>`,
  }),
);

phases.push(
  phase({
    id: 'p-profile',
    marker: '3',
    title: 'Profil der Website (Anthropic, ein Aufruf)',
    when: 'Direkt nach dem Crawl. Nur wenn ein Anthropic-Key da ist und die Startseite auswertbar ist (HTML, Status 200 bis 399).',
    summary:
      'Das Modell entscheidet, welche Art Unternehmen hinter der Website steht und ob es lokal arbeitet. Das Ergebnis steuert später die Fragen für den KI-Check und die Bewertung der Keywords.',
    services: ['ANTHROPIC'],
    body: `
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create  (Anthropic SDK, Timeout 60 s, SDK-Standard: 2 Wiederholungen bei 408, 409, 429, 5xx)',
        facts: [
          ['Modell', code(model)],
          ['max_tokens', String(classifier.profileTokens)],
          ['Antwortformat', `${code('output_config.format = json_schema')}: das Modell kann nur gültiges JSON in diesem Schema liefern`],
          ['Parallel', '1 Aufruf'],
          ['Fehlerfall', 'Falscher oder gesperrter Key bricht den Audit ab. Jeder andere Fehler gibt nur "kein Ergebnis" und steht als Notiz im Bericht.'],
        ],
        extra: promptBlock('Prompt anzeigen: Profil der Website', profilePrompt, userPage, schemas.profile, 'Die User-Nachricht ist dieselbe Seitenvorlage wie bei der Seitenbewertung, hier mit der Startseite.'),
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-parallel',
    marker: '4',
    title: 'Drei Stränge laufen gleichzeitig',
    when: 'Alle drei starten nach dem Crawl. Strang C wartet nur auf das Profil aus dem vorigen Schritt.',
    summary:
      'Seitenbewertung, Marktdaten und KI-Check sind unabhängig. Jeder Strang scheitert für sich: ein Ausfall kostet nur seinen Teil und wird im Bericht als Notiz genannt.',
    services: ['ANTHROPIC', 'DATAFORSEO', 'TREG'],
    body: `
      <div class="lanes">
        <div class="lane"><h4>Strang A</h4><p>Seiten bewerten</p><span class="lane-svc">${badge('ANTHROPIC')}</span></div>
        <div class="lane"><h4>Strang B</h4><p>Marktdaten</p><span class="lane-svc">${badge('DATAFORSEO')}</span></div>
        <div class="lane"><h4>Strang C</h4><p>KI-Sichtbarkeit</p><span class="lane-svc">${badge('ANTHROPIC')} ${badge('TREG')} <em>oder</em> ${badge('DATAFORSEO')}</span></div>
      </div>`,
  }),
);

phases.push(
  phase({
    id: 'p-a',
    marker: 'A',
    title: 'Strang A: jede Seite einzeln bewerten (Anthropic)',
    when: 'Läuft parallel zu B und C. Eine Anfrage pro auswertbarer Seite.',
    summary:
      'Das Modell bewertet jede Seite auf drei Skalen (Hilfreichkeit, Konkretheit, Vertrauen), bestimmt Seitentyp und Suchabsicht und sagt, wie sicher es sich ist. Es schreibt nie Ratschläge.',
    services: ['ANTHROPIC'],
    body: `
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create',
        title: `Eine Anfrage je Seite, bis zu ${crawl.maxPages} Seiten`,
        facts: [
          ['Modell', code(model)],
          ['max_tokens', String(classifier.pageTokens)],
          ['Parallel', `${classifier.concurrency} gleichzeitig`],
          ['Übergeben wird', `Nur URL, Titel, Meta-Beschreibung, H1-Anzahl, Wortzahl und der Textauszug (${crawl.excerpt} Zeichen), umschlossen von ${code('<page_content>')}`],
          ['Ergebnis', 'Seiten mit Konfidenz unter 0,7 werden als "prüfen" markiert'],
        ],
        extra: promptBlock('Prompt anzeigen: Bewertung einer Seite', pagePrompt, userPage, schemas.page),
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-b',
    marker: 'B',
    title: 'Strang B: Marktdaten (DataForSEO, nur mit Zugangsdaten)',
    when: 'Läuft parallel zu A und C. Fünf Anfragen starten gleichzeitig.',
    summary:
      'Ohne DataForSEO-Login überspringt der Audit diesen Strang. Jede Anfrage scheitert für sich, ein fehlendes Backlink-Abo kostet nicht die Rankings.',
    services: ['DATAFORSEO'],
    body: `
      <p class="note">Basis ${code('https://api.dataforseo.com')}, Anmeldung per Basic Auth mit API-Login und API-Passwort. Timeout ${seconds(dfs.timeout)}, Lighthouse ${seconds(dfs.lighthouseTimeout)}.</p>
      ${call({ service: 'DATAFORSEO', method: 'POST', target: dfsPaths.rankings, title: 'Rankings der Domain', facts: [['Body', code(`[{ target, location_code, language_code, limit: ${dfs.rankedLimit}, order_by: ["keyword_data.keyword_info.search_volume,desc"] }]`)]] })}
      ${call({ service: 'DATAFORSEO', method: 'POST', target: dfsPaths.summary, title: 'Backlink-Zusammenfassung', facts: [['Body', code('[{ target, include_subdomains: true }]')]] })}
      ${call({ service: 'DATAFORSEO', method: 'POST', target: dfsPaths.targets, title: 'Die meistverlinkten Seiten', facts: [['Body', code(`[{ target, limit: ${dfs.backlinkLimit}, order_by: ["backlinks,desc"] }]`)]] })}
      ${call({ service: 'DATAFORSEO', method: 'POST', target: dfsPaths.competitors, title: 'Wettbewerber', facts: [['Body', code(`[{ target, location_code, language_code, limit: ${dfs.competitorsLimit} }]`)]] })}
      ${call({ service: 'DATAFORSEO', method: 'POST', target: dfsPaths.lighthouse, title: 'Mobile Messung der Startseite', facts: [['Body', code('[{ url, for_mobile: true, categories: ["performance"] }]')], ['Ergebnis', 'Performance-Score, LCP, CLS, TBT']] })}`,
  }),
);

const engineRows = ai.engines
  .map(
    (engine) =>
      `<tr><td>${esc(engine.label)}</td><td>${code(ai.treg[engine.id])}</td><td>${code(engine.path)}</td><td>${code(engine.modelName)}</td></tr>`,
  )
  .join('');

phases.push(
  phase({
    id: 'p-c',
    marker: 'C',
    title: 'Strang C: KI-Sichtbarkeit (nur wenn der Schalter an ist)',
    when: 'Startet, sobald das Profil da ist. Meist der längste Teil, weil jede Antwort eines Assistenten Zeit braucht (nach den treg-Messwerten im Mittel 28 Sekunden bei ChatGPT, 40 bei Gemini).',
    summary:
      'Zuerst schreibt das Modell typische Kundenfragen ohne Firmennamen. Dann werden diese Fragen echten KI-Assistenten gestellt und per Code geprüft, ob deine Domain genannt oder zitiert wird.',
    services: ['ANTHROPIC', 'TREG', 'DATAFORSEO'],
    body: `
      <h4 class="sub">C1: Fragen schreiben</h4>
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create',
        facts: [
          ['Modell', code(model)],
          ['max_tokens', String(ai.queryTokens)],
          ['Parallel', '1 Aufruf'],
        ],
        extra: promptBlock('Prompt anzeigen: Kundenfragen schreiben', queryPrompt, userQueries, schemas.queries),
      })}
      <h4 class="sub">C2: Fragen filtern (Code)</h4>
      <ol class="steps">
        ${step(`Länge zwischen ${ai.minLength} und ${ai.maxLength} Zeichen, keine Dopplungen.`, ['CODE'])}
        ${step(`Verworfen wird jede Frage, die die Domain oder den Markennamen enthält (abgeleitet aus der Domain, mindestens ${ai.minBrand} Zeichen). Eine Frage nach der eigenen Firma würde nichts beweisen.`, ['CODE'])}
        ${step(`Es bleiben höchstens ${ai.queryCount}. Unter ${ai.minQueries} brauchbaren Fragen wird der Check übersprungen und im Bericht erklärt.`, ['CODE'])}
      </ol>
      <h4 class="sub">C3: Die Fragen stellen</h4>
      <p>${ai.queryCount} Fragen mal 3 Assistenten = bis zu ${ai.queryCount * 3} Anfragen, höchstens ${ai.maxRequests} insgesamt. Welche Tür benutzt wird, entscheidet sich an den Zugangsdaten: ist ein treg-Token gesetzt, hat treg Vorrang vor DataForSEO.</p>
      <table class="table">
        <thead><tr><th>Assistent</th><th>Weg über treg (bevorzugt)</th><th>Weg über DataForSEO (Rückfall)</th><th>Modell bei DataForSEO</th></tr></thead>
        <tbody>${engineRows}</tbody>
      </table>
      ${call({
        service: 'TREG',
        method: 'POST',
        target: `https://treg.to/call/${ai.treg.CHATGPT}`,
        title: 'Beispiel: eine Frage an ChatGPT über treg (Gemini ist gleich aufgebaut)',
        facts: [
          ['Header', `${code('X-Treg-Token')}, ${code('X-Treg-Org')} (nur bei Login-Token), ${code('X-Treg-Route-Max-Cost: ' + ai.tregMaxCost)}`],
          ['Body', code('{ "prompt": "<die Frage>", "country": "DE" }')],
          ['Antwort', `${code('result.text')} (die Antwort) und ${code('result.sources[]')} mit URLs. Zusätzlich ${code('citationPills[]')}, beide werden zusammengeführt.`],
          ['Kosten', `Header ${code('X-Treg-Cost-Micro')} in Mikro-US-Dollar, typisch 0,003 USD je Antwort`],
          ['Parallel', `${ai.tregConcurrency} gleichzeitig, Timeout ${seconds(ai.tregTimeout)} je Anfrage, Gesamtbudget ${seconds(ai.tregDeadline)}`],
        ],
      })}
      ${call({
        service: 'TREG',
        method: 'POST',
        target: `https://treg.to/call/${ai.treg.PERPLEXITY}`,
        title: 'Beispiel: Perplexity läuft über den DataForSEO-Endpunkt, den treg bereitstellt',
        facts: [['Body', code('[{ "user_prompt": "<die Frage>", "model_name": "sonar", "web_search_country_iso_code": "DE" }]')]],
      })}
      ${call({
        service: 'DATAFORSEO',
        method: 'POST',
        target: 'https://api.dataforseo.com/v3/ai_optimization/{chat_gpt|perplexity|gemini}/llm_responses/live',
        title: 'Rückfall ohne treg-Token',
        facts: [
          ['Body', code('[{ "user_prompt": "<die Frage>", "model_name": "...", "web_search": true }]')],
          ['Parallel', `${ai.dfsConcurrency} gleichzeitig, Timeout ${seconds(ai.dfsTimeout)}, Gesamtbudget ${seconds(ai.dfsDeadline)}`],
        ],
      })}
      <h5>Wiederholungen und Grenzen</h5>
      ${rows([
        ['Versuche pro Anfrage', `${ai.attempts}, mit steigender Pause (${seconds(ai.retryDelay)} mal Versuchsnummer)`],
        ['Sagt treg, wie lange', `Bei einem 503 mit Header ${code('Retry-After')} wartet der Audit genau so lange (höchstens ${seconds(ai.maxRetryAfter)}) und versucht bis zu ${ai.attemptsWhenTold} Mal.`],
        ['Wiederholt wird bei', code(ai.retryPattern)],
        ['Nicht wiederholt', 'Alles andere, zum Beispiel falscher Token (401) oder leeres Guthaben (402)'],
        ['Ein Ausfall', 'Eine Spalte (ein Assistent) bleibt "Unklar", die anderen laufen weiter. Der Grund steht als Notiz im Bericht.'],
        ['Zeitbudget leer', 'Noch nicht gestartete Anfragen werden übersprungen und im Bericht gezählt.'],
      ])}
      <h4 class="sub">C4: Jede Antwort per Code einstufen (kein Modell)</h4>
      <table class="table">
        <thead><tr><th>Ergebnis</th><th>Regel</th><th>Gewicht in der Rate</th></tr></thead>
        <tbody>
          <tr><td><strong>Zitiert</strong></td><td>Unter den Quellen steht eine URL der Domain oder einer Subdomain (Tracking-Anhänge wie ${code('?utm_source=chatgpt.com')} werden ignoriert).</td><td>1</td></tr>
          <tr><td><strong>Genannt</strong></td><td>Nicht zitiert, aber Domain oder Markenname stehen als ganzes Wort im Antworttext.</td><td>${ai.mentionedWeight}</td></tr>
          <tr><td><strong>Nicht genannt</strong></td><td>Weder noch.</td><td>0</td></tr>
          <tr><td><strong>Unklar</strong></td><td>Antwort fehlt, ist kürzer als ${ai.minAnswer} Zeichen ohne Quellen oder war nicht auswertbar. Zählt nicht in die Rate.</td><td>wird ausgelassen</td></tr>
        </tbody>
      </table>
      <p class="note">Pro Frage werden außerdem bis zu drei Domains notiert, die stattdessen als Quelle auftauchen (große Plattformen und Suchmaschinen sind ausgenommen). Die Präsenzrate ist die gewichtete Summe geteilt durch die Zahl auswertbarer Antworten.</p>`,
  }),
);

phases.push(
  phase({
    id: 'p-after',
    marker: '5',
    title: 'Nach den Strängen: Keywords, Backlink-Ziele, konkurrierende Seiten, Orte',
    when: 'Sobald A, B und C fertig sind. Die Keyword-Bewertung nur, wenn B Rankings geliefert hat.',
    summary:
      'Die Rankings enthalten viele Begriffe, die nichts mit dem Geschäft zu tun haben. Das Modell sortiert sie aus, danach wird geprüft, ob verlinkte Seiten noch existieren, ob Seiten um dasselbe Thema konkurrieren und für welche Orte keine eigene Seite da ist.',
    services: ['ANTHROPIC', 'WEB'],
    body: `
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create',
        title: `Die ${classifier.keywordMax} Keywords mit dem höchsten Suchvolumen, in Paketen zu ${classifier.keywordBatch}`,
        facts: [
          ['Modell', code(model)],
          ['max_tokens', String(classifier.keywordTokens)],
          ['Parallel', `${classifier.concurrency} gleichzeitig`],
          ['Zusätzlich', 'Der Ort, den ein Keyword nennt (leer, wenn keiner). Daraus entsteht später die Liste der Orte ohne eigene Seite.'],
          ['Ergebnis', `Relevanz 0 bis 1 und Konfidenz je Keyword. Ab ${num('constants/seo-thresholds.const.ts', 'KEYWORD_RELEVANCE_THRESHOLD')} Relevanz wird ein Keyword zur Chance: Plätze 4 bis 10 ab ${num('constants/seo-thresholds.const.ts', 'QUICK_WIN_MIN_SEARCH_VOLUME')} Suchanfragen als Quick Win, Plätze 11 bis 30 ab ${num('constants/seo-thresholds.const.ts', 'NEAR_PAGE_ONE_MIN_SEARCH_VOLUME')} als "nah an Seite 1".`],
          ['Ohne Anthropic-Key', 'Die Keywords bleiben unbewertet, im Bericht steht eine Notiz.'],
        ],
        extra: promptBlock('Prompt anzeigen: Keywords bewerten', keywordPrompt, userKeywords, schemas.keywords),
      })}
      ${call({
        service: 'WEB',
        method: 'HEAD',
        target: 'URLs der meistverlinkten Seiten (aus Strang B)',
        title: 'Tote Backlink-Ziele finden',
        facts: [
          ['Ablauf', `Bereits vom Crawl bekannte Status werden wiederverwendet, der Rest per HEAD geprüft (bei 405 oder 501 per GET), ${crawl.concurrency} parallel.`],
          ['Ergebnis', 'Ziele, die mit 404 oder Fehler antworten, werden zu Weiterleitungs-Aufgaben.'],
        ],
      })}
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create',
        title: 'Konkurrieren zwei Seiten um dieselbe Suche? Eine Anfrage für die ganze Website',
        facts: [
          ['Modell', code(model)],
          ['max_tokens', String(competing.tokens)],
          ['Übergeben wird', `Nummer, Titel, Adresse, Seitentyp und Suchabsicht jeder bewerteten Seite (bis ${competing.maxInput}). Läuft erst ab ${competing.minPages} Seiten.`],
          ['Prüfung im Code', `Nur Gruppen aus mindestens zwei bekannten Seiten zählen, eine Seite steht in höchstens einer Gruppe, bis ${competing.maxGroups} Gruppen.`],
          ['Ergebnis', 'Aufgabe "Themen werden von mehreren Seiten bedient" mit den Adressen.'],
        ],
        extra: promptBlock('Prompt anzeigen: konkurrierende Seiten', competing.prompt, userCompeting, schemas.competing),
      })}
      ${call({
        service: 'CODE',
        method: 'Code',
        target: 'Orte ohne eigene Seite',
        title: 'Kein weiterer Aufruf: wertet das Feld "place" der Keyword-Bewertung aus',
        facts: [
          ['Regel', 'Relevante Keywords mit Ort werden je Ort aufsummiert. Steht der Ort weder in einer Seitenadresse noch in einem Seitentitel (Umlaute werden gleichgesetzt), und liegt das Suchvolumen bei mindestens 100, fehlt die Seite.'],
          ['Ergebnis', 'Bis zu fünf Orte mit Suchvolumen, als Aufgabe und als Abschnitt im Bericht.'],
        ],
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-score',
    marker: '6',
    title: 'Bewertung, Aufgaben, Bericht (nur Code, keine externen Aufrufe)',
    when: 'Direkt danach, weniger als eine Sekunde.',
    summary:
      'Aus allen Messwerten und Urteilen entstehen Befunde. Aus den Befunden werden Bereichswerte, ein Gesamtwert, eine Note und eine priorisierte Aufgabenliste.',
    services: ['CODE'],
    body: `
      <div class="two">
        <div>
          <h5>Gewichte der Bereiche</h5>
          <table class="table"><tbody>${source
            .areaWeights()
            .map(([area, weight]) => `<tr><td>${esc(area)}</td><td class="num">${weight}</td></tr>`)
            .join('')}</tbody></table>
        </div>
        <div>
          <h5>Abzug je Befund</h5>
          <table class="table"><tbody>${source
            .severityPenalties()
            .map(([name, value]) => `<tr><td>${esc(name)}</td><td class="num">${value}</td></tr>`)
            .join('')}</tbody></table>
          <h5>Noten</h5>
          <table class="table"><tbody>${source
            .gradeThresholds()
            .map(([grade, min]) => `<tr><td>ab ${min}</td><td class="num">${esc(grade)}</td></tr>`)
            .join('')}<tr><td>darunter</td><td class="num">F</td></tr></tbody></table>
        </div>
      </div>
      <p class="note"><strong>Zusätzlich berechnet der Code:</strong> den Score nur mit den gemessenen Regeln (ohne Inhaltsqualität und Keyword-Sichtbarkeit, die vom Modell abhängen), den Anteil eindeutiger Seitenurteile (Konfidenz ab 0,7), und die Stärken aus den Daten (starke Bereiche, Top-3-Rankings, hilfreiche Seiten, KI-Bereitschaft).</p>
      <p class="note">Der Bereich KI-Sichtbarkeit ist ${Math.round(ai.presenceShare * 100)} % Präsenz und ${Math.round((1 - ai.presenceShare) * 100)} % Bereitschaft. Ohne ausgeführten Check zählt nur die Bereitschaft. Befunde zur Präsenz entstehen erst ab ${ai.minForFindings} beantworteten Fragen.</p>`,
  }),
);

phases.push(
  phase({
    id: 'p-summary',
    marker: '7',
    title: 'Zusammenfassung schreiben und Zahlen prüfen (starkes Modell)',
    when: 'Nach der Bewertung. Ein Aufruf, abschaltbar in den App-Variablen ("Written summary"), standardmäßig an.',
    summary:
      'Ein starkes Modell bekommt nur das fertige Faktenblatt des Audits und formuliert daraus, was gut läuft, was bremst und was diese Woche, diesen Monat und dieses Quartal zu tun ist. Danach prüft der Code jede Zahl im Text gegen das Faktenblatt.',
    services: ['ANTHROPIC', 'CODE'],
    body: `
      <ol class="steps">
        ${step('Der Code baut das Faktenblatt: Score und Note, Score nur mit Regeln, Bereiche, die wichtigsten Aufgaben mit Horizont, schwächste Seiten, Keyword-Zahlen, Backlinks, mobile Geschwindigkeit, KI-Sichtbarkeit, Stärken, konkurrierende Themen und Orte ohne Seite.', ['CODE'])}
        ${step('Das Modell schreibt die Zusammenfassung in der Sprache des Audits.', ['ANTHROPIC'])}
        ${step('Der Code liest jede Zahl aus jedem Satz (deutsche und englische Schreibweise) und vergleicht sie mit allen Zahlen des Faktenblatts. Ein Anteil wie 0,69 gilt auch als 69.', ['CODE'])}
        ${step('Jeder Satz mit einer Zahl, die das Faktenblatt nicht enthält, wird im Bericht als "nicht belegt" markiert. Der Audit gilt dann als nicht vollständig geprüft.', ['CODE'])}
      </ol>
      ${call({
        service: 'ANTHROPIC',
        method: 'POST',
        target: 'messages.create',
        facts: [
          ['Modell', code(summaryModel)],
          ['max_tokens', String(summary.tokens)],
          ['Parallel', '1 Aufruf'],
          ['Begrenzung', `Höchstens ${summary.maxItems} Einträge je Abschnitt, jeder höchstens ${summary.maxLength} Zeichen, bis ${summary.maxTasks} Aufgaben im Faktenblatt.`],
          ['Fehlerfall', 'Fällt der Aufruf aus oder fehlt die Überschrift, nutzt der Bericht die Code-Zusammenfassung und nennt den Grund als Notiz ("Summary: ...").'],
        ],
        extra: promptBlock('Prompt anzeigen: Zusammenfassung', summary.prompt, userSummary, schemas.summary),
      })}
      <p class="note">Das Modell sagt keine Rankings oder Besucherzahlen voraus und schreibt keine neuen Aufgaben. Wo der Text eine Zahl nennt, die es nicht geben darf, steht das im Bericht, statt dass sie stillschweigend durchgeht.</p>`,
  }),
);

phases.push(
  phase({
    id: 'p-export',
    marker: '8',
    title: 'Exporte erzeugen',
    when: 'Nach der Bewertung, wenige Sekunden.',
    summary:
      'Der HTML-Bericht ist die Quelle. Excel wird im Code gebaut, das PDF wird aus dem HTML gerendert. Ein fehlschlagender Export lässt den Audit nicht scheitern, er wird als Notiz vermerkt.',
    services: ['CODE', 'PDF'],
    body: `
      <ol class="steps">
        ${step('HTML-Bericht (druckfertige Seite) wird im Code gebaut.', ['CODE'])}
        ${step('Excel-Datei (Übersicht, Maßnahmen, Seiten, Keywords, Backlinks, Wettbewerber, KI-Antworten, Prüfliste).', ['CODE'])}
      </ol>
      ${call({
        service: 'PDF',
        method: 'POST',
        target: '{PDF_RENDERER_URL}/forms/chromium/convert/html',
        title: 'Optional, nur mit eingerichtetem PDF-Renderer (Gotenberg-kompatibel)',
        facts: [
          ['Body', 'multipart: Datei ' + code('index.html') + ', ' + code('preferCssPageSize=true') + ', ' + code('printBackground=true')],
          ['Header', code('Authorization: Bearer <PDF_RENDERER_API_KEY>') + ' (wenn ein Key gesetzt ist)'],
          ['Timeout', seconds(pdfTimeout)],
        ],
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-save',
    marker: '9',
    title: 'Speichern und abschließen',
    when: 'Letzter Schritt.',
    summary:
      'Dateien werden an den Datensatz gehängt, Seiten, Aufgaben und Keywords als eigene Datensätze angelegt und der Audit auf DONE gesetzt.',
    services: ['TWENTY'],
    body: `
      ${call({ service: 'TWENTY', method: 'Upload', target: 'MetadataApiClient.uploadFile  (Felder excelFile und pdfFile)' })}
      ${call({ service: 'TWENTY', method: 'GraphQL', target: 'createSeoAuditPages, createSeoAuditTasks, createSeoKeywordOpportunities', title: 'Je eine Sammel-Anfrage', facts: [['Keywords', `bis zu ${keywordRecords} Chancen plus ${notRelevantRecords} als "nicht relevant"`]] })}
      ${call({
        service: 'TWENTY',
        method: 'GraphQL',
        target: 'updateSeoAudit',
        title: 'Abschluss',
        facts: [
          ['Daten', code('{ status: "DONE", score, grade, areaScores, pagesCrawled, finishedAt, reportMarkdown, reportHtml, reportUrl, shareToken, aiVisibility, ... }')],
          ['Teilen', `${code('shareToken')} ist eine Zufallszahl (24 Byte). ${code('reportUrl')} zeigt auf ${code('/s/seo-audit/report?id=...&token=...')} und braucht keine Anmeldung.`],
        ],
      })}`,
  }),
);

phases.push(
  phase({
    id: 'p-failure',
    marker: '!',
    title: 'Wenn etwas schiefgeht',
    when: 'Jederzeit.',
    summary: 'Die Regel: ein Teil darf ausfallen, der Audit läuft weiter. Nur ein Fehler im Hauptlauf macht ihn zu FAILED.',
    services: ['TWENTY'],
    body: `
      <table class="table">
        <thead><tr><th>Was fällt aus</th><th>Folge</th></tr></thead>
        <tbody>
          <tr><td>Startseite nicht erreichbar, ungültige Domain, falscher Anthropic-Key</td><td>Status <code>FAILED</code> mit <code>failureReason</code> (höchstens 500 Zeichen). Es werden keine Teilergebnisse gespeichert.</td></tr>
          <tr><td>Einzelne Seitenbewertung scheitert</td><td>Diese Seite bleibt ohne Urteil, der Bericht nennt die Zahl der Fehler und den ersten Grund.</td></tr>
          <tr><td>Eine DataForSEO-Anfrage scheitert</td><td>Nur dieser Teil fehlt, Notiz bei den Marktdaten.</td></tr>
          <tr><td>Ein KI-Assistent scheitert oder läuft in den Timeout</td><td>Bis zu ${ai.attempts} Versuche, danach "Unklar" und eine Notiz.</td></tr>
          <tr><td>Zusammenfassung scheitert oder enthält eine Zahl, die der Audit nicht belegt</td><td>Bei einem Ausfall steht die Code-Zusammenfassung im Bericht und eine Notiz nennt den Grund. Unbelegte Zahlen werden im Text markiert.</td></tr>
          <tr><td>Konkurrierende Seiten werden nicht erkannt</td><td>Die Gruppen bleiben leer, der Audit läuft weiter.</td></tr>
          <tr><td>Excel, PDF oder Upload scheitern</td><td>Der Audit wird fertig, die Notiz steht bei den Exporten.</td></tr>
          <tr><td>Die Funktion läuft in den Timeout (600 s) oder stirbt</td><td>Alle 15 Minuten setzt eine Aufräum-Funktion Audits, die länger als ${stuckMinutes} Minuten QUEUED oder RUNNING sind, auf FAILED ("No result after ${stuckMinutes} minutes").</td></tr>
        </tbody>
      </table>`,
  }),
);

// ---------------------------------------------------------------- extra sections

const matrixPhases = [
  ['Auslöser', { TWENTY: 1 }],
  ['Vorbereitung', { TWENTY: 1 }],
  ['Crawl', { WEB: 1 }],
  ['Profil', { ANTHROPIC: 1 }],
  ['A Seiten', { ANTHROPIC: 1 }],
  ['B Markt', { DATAFORSEO: 1 }],
  ['C KI-Check', { ANTHROPIC: 1, TREG: 1, DATAFORSEO: 1 }],
  ['Keywords, Seiten', { ANTHROPIC: 1, WEB: 1 }],
  ['Bewertung', { CODE: 1 }],
  ['Zusammenfassung', { ANTHROPIC: 1, CODE: 1 }],
  ['Exporte', { CODE: 1, PDF: 1 }],
  ['Speichern', { TWENTY: 1 }],
];

const matrix = `
  <div class="matrix-wrap"><table class="matrix">
    <thead><tr><th></th>${matrixPhases.map(([name]) => `<th><span>${esc(name)}</span></th>`).join('')}</tr></thead>
    <tbody>${Object.entries(SERVICES)
      .map(
        ([key, service]) =>
          `<tr><th>${esc(service.label)}</th>${matrixPhases
            .map(([, used]) => (used[key] ? `<td><i class="dot ${service.className}"></i></td>` : '<td></td>'))
            .join('')}</tr>`,
      )
      .join('')}</tbody>
  </table></div>`;

const creatorSection = `
  <section class="chapter" id="creator">
    <h2>Creator Studio: wie ein Bild, eine Stimme oder ein Video entsteht</h2>
    <p>Dieselbe Idee wie beim Audit: Ein Datensatz <code>ugcAsset</code> mit Status <code>QUEUED</code> löst die Arbeit aus, die Webapp zeigt nur den Stand.</p>
    <ol class="steps">
      ${step(`Webapp: ${code('POST /rest/ugcAssets')} mit ${code('{ name, assetType, status: "QUEUED", creatorId, prompt?, script?, platform?, durationSeconds? }')}. Videos brauchen vorher eine Kostenbestätigung im Formular, die Länge wird auf 4, 6 oder 8 Sekunden gesetzt.`, ['TWENTY'])}
      ${step(`Twenty-Event ${code('ugcAsset.created')} startet die Funktion ${code('run-ugc-asset')} (Timeout 600 s). Aufträge laufen nacheinander.`, ['CODE'])}
      ${step(`Das Profil des Creators wird gelesen (${code('ugcCreators')}), der Auftrag auf RUNNING gesetzt.`, ['TWENTY'])}
      ${step('Je nach Typ der Aufruf an treg (siehe unten). Jeder Aufruf trägt eine Kostengrenze, treg lehnt einen teureren Aufruf ab und berechnet nichts.', ['TREG'])}
      ${step(`Die fertige Datei wird heruntergeladen und per ${code('uploadFile')} an das Feld ${code('file')} gehängt. Der Datensatz bekommt Status DONE, Kosten und den Endpunkt.`, ['TWENTY'])}
      ${step(`Aufräumen: alle 15 Minuten setzt ${code('fail-stuck-ugc-assets')} Aufträge nach ${creator.stuck} Minuten auf FAILED.`, ['CODE'])}
    </ol>
    ${call({
      service: 'TREG',
      method: 'POST + GET',
      target: 'reapi.image-gen.gemini-3-pro-image  /  reapi.tasks.get',
      title: 'Bild (etwa 0,03 USD)',
      facts: [
        ['Body', code(`{ "model": "${creator.imageEndpoint}", "prompt": "<Prompt unten>", "size": "9:16", "resolution": "1K" }`)],
        ['Ablauf', `Antwort enthält eine Task-ID. Alle ${seconds(creator.poll)} wird ${code('reapi.tasks.get')} gefragt (kostenlos), bis ${seconds(creator.imageWait)}. Dann wird ${code('output.image_urls[0]')} geladen.`],
      ],
      extra: `<details class="prompt"><summary>Prompt anzeigen: Bild</summary><pre>${esc(creator.imagePrompt)}</pre><p class="meta">Die Teile in eckigen Klammern werden aus dem Profil und dem Auftrag eingesetzt.</p></details>`,
    })}
    ${call({
      service: 'TREG',
      method: 'POST',
      target: 'google-ai.voice-gen.gemini-3-8-flash-tts?model=gemini-3.8-flash-tts',
      title: 'Stimme (unter 0,01 USD je Zeile)',
      facts: [
        ['Body', code('{ "contents": [{ "parts": [{ "text": "<Skript>" }] }], "generationConfig": { "responseModalities": ["AUDIO"], "speechConfig": { "voiceConfig": { "prebuiltVoiceConfig": { "voiceName": "Kore" } } } } }')],
        ['Antwort', 'Synchron. Die Audiodatei steht als base64-WAV in der Antwort, keine Abfrage nötig.'],
        ['Stimme', 'Name aus dem Profil, sonst Kore'],
      ],
    })}
    ${call({
      service: 'TREG',
      method: 'POST + GET',
      target: 'replicate.video-gen.veo-3.1-fast  /  replicate.predictions.get',
      title: 'Video (0,10 USD je Sekunde, mit Ton 0,15)',
      facts: [
        ['Body', code('{ "input": { "prompt": "<Prompt unten>", "duration": 4|6|8, "resolution": "720p", "aspect_ratio": "9:16", "generate_audio": true } }')],
        ['Kostengrenze', 'Geschätzte Kosten plus 0,05 USD, damit ein Ausreißer nie mehr als das kostet.'],
        ['Ablauf', `Alle ${seconds(creator.poll)} wird die Vorhersage abgefragt, bis ${seconds(creator.videoWait)}. Die Ergebnis-URL ist kurzlebig und wird sofort heruntergeladen.`],
      ],
      extra: `<details class="prompt"><summary>Prompt anzeigen: Video</summary><pre>${esc(creator.videoPrompt)}</pre><h5>Sprechtext</h5><pre>${esc('Mit Skript:  The person looks into the camera and says in German|English: "<Skript>"\nOhne Skript: The person does not speak.')}</pre></details>`,
    })}
  </section>`;

const webappSection = `
  <section class="chapter" id="webapp">
    <h2>Webapp: was beim Aufruf einer Seite passiert</h2>
    <p>Die Webapp hat keine Datenbank. Jeder Seitenaufruf läuft auf dem Server, ruft Twenty über REST mit dem API-Key auf und liefert fertiges HTML. Der Key erreicht nie den Browser.</p>
    <table class="table">
      <thead><tr><th>Seite</th><th>Aufrufe an Twenty</th></tr></thead>
      <tbody>
        <tr><td>Anmeldung (Team, Passwort)</td><td>Keiner. Passwort wird gegen den gespeicherten Hash geprüft, danach ein signiertes Cookie (7 Tage) gesetzt.</td></tr>
        <tr><td>Anmeldung (Kunde, Link)</td><td>${code('GET /rest/people?filter=and(emails.primaryEmail[eq]:"...",portalAccess[eq]:"true")')} bei jedem Seitenaufruf. Entzug wirkt sofort.</td></tr>
        <tr><td>Übersicht</td><td>${code('GET /rest/seoAudits?order_by=createdAt[DescNullsLast]&limit=50')} und ${code('GET /rest/seoAuditTasks?filter=status in [OPEN, IN_PROGRESS]&limit=1')}</td></tr>
        <tr><td>Audit-Liste</td><td>${code('GET /rest/seoAudits')} mit Suche und Filter. Kunden bekommen immer den Filter ${code('companyId[eq]')} dazu.</td></tr>
        <tr><td>Audit-Detail</td><td>${code('GET /rest/seoAudits/:id')}, ${code('seoAuditTasks')}, ${code('seoKeywordOpportunities')} und der vorige Audit derselben Domain für den Vergleich. Läuft der Audit, lädt die Seite alle 5 Sekunden neu.</td></tr>
        <tr><td>Aufgabe abhaken</td><td>${code('PATCH /rest/seoAuditTasks/:id { status }')} (nur Team)</td></tr>
        <tr><td>Firmen, Kontakte, Pipeline</td><td>${code('/rest/companies')}, ${code('/rest/people')}, ${code('/rest/opportunities')}, ${code('/rest/notes')} und ${code('/rest/noteTargets')}, ${code('/rest/tasks')}, ${code('/rest/taskTargets')}</td></tr>
        <tr><td>Creator</td><td>${code('/rest/ugcCreators')}, ${code('/rest/ugcAssets')}. Die Seite lädt alle 5 Sekunden neu, solange ein Auftrag läuft.</td></tr>
        <tr><td>Einstellungen, Testmail</td><td>Kein Twenty-Aufruf. Resend-SMTP (${code('smtp.resend.com:465')}), Zugangsdaten verschlüsselt im Volume.</td></tr>
      </tbody>
    </table>
  </section>`;

const costSection = `
  <section class="chapter" id="kosten">
    <h2>Was ein Audit kostet</h2>
    <table class="table">
      <thead><tr><th>Posten</th><th>Anzahl Aufrufe</th><th>Kosten</th></tr></thead>
      <tbody>
        <tr><td>${badge('WEB')} Crawl</td><td>bis ${crawl.maxPages} Seiten plus Sonderdateien und Linkprüfung</td><td>keine</td></tr>
        <tr><td>${badge('ANTHROPIC')} ${esc(model)}: Profil, Seiten, Fragen, Keywords, konkurrierende Seiten</td><td>1 + bis ${crawl.maxPages} + 1 + bis ${Math.ceil(classifier.keywordMax / classifier.keywordBatch)} + 1</td><td>nach Tokens. Seit dieser Version werden die Tokens je Modell im Audit gespeichert (Feld "AI usage")</td></tr>
        <tr><td>${badge('ANTHROPIC')} ${esc(summaryModel)}: Zusammenfassung</td><td>1</td><td>nach Tokens, im selben Feld erfasst</td></tr>
        <tr><td>${badge('DATAFORSEO')} Marktdaten</td><td>5</td><td>etwa 0,15 bis 0,35 USD</td></tr>
        <tr><td>${badge('TREG')} KI-Check</td><td>bis ${ai.queryCount * 3}</td><td>gemessen am 2026-10-10 für roaswell.com: 0,09 USD für 23 Antworten</td></tr>
        <tr><td>${badge('DATAFORSEO')} KI-Check als Rückfall</td><td>bis ${ai.queryCount * 3}</td><td>etwa 0,5 bis 1 USD</td></tr>
        <tr><td>${badge('PDF')} PDF</td><td>1</td><td>eigener Server</td></tr>
      </tbody>
    </table>
    <p class="note">Gemessener Lauf (roaswell.com, 2026-10-10): 60 Seiten, KI-Check mit 8 Fragen, 23 von 24 Antworten, ein ChatGPT-Timeout. Die gesamte Pipeline dauerte rund 3 Minuten (Start 14:02:39, Abschluss 14:05:48 UTC).</p>
  </section>`;

// ---------------------------------------------------------------- page

const css = `
:root{--bg:#f7f8fa;--panel:#fff;--text:#161a23;--muted:#5b6475;--line:#e3e6ec;--accent:#2a78d6;--code:#f0f2f6;
--c-twenty:#2f8f5b;--c-web:#6b7280;--c-anthropic:#c2562a;--c-dataforseo:#2a78d6;--c-treg:#7c4ddb;--c-pdf:#0f8b8d;--c-code:#8a6d1d}
@media (prefers-color-scheme:dark){:root{--bg:#0e1118;--panel:#161b25;--text:#e8ebf2;--muted:#9aa3b5;--line:#262d3b;--accent:#5b9bf0;--code:#1d2330;
--c-twenty:#4cc38a;--c-web:#9ca3af;--c-anthropic:#f08a5d;--c-dataforseo:#6aa8ff;--c-treg:#a98bff;--c-pdf:#3cc4c6;--c-code:#d9b44a}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Inter,sans-serif}
a{color:var(--accent)}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
code{background:var(--code);padding:.08em .35em;border-radius:5px;font-size:.88em;word-break:break-word}
pre{background:var(--code);padding:14px 16px;border-radius:10px;overflow:auto;font-size:.82rem;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;max-width:1240px;margin:0 auto;padding:32px 24px 96px}
nav.toc{position:sticky;top:24px;align-self:start;font-size:.9rem;max-height:calc(100vh - 48px);overflow:auto}
nav.toc h2{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 10px}
nav.toc a{display:block;padding:5px 10px;border-radius:7px;color:var(--muted);text-decoration:none}
nav.toc a:hover{background:var(--panel);color:var(--text)}
main{min-width:0}
h1{font-size:2rem;line-height:1.2;margin:0 0 8px;letter-spacing:-.02em}
h2{font-size:1.45rem;margin:56px 0 12px;letter-spacing:-.01em}
h3{font-size:1.15rem;margin:0 0 4px}
h4.sub{margin:26px 0 8px;font-size:1rem}
h5{margin:18px 0 6px;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.lead{color:var(--muted);max-width:68ch;margin:0 0 24px}
.toolbar{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);padding:10px 0;margin:0 0 8px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.toolbar span.label{font-size:.8rem;color:var(--muted);margin-right:4px}
.chip{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:5px 12px;font:inherit;font-size:.85rem;cursor:pointer}
.chip[aria-pressed=true]{background:var(--text);color:var(--bg);border-color:var(--text)}
.toolbar .spacer{flex:1}
.badge{display:inline-block;font-size:.72rem;font-weight:600;padding:2px 9px;border-radius:999px;color:#fff;white-space:nowrap}
.svc-twenty{background:var(--c-twenty)}.svc-web{background:var(--c-web)}.svc-anthropic{background:var(--c-anthropic)}
.svc-dataforseo{background:var(--c-dataforseo)}.svc-treg{background:var(--c-treg)}.svc-pdf{background:var(--c-pdf)}.svc-code{background:var(--c-code);color:#111}
.phase{display:grid;grid-template-columns:44px minmax(0,1fr);gap:16px;position:relative}
.phase:not(:last-child)::before{content:"";position:absolute;left:21px;top:44px;bottom:-12px;width:2px;background:var(--line)}
.phase-marker span{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--panel);border:2px solid var(--accent);font-weight:700}
.phase-body{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin-bottom:24px}
.phase.dim,.call.dim,li.dim{opacity:.28}
.when{color:var(--accent);font-size:.9rem;margin:2px 0 8px;font-weight:500}
.call{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--bg)}
.call>header{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center}
.method{font-family:ui-monospace,Menlo,monospace;font-size:.78rem;font-weight:700;color:var(--muted)}
.target{font-family:ui-monospace,Menlo,monospace;font-size:.85rem;word-break:break-all}
.call-title{margin:8px 0 2px;font-weight:600}
dl.facts{display:grid;grid-template-columns:150px minmax(0,1fr);gap:6px 14px;margin:10px 0 0;font-size:.92rem}
dl.facts dt{color:var(--muted)}dl.facts dd{margin:0}
details.prompt{margin-top:10px;border:1px dashed var(--line);border-radius:10px;padding:8px 12px}
details.prompt summary{cursor:pointer;font-weight:600;color:var(--accent)}
.meta,.note{color:var(--muted);font-size:.9rem}
ol.steps{list-style:none;counter-reset:s;padding:0;margin:12px 0}
ol.steps li{counter-increment:s;position:relative;padding:8px 0 8px 40px;border-bottom:1px solid var(--line)}
ol.steps li:last-child{border-bottom:0}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:9px;width:26px;height:26px;border-radius:50%;background:var(--code);display:grid;place-items:center;font-size:.8rem;font-weight:600}
.lanes{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:12px 0}
.lane{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--bg)}
.lane h4{margin:0;font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.lane p{margin:2px 0 8px;font-weight:600}
.table{width:100%;border-collapse:collapse;font-size:.92rem;margin:10px 0}
.table th,.table td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
.table th{color:var(--muted);font-weight:600;font-size:.8rem}
.table td.num{text-align:right;font-variant-numeric:tabular-nums}
.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.matrix-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px;background:var(--panel)}
.matrix{border-collapse:collapse;width:100%;min-width:720px}
.matrix th,.matrix td{padding:8px 6px;text-align:center;border-bottom:1px solid var(--line)}
.matrix tbody th{text-align:left;padding-left:14px;font-size:.88rem;white-space:nowrap}
.matrix thead th span{display:inline-block;writing-mode:vertical-rl;transform:rotate(180deg);font-size:.78rem;color:var(--muted);font-weight:600}
.dot{display:inline-block;width:14px;height:14px;border-radius:50%}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
footer{margin-top:64px;color:var(--muted);font-size:.85rem;border-top:1px solid var(--line);padding-top:16px}
@media (max-width:900px){.layout{grid-template-columns:1fr}nav.toc{position:static;max-height:none}dl.facts{grid-template-columns:1fr}.phase{grid-template-columns:34px minmax(0,1fr)}.phase-marker span{width:34px;height:34px}}
@media print{.toolbar,nav.toc{display:none}.layout{display:block}details.prompt{display:block}details.prompt>*{display:block}}
`;

const script = `
const chips = document.querySelectorAll('.chip[data-filter]');
const targets = document.querySelectorAll('.phase, .call, ol.steps li');
const apply = (filter) => {
  chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
  targets.forEach((node) => {
    if (filter === 'ALL') { node.classList.remove('dim'); return; }
    const services = (node.dataset.services || node.dataset.service || '').split(' ');
    node.classList.toggle('dim', !services.includes(filter));
  });
};
chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.filter)));
const toggleAll = document.getElementById('toggle-prompts');
let open = false;
toggleAll.addEventListener('click', () => {
  open = !open;
  document.querySelectorAll('details.prompt').forEach((node) => { node.open = open; });
  toggleAll.textContent = open ? 'Alle Prompts zuklappen' : 'Alle Prompts aufklappen';
});
`;

const toc = [
  ['uebersicht', 'Auf einen Blick'],
  ['p-trigger', '0 Auslöser'],
  ['p-prepare', '1 Vorbereitung'],
  ['p-crawl', '2 Crawl'],
  ['p-profile', '3 Profil'],
  ['p-parallel', '4 Drei Stränge'],
  ['p-a', 'A Seiten bewerten'],
  ['p-b', 'B Marktdaten'],
  ['p-c', 'C KI-Sichtbarkeit'],
  ['p-after', '5 Keywords, Seiten, Orte'],
  ['p-score', '6 Bewertung'],
  ['p-summary', '7 Zusammenfassung'],
  ['p-export', '8 Exporte'],
  ['p-save', '9 Speichern'],
  ['p-failure', 'Wenn etwas schiefgeht'],
  ['creator', 'Creator Studio'],
  ['webapp', 'Webapp'],
  ['kosten', 'Kosten'],
]
  .map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`)
  .join('');

const generatedAt = new Date().toISOString().slice(0, 10);

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ablauf eines SEO-Audits und der Generierung</title>
<style>${css}</style>
</head>
<body>
<div class="layout">
  <nav class="toc" aria-label="Inhalt"><h2>Inhalt</h2>${toc}</nav>
  <main>
    <h1>Was passiert wann, und welche Schnittstelle wird benutzt</h1>
    <p class="lead">Der genaue Ablauf eines SEO-Audits vom Klick bis zum fertigen Bericht, danach die Generierung im Creator Studio und die Aufrufe der Webapp. Prompts, Grenzen und Endpunkte sind direkt aus dem Quellcode gelesen. Stand ${generatedAt}.</p>

    <div class="toolbar" role="toolbar" aria-label="Filter">
      <span class="label">Hervorheben:</span>
      <button class="chip" data-filter="ALL" aria-pressed="true">Alles</button>
      ${Object.entries(SERVICES)
        .map(([key, service]) => `<button class="chip" data-filter="${key}" aria-pressed="false">${esc(service.label)}</button>`)
        .join('')}
      <span class="spacer"></span>
      <button class="chip" id="toggle-prompts" type="button">Alle Prompts aufklappen</button>
    </div>

    <h2 id="uebersicht">Auf einen Blick</h2>
    <p>Welche Schnittstelle in welchem Schritt gebraucht wird. Ein Punkt heißt: in diesem Schritt wird sie aufgerufen.</p>
    ${matrix}
    <p class="note">Die Reihenfolge: Auslöser, Vorbereitung, Crawl, Profil. Danach laufen Strang A, B und C gleichzeitig. Wenn alle fertig sind, folgen Keywords, Bewertung, Exporte und Speichern.</p>

    <h2>Der Ablauf eines Audits</h2>
    ${phases.join('\n')}

    ${creatorSection}
    ${webappSection}
    ${costSection}

    <footer>
      Erzeugt mit <code>node scripts/build-flow-doc.mjs</code> aus dem Quellcode der Apps seo-audit und creator-studio.
      Ändert sich ein Prompt oder ein Limit, die Datei neu erzeugen.
    </footer>
  </main>
</div>
<script>${script}</script>
</body>
</html>`;

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, html, 'utf8');
console.log(`written ${OUTPUT} (${html.length} bytes, ${phases.length} phases)`);
