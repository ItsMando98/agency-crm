# SEO Audit

Website SEO audits that AI agents can start and read as tools, and that people can browse in the CRM.

Give it a homepage. A few minutes later the audit record holds a score, a grade, per-area scores, a prioritized action list and a Markdown report an agent can work through.

## How it works

1. Code crawls up to 60 pages (robots.txt respected, sitemap used) and measures everything that can be counted: status codes, titles, descriptions, headings, canonicals, links, HTTPS and mixed content, response time, structured data.
2. A small model (Claude Haiku 4.5, structured output) judges what code cannot: page type, search intent, helpfulness, specificity, trust, and what kind of business the site belongs to. Every answer carries a self-reported confidence. Unsure pages are listed for manual review and never turn into tasks.
3. Findings become tasks with priority and effort, sorted into this week, this month and this quarter. Task source tells whether a rule measured it or the classifier judged it.

4. With DataForSEO connected, the audit adds market data: ranking keywords with search volume and estimated traffic, backlinks, and competitors. The classifier judges every ranking keyword for relevance (a ceramic butter dish does not bring customers to a tile shop) and only relevant keywords become opportunities: positions 4 to 10 as quick wins, positions 11 to 30 as keywords close to page one. Backlink targets are checked live, so links pointing to deleted pages turn into redirect tasks.

Content quality weighs 25% of the score, so a technically clean site with weak pages does not get an A.

## Tools for agents

| Tool | Purpose |
| --- | --- |
| `start_seo_audit` | Queues an audit for a domain (optional `companyId`, `language` `DE` or `EN`). Returns an `auditId` immediately. |
| `get_seo_audit` | Returns status while running. When done: score, grade, area scores, top tasks and the Markdown report. |

Audits run asynchronously: creating a `seoAudit` record (through the tool, the UI or any API) triggers `run-seo-audit`. A cron function marks audits that never finished as failed after 20 minutes.

## Data model

`seoAudit` (linked to company) has many `seoAuditPage` (metrics and assessment per page), `seoAuditTask` (the action list with status for checking items off) and `seoKeywordOpportunity` (ranking keywords with position, volume, relevance and category, including a few discarded ones).

## Setup in the UI

After installing, open Settings > Apps > SEO Audit > Setup. The page walks through:

1. Connect Anthropic: paste the API key. It is stored as a secret workspace variable.
2. Choose defaults: report language and the maximum number of pages per audit.
3. Run your first audit: enter a website and the audit record opens. Recent audits are listed below.

The app's health check shows a banner on the app page when the key is missing or rejected by Anthropic. Without a key the audit still runs on measured rules only and the report says content quality was not assessed.

DataForSEO is optional. Enter the API login and API password from the DataForSEO dashboard under API Access (not your account password) and pick the market (country and language). Market data costs roughly 0.15 to 0.35 USD per audit, shown on the audit as DataForSEO cost. If a request fails, for example because the account has no Backlinks API subscription, the audit still completes and lists what was skipped.

The same variables are also editable on the built-in Variables tab: `ANTHROPIC_API_KEY`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `SEO_AUDIT_MARKET`, `SEO_AUDIT_DEFAULT_LANGUAGE`, `SEO_AUDIT_MAX_PAGES`.

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
- Keyword relevance is judged for the 300 keywords with the highest search volume.
