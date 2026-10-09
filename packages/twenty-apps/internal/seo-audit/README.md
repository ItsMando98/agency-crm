# SEO Audit

Website SEO audits that AI agents can start and read as tools, and that people can browse in the CRM.

Give it a homepage. A few minutes later the audit record holds a score, a grade, per-area scores, a prioritized action list and a Markdown report an agent can work through.

## How it works

1. Code crawls up to 60 pages (robots.txt respected, sitemap used) and measures everything that can be counted: status codes, titles, descriptions, headings, canonicals, links, HTTPS and mixed content, response time, structured data.
2. A model (Claude Sonnet 5.5, structured output; the constant is `CLASSIFIER_MODEL`) judges what code cannot: page type, search intent, helpfulness, specificity, trust, and what kind of business the site belongs to. Every answer carries a self-reported confidence. Unsure pages are listed for manual review and never turn into tasks.
3. Findings become tasks with priority and effort, sorted into this week, this month and this quarter. Task source tells whether a rule measured it or the classifier judged it.

4. With DataForSEO connected, the audit adds market data: ranking keywords with search volume and estimated traffic, backlinks, and competitors. The classifier judges every ranking keyword for relevance (a ceramic butter dish does not bring customers to a tile shop) and only relevant keywords become opportunities: positions 4 to 10 as quick wins, positions 11 to 30 as keywords close to page one. Backlink targets are checked live, so links pointing to deleted pages turn into redirect tasks.

5. With DataForSEO connected, a mobile Lighthouse run measures the homepage: performance score, largest contentful paint (LCP), layout shift (CLS) and total blocking time (TBT). Slow values become tasks in the performance area.
6. The AI readiness check reads the robots.txt rules for GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot and Google-Extended, looks for an llms.txt and for organization and FAQ markup. It costs nothing and feeds the AI visibility area.
7. Optional and paid, off by default: the AI visibility check. The classifier writes typical customer questions for the business, ChatGPT, Perplexity and Gemini answer them through DataForSEO, and code judges per answer whether the website is cited (it is among the sources), mentioned (named in the text) or absent. Questions never contain the company name. Tasks show the questions where no assistant names the website and the competitors named instead.

Content quality weighs 25% of the score, so a technically clean site with weak pages does not get an A. The AI visibility area weighs 15%: readiness alone, or 70% presence and 30% readiness when the check ran.

## Reports and exports

Every finished audit comes with three deliverables:

- **HTML report page.** A standalone, print-ready page (A4, no external assets) with cover score, area bars, the action plan by horizon, keyword opportunities, backlinks, competitors, mobile loading speed, the AI readiness checklist and the AI answers. It is the single source for the PDF. The audit record stores it and a share link in `Report link`. Anyone with the link can open it without an account. Open it and choose Save as PDF in the print dialog.
- **Excel file.** Attached to the audit as `Excel`: overview (with the mobile speed values), action list (with a status dropdown to check items off), pages, keywords, backlinks, competitors, AI answers and a review list. Market sheets only appear when DataForSEO delivered data.
- **PDF file.** When a PDF renderer is configured (a Gotenberg service, for example `docker run --rm -p 3000:3000 gotenberg/gotenberg:8`), the same HTML is rendered by headless Chromium and attached as `PDF`. Without a renderer nothing breaks, you just use Save as PDF on the report page.

Reports can carry your brand name and accent color (Setup tab). If an export fails, the audit still completes and `Export notes` says what went wrong.

The share link contains a random token. Clear `Share token` on the audit to disable the link. The server resolves the workspace of a public link from the host, so on installations with one subdomain per workspace set `Report link base URL` to the workspace address.

The report page is built from text found on crawled websites. Everything is escaped, and the page carries its own Content-Security-Policy that allows no scripts except the print button, because the server serves it on the app origin and drops most response headers.

## Tools for agents

Agents inside Twenty see these as `app_<name>`. External agents reach them through the MCP tools `learn_tools` and `execute_tool`.

| Tool | Purpose |
| --- | --- |
| `list_seo_audits` | Finds audits by `companyId`, `domain` or `status`, newest first. Check this before paying for a new audit. |
| `start_seo_audit` | Queues an audit for a `domain` or a `companyId` (its website is used). Optional `language` `DE` or `EN`. Returns an `auditId` immediately. An audit for the same website that is already queued or running (last 30 minutes) is returned with `alreadyRunning`. |
| `get_seo_audit` | Status while running. When done: score, grade, area scores, market data, mobile speed, AI answers, report link, top tasks, keyword opportunities and the Markdown report (`includeReport: false` leaves it out). |
| `list_seo_audit_tasks` | The action list, most important first and cheapest fix first. Filter by `status`, `priority`, `area`. Each task has its affected URLs as a list. |
| `update_seo_audit_tasks` | Sets the status of up to 50 tasks per call and reports per task. |
| `list_seo_keywords` | Ranking keywords by search volume. Filter by `category` and `minSearchVolume`. |
| `compare_seo_audits` | Score, area, market, mobile speed and AI presence changes plus resolved and new tasks against the previous finished audit of the same website (or a given `previousAuditId`). Tasks are matched by their `ruleId`. When only one of the two audits has an area, `scoreNote` warns that the overall scores are not like for like. |

The `seo-audit` skill tells in-app agents when and in which order to use them. The same guidance for external agents is in `packages/twenty-claude-skills/skills/seo-audit/SKILL.md`.

Audits run asynchronously: creating a `seoAudit` record (through the tool, the UI or any API) triggers `run-seo-audit`. A cron function marks audits that never finished as failed after 20 minutes.

## Data model

`seoAudit` (linked to company) has many `seoAuditPage` (metrics and assessment per page), `seoAuditTask` (the action list with status for checking items off) and `seoKeywordOpportunity` (ranking keywords with position, volume, relevance and category, including a few discarded ones). The audit itself stores the mobile speed values (`mobilePerformanceScore`, `mobileLcpMs`, `mobileCls`, `mobileTbtMs`) and the AI check (`aiPresenceRate`, `aiQueriesTested`, and `aiVisibility` with the answers per question).

## Setup in the UI

After installing, open Settings > Apps > SEO Audit > Setup. The page walks through:

1. Connect Anthropic: paste the API key. It is stored as a secret workspace variable.
2. Choose defaults: report language and the maximum number of pages per audit.
3. Run your first audit: enter a website and the audit record opens. Recent audits are listed below.

The app's health check shows a banner on the app page when the key is missing or rejected by Anthropic. Without a key the audit still runs on measured rules only and the report says content quality was not assessed.

DataForSEO is optional. Enter the API login and API password from the DataForSEO dashboard under API Access (not your account password) and pick the market (country and language). Market data costs roughly 0.15 to 0.35 USD per audit, shown on the audit as DataForSEO cost. If a request fails, for example because the account has no Backlinks API subscription, the audit still completes and lists what was skipped.

The AI visibility check is switched on in the Variables tab with `SEO_AUDIT_AI_VISIBILITY` set to `ON`. It needs DataForSEO and the Anthropic key. A first measurement put the cost at roughly 0.5 to 1 USD per audit, mostly for Gemini. A mobile Lighthouse run costs about half a cent.

The same variables are also editable on the built-in Variables tab: `ANTHROPIC_API_KEY`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `SEO_AUDIT_MARKET`, `SEO_AUDIT_DEFAULT_LANGUAGE`, `SEO_AUDIT_MAX_PAGES`, `SEO_AUDIT_AI_VISIBILITY`, `SEO_AUDIT_BRAND_NAME`, `SEO_AUDIT_ACCENT_COLOR`, `SEO_AUDIT_PUBLIC_URL`, `PDF_RENDERER_URL`, `PDF_RENDERER_API_KEY`.

```bash
yarn install
yarn twenty dev          # sync to your workspace
yarn test:unit
```

## Limits

- The crawler reads the HTML a server returns. Pages rendered only by JavaScript are not seen fully.
- Only public hosts can be audited. Private and internal addresses are rejected, also on redirects.
- Confidence is the model's own estimate, not a calibrated probability.
- The DataForSEO response parsers are tolerant: a field that is missing or renamed leaves that part of the market data empty and is listed in the audit notes instead of failing the audit. The integration was written from the public API description and could not be run against the live API in the build environment.
- The PDF renderer integration follows the public Gotenberg API (POST /forms/chromium/convert/html) and was tested against a fake. The HTML to PDF layout was checked with a local headless Chromium.
- Keyword relevance is judged for the 300 keywords with the highest search volume.
- The Lighthouse and AI answer parsers are tested against real DataForSEO responses recorded on 2026-10-08. Lighthouse measures the homepage only, on a mobile profile.
- AI answers vary from run to run. The check asks 8 questions per engine, so a result is a sample. Google AI Overview is not part of it yet.
- The model names for ChatGPT, Perplexity and Gemini are constants (`ai-visibility.const.ts`) and change quickly. A model that DataForSEO no longer offers shows up as a note on the audit.
- "Mentioned" is detected from the domain name only, so a business that AI assistants know under a different name is counted as absent.
- The overall score includes the AI visibility area from version 0.2.0 on. Compare the area scores when you compare audits from before and after.
