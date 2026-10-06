# SEO Audit

Website SEO audits that AI agents can start and read as tools, and that people can browse in the CRM.

Give it a homepage. A few minutes later the audit record holds a score, a grade, per-area scores, a prioritized action list and a Markdown report an agent can work through.

## How it works

1. Code crawls up to 60 pages (robots.txt respected, sitemap used) and measures everything that can be counted: status codes, titles, descriptions, headings, canonicals, links, HTTPS and mixed content, response time, structured data.
2. A small model (Claude Haiku 4.5, structured output) judges what code cannot: page type, search intent, helpfulness, specificity, trust, and what kind of business the site belongs to. Every answer carries a self-reported confidence. Unsure pages are listed for manual review and never turn into tasks.
3. Findings become tasks with priority and effort, sorted into this week, this month and this quarter. Task source tells whether a rule measured it or the classifier judged it.

Content quality weighs 25% of the score, so a technically clean site with weak pages does not get an A.

## Tools for agents

| Tool | Purpose |
| --- | --- |
| `start_seo_audit` | Queues an audit for a domain (optional `companyId`, `language` `DE` or `EN`). Returns an `auditId` immediately. |
| `get_seo_audit` | Returns status while running. When done: score, grade, area scores, top tasks and the Markdown report. |

Audits run asynchronously: creating a `seoAudit` record (through the tool, the UI or any API) triggers `run-seo-audit`. A cron function marks audits that never finished as failed after 20 minutes.

## Data model

`seoAudit` (linked to company) has many `seoAuditPage` (metrics and assessment per page) and `seoAuditTask` (the action list with status for checking items off).

## Setup in the UI

After installing, open Settings > Apps > SEO Audit > Setup. The page walks through:

1. Connect Anthropic: paste the API key. It is stored as a secret workspace variable.
2. Choose defaults: report language and the maximum number of pages per audit.
3. Run your first audit: enter a website and the audit record opens. Recent audits are listed below.

The app's health check shows a banner on the app page when the key is missing or rejected by Anthropic. Without a key the audit still runs on measured rules only and the report says content quality was not assessed.

The same variables are also editable on the built-in Variables tab: `ANTHROPIC_API_KEY`, `SEO_AUDIT_DEFAULT_LANGUAGE`, `SEO_AUDIT_MAX_PAGES`.

```bash
yarn install
yarn twenty dev          # sync to your workspace
yarn test:unit
```

## Limits

- The crawler reads the HTML a server returns. Pages rendered only by JavaScript are not seen fully.
- Only public hosts can be audited. Private and internal addresses are rejected, also on redirects.
- Confidence is the model's own estimate, not a calibrated probability.
- Rankings, keyword opportunities and backlinks need an external data source and are not part of this version.
