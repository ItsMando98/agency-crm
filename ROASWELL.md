# Roaswell: what lives in this repository

Read this first if you are an AI agent working here. It describes what is custom on top of upstream Twenty, how the pieces connect, and the traps that have already cost time. Facts were read from the code on 2026-10-10. Anything marked "not verified" was not checked against a running system.

## 1. The big picture

Roaswell is a small web and advertising agency (SEO and content, Meta Ads, Google Ads, motion graphics) run with AI agents. Twenty CRM is the single backend. Everything custom either lives inside Twenty as an app, or sits next to it and talks to it over REST.

```
                          roaswell.com            app.roaswell.com
                      +----------------+       +------------------+
 visitor ------------>| roaswell-      |       | roaswell-app     |<---- team and (later) clients
  contact form        | website        |       | audits, CRM,     |      magic link login
                      | (SSR, 36 langs)|       | creators         |
                      +-------+--------+       +---------+--------+
                              | REST + API key           | REST + API key
                              v                          v
                      +--------------------------------------------+
                      |   Twenty (crm.roaswell.com, twenty-server) |
                      |                                            |
                      |  apps (packages/twenty-apps/internal):     |
                      |   seo-audit      creator-studio            |
                      |   agency-ops     real-estate (demo)        |
                      +----------+-----------------+---------------+
                                 |                 |
                       Anthropic, DataForSEO       treg.to (image, voice, video,
                       Gotenberg (PDF)             AI answers, SEO data)
```

Repository: `origin` is `ItsMando98/agency-crm`, `upstream` is `twentyhq/twenty`. Only `main` is used. The custom work is all in new directories, so merging upstream stays cheap. Do not edit upstream packages for Roaswell features.

## 2. Map of the custom parts

| Path | What it is | Runs where | Own lockfile |
| --- | --- | --- | --- |
| `packages/twenty-apps/internal/seo-audit` | Website SEO audits as an agent tool, v0.5.3 | Inside Twenty | yarn |
| `packages/twenty-apps/internal/creator-studio` | AI UGC creator profiles and asset generation, v0.1.1 | Inside Twenty | yarn |
| `packages/twenty-apps/internal/agency-ops` | Task queue and human approval gates for agents, v0.2.0 | Inside Twenty | yarn |
| `packages/twenty-apps/internal/real-estate` | Demo real estate CRM, v0.7.1 | Inside Twenty | yarn |
| `roaswell-app/` | Customer and team web app, React Router 7, no database of its own | Docker, app.roaswell.com | npm |
| `roaswell-website/` | Marketing site, React Router 7 SSR, lead capture into Twenty | Docker, roaswell.com | npm |
| `packages/twenty-claude-skills/skills/seo-audit/SKILL.md` | Skill that teaches external agents to use the SEO tools | Agent harness | n/a |

Important: none of `twenty-apps/*`, `roaswell-app` or `roaswell-website` are in the root Yarn workspaces. Run installs and tests inside each directory. Everything else under `packages/` is upstream Twenty, version 0.2.1 of the monorepo with `twenty-sdk` 2.46.0 (the internal apps pin SDK 2.45.0).

## 3. The Twenty apps

All four are built with `twenty-sdk` (`defineApplication`, `defineObject`, `defineField`, `defineLogicFunction`, `defineRole`, `definePageLayout`, front components). Every entity has a hard coded `universalIdentifier` UUID. Never regenerate or change an existing one, Twenty uses it to match the entity on sync.

Per app commands, run inside the app folder:

```bash
yarn install
yarn twenty dev        # sync to the connected workspace
yarn test:unit         # vitest
yarn typecheck         # tsgo
yarn lint              # oxlint
```

### 3.1 seo-audit (the most developed app)

Purpose: give it a homepage, get a score, a grade, per area scores, a prioritized task list and a Markdown report, plus HTML, Excel and PDF deliverables.

Pipeline (`src/logic-functions/run-seo-audit.ts`, 600 s timeout, triggered by `seoAudit.created` with status `QUEUED`):

1. Crawl up to 60 pages with the built in crawler (robots.txt and sitemap respected, private hosts rejected).
2. Rule checks in `src/utils/check-*.util.ts` produce findings. Source `RULE`.
3. Claude Sonnet 5.5 (`CLASSIFIER_MODEL`, structured output) judges what code cannot: page type, intent, helpfulness, trust, site profile, keyword relevance. Source `CLASSIFIER`. Low confidence items are flagged `needsReview` and never become tasks.
4. Optional DataForSEO: ranked keywords, backlinks, competitors, mobile Lighthouse for the homepage.
5. Free AI readiness check: robots.txt rules for AI crawlers, `llms.txt`, organization and FAQ markup.
6. Optional and paid, off by default: AI visibility check. The classifier writes customer questions without the company name, ChatGPT, Perplexity and Gemini answer them (through treg or DataForSEO), and code classifies each answer as `cited`, `mentioned` or absent.
7. Scoring (`src/constants/score-weights.const.ts`): CRAWLABILITY 20, CONTENT_QUALITY 25, ON_PAGE 15, VISIBILITY 15, AI_VISIBILITY 15, LINKS 10, STRUCTURED_DATA 10, PERFORMANCE 10, SECURITY 10. Grades A (90+) to F.
8. Exports: standalone print ready HTML report in the Roaswell look (black, one red accent, numbered sections, call to action only when `SEO_AUDIT_BOOKING_URL` is set) with a public share link, Excel workbook, PDF via Gotenberg when `PDF_RENDERER_URL` is set.

Data model: `seoAudit` (linked to company) with many `seoAuditPage`, `seoAuditTask`, `seoKeywordOpportunity`.

Agent tools (logic functions, seen as `app_<name>` inside Twenty, via `learn_tools` and `execute_tool` over MCP outside): `list_seo_audits`, `start_seo_audit`, `get_seo_audit`, `list_seo_audit_tasks`, `update_seo_audit_tasks`, `list_seo_keywords`, `compare_seo_audits`. Always call `list_seo_audits` first, a new audit costs money. If `start_seo_audit` returns `alreadyRunning`, reuse the `auditId`.

Other pieces: a Setup front component (Settings > Apps > SEO Audit > Setup) with per connection "Test connection" buttons, a health check banner, a cron that fails audits stuck for over 20 minutes, a public report route served from the Twenty server, a bundled in-app skill.

Variables (secret ones marked): `ANTHROPIC_API_KEY` (secret), `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` (secret), `TREG_TOKEN` (secret), `TREG_ORG`, `SEO_AUDIT_MARKET`, `SEO_AUDIT_DEFAULT_LANGUAGE` (DE or EN), `SEO_AUDIT_MAX_PAGES`, `SEO_AUDIT_AI_VISIBILITY` (OFF or ON), `SEO_AUDIT_BRAND_NAME`, `SEO_AUDIT_ACCENT_COLOR`, `SEO_AUDIT_BOOKING_URL`, `SEO_AUDIT_PUBLIC_URL`, `PDF_RENDERER_URL`, `PDF_RENDERER_API_KEY` (secret).

Known limits: the crawler reads server HTML only, so JavaScript rendered pages are seen partly. Lighthouse covers the homepage on mobile only. "Mentioned" is detected from the domain name only. AI answers vary per run, 8 questions per engine is a sample. The DataForSEO integration was written from the public API description and checked only against recorded responses, and the user's own DataForSEO account was paused for "unusual activity" on 2026-10-09, which is why treg was added as the main route. Design background: `packages/twenty-apps/internal/seo-audit/docs/port-plan-ai-visibility-and-lighthouse.md` (German).

### 3.2 creator-studio

Purpose: AI UGC creators. A creator holds persona, look, voice, rules and an AI disclosure label. An asset is one generated image, voice clip or short video.

Flow: a `ugcAsset` record is created with status `QUEUED` (by the Roaswell app or in Twenty), `run-ugc-asset` calls treg, uploads the result into the `file` field and writes `costUsd`, then marks `DONE` or `FAILED`. `fail-stuck-ugc-assets` fails assets older than 20 minutes. `processAsset` never throws, a failure ends on the record so a queue keeps moving.

Objects: `ugcCreator` (name, status, handle, persona, niche, language, tone, targetAudience, appearancePrompt, voiceName, rules, disclosureLabel, avatar) and `ugcAsset` (name, assetType, status, prompt, script, platform, durationSeconds, failureReason, costUsd, providerEndpoint, file, startedAt, finishedAt). Creator links to company.

treg endpoints used (`src/constants/creator-studio.const.ts`):

| Type | Endpoint | Cost |
| --- | --- | --- |
| Image | `reapi.image-gen.gemini-3-pro-image`, polled with `reapi.tasks.get` | about 0.03 USD |
| Voice | `google-ai.voice-gen.gemini-3-8-flash-tts`, synchronous base64 WAV | under 0.01 USD per line |
| Video | `replicate.video-gen.veo-3.1-fast`, polled with `replicate.predictions.get`, 4, 6 or 8 s | 0.10 USD per second silent, 0.15 with sound |

Every call carries a cost ceiling (treg refuses above it and charges nothing). Video was never triggered against the live API during the build because the minimum price is 0.40 USD. Variables: `TREG_TOKEN`, `TREG_ORG`.

Content rule: publish generated content only with the creator's disclosure label, never model a real person without written consent.

### 3.3 agency-ops

Purpose: a queue of work for AI agents plus human approval gates.

Objects: `agentTask` (status QUEUED, RUNNING, WAITING_APPROVAL, DONE, FAILED, CANCELLED; agentRole one of nine roles from LEAD_SALES to QA_SUPERVISOR; priority; brief; result; dueAt; startedAt; finishedAt; failureReason) and `approval` (status PENDING, APPROVED, REJECTED; category CALL, PAYMENT, CONTRACT, AD_BUDGET, FIRST_CONTACT, PUBLISH, OTHER; summary; proposedAction; decisionNote; decidedAt). Tasks link to company and opportunity, approvals link to a task.

Behavior, all event driven:

- `opportunity.created` queues a HIGH priority "Qualify lead" task for the lead sales agent, brief says to raise an approval before any first contact.
- `approval.created` sets the linked task to WAITING_APPROVAL.
- `approval.updated` to a decision: stamps `decidedAt`, requeues the task when all its approvals are approved, cancels it when one is rejected.
- A cron every 15 minutes fails tasks RUNNING for more than 120 minutes.

Safety design: the `Agent worker` role (API key role) can read and update tasks and approvals but its field permissions make `status`, `decisionNote` and `decidedAt` on approvals read only. An agent can raise an approval, it cannot decide one. Keep it that way. There is also a standalone "Agency Desk" page (front component) with an approval inbox and task queue overview.

No README in this app.

### 3.4 real-estate

A demo vertical, not part of the agency business. Objects `property` and `showing`; fields on standard `person` (personType BUYER, SELLER, AGENT, budget range, pre-approved, desired area) and `opportunity` (buyerStage); roles Agent, Broker, Seller; a dashboard, a Showing Planner front component, several views. A post-install function seeds French demo data (30 properties, 28 people, showings, opportunities), so do not install it into the production workspace unless you want that data.

## 4. roaswell-app (app.roaswell.com)

Stack: React Router 8 (framework mode, SSR), React 19, Tailwind 3, Radix, zod, nodemailer, vitest. Dev: `npm run dev` on port 3100, then `npm test`, `npm run typecheck`, `npm run lint`.

Key idea: no database. Twenty is the backend and the app talks to it with one server side API key (`TWENTY_API_KEY`) over REST (`GET /rest/<namePlural>`, filters like `field[eq]:value`). Because that key sees everything, authorization is enforced in the data layer under `app/lib/twenty/*.server.ts` by principal kind (`TEAM` or `CLIENT` with a `companyId`): a client always gets a company filter, only the team can start audits or change tasks. New data access belongs in that layer and needs a test.

Auth: passwordless magic links, signed tokens and sessions in `app/lib/auth`, rate limited. `TEAM_EMAILS` lists team addresses. Without `SMTP_HOST` the dev mode logs the link to the server log. Mail delivery is an open decision (SMTP or Resend).

Milestones as built:

- M1 Audits: dashboard, audit list, start audit, detail with score, areas, tasks (status change), AI visibility, keywords, comparison to the previous audit.
- M2 CRM: companies (list, create, detail with contacts, deals, notes, tasks, audits), people, pipeline over five stages.
- M3 Creators: profiles, order images, voices and short videos, gallery with cost. Generation itself happens in the `creator-studio` app, the web app only creates the `ugcAsset` and shows the result.
- M4 Client portal: not built. The role logic exists in the data layer, the invite flow does not.

Findings and the treg price list are in `roaswell-app/docs/m0-findings.md`. Open item there: how Twenty serves files of a FILES field over REST (the gallery reads `file[0].url` and shows a hint when it is missing). It was not tested against the live VPS.

Env vars: `TWENTY_API_KEY`, `SESSION_SECRET` (32+ chars), `TEAM_EMAILS` required; `TWENTY_API_URL` (default `http://twenty-server:3000`), `APP_URL`, `SMTP_*`, `MAIL_FROM` optional.

## 5. roaswell-website (roaswell.com)

Stack: React Router 8 SSR in an npm workspace (`apps/web`), Tailwind, shadcn style Radix components, framer-motion. Dev: `npm run dev` on port 3000. Content lives in `apps/web/src/data/*.ts` and the SEO, sitemap, `llms.txt`, `llms-full.txt`, breadcrumbs and Service and FAQ schema are generated from that data.

- Four disciplines at `/expertise/:slug`: `seo-content`, `meta-ads`, `google-ads`, `motion-graphics`. Sub pages at `/expertise/:slug/:subSlug`, 14 planned (`docs/subpages-plan.md`), batch 1 (five motion graphics pages with interactive samples) is built, SEO, Meta Ads and Google Ads sub pages are open.
- Other routes: work (case studies), approach, insights (articles), about, contact, legal, privacy.
- i18n: 36 locales under `src/i18n/locales`, default `en`, localized routes under `/:lang`, RTL handled for Arabic, Hebrew, Persian and Urdu.
- Lead capture: `POST /api/contact` runs `submitLeadToTwenty` in `src/lib/twenty.server.ts`: finds or creates the company by name, finds or creates the person by email, creates an opportunity at stage `NEW`, creates a note with the message and links it. Per IP rate limit of 5 requests per 10 minutes (`lead-guard.server.ts`). Without `TWENTY_API_KEY` the submit returns an error and nothing is stored.
- Legal and founder data come from environment variables (`COMPANY_*`, `FOUNDER_*`, `BOOKING_URL`), see `compose.yaml`. Empty values mean the legal page is incomplete, check before launch.
- Leftover scaffolding: `lib/pocketbase-client.ts`, `hooks/use-auth.ts`, `lib/require-auth.ts` and `horizons-preview-scripts.tsx` come from the generator and are not used by the product.
- `motion/` holds Hyperframes compositions (hero loop, footer loop, expertise loops) that render the looping videos.

## 6. Deployment

Both web apps ship as Docker images with a `compose.yaml` that joins the external `coolify` network and registers Traefik labels (Let's Encrypt) for `app.roaswell.com` and `roaswell.com` plus `www`. They reach Twenty at `http://twenty-server:3000` over that network. Twenty itself is at `crm.roaswell.com` on a VPS managed with Coolify. Not verified: whether the current versions are deployed and which app versions are installed in the live workspace. The Twenty apps are deployed with the Twenty CLI (`yarn twenty dev` or the build and deploy commands in the `manage-app` skill), not with Docker.

## 7. External services and money

| Service | Used by | Why | Cost notes |
| --- | --- | --- | --- |
| Anthropic API | seo-audit | Classifier (Claude Sonnet 5.5) | per audit usage |
| DataForSEO | seo-audit | Keywords, backlinks, competitors, Lighthouse | roughly 0.15 to 0.35 USD per audit |
| treg.to (`TREG_TOKEN`) | seo-audit, creator-studio | Gateway for AI answers, generation | prepaid, about 0.90 USD left on 2026-10-10, enough for images and voice, 1 to 2 videos |
| Gotenberg | seo-audit | HTML to PDF | self hosted, optional |
| SMTP or Resend | roaswell-app | Magic links | undecided |

treg is "OpenRouter for tools": one token, base URL `https://treg.to`, 3,800+ endpoints. Flow is `catalog_search`, `catalog_get` (price and reliability), then `call`. Failed calls are not charged, `X-Treg-Route-Max-Cost` caps a call, generation is async and result URLs expire so files must be copied. In the Claude Code session the `mcp__treg__*` tools are connected. Do not spend treg balance on experiments without the user saying so, and never trigger a Seedance call (13 to 26 USD each).

## 8. Rules that apply to every change

- Match surrounding code. House rules are in `CLAUDE.md` (`AGENTS.md` is a symlink to it): types over interfaces, string literals over enums, named exports, no `any`, no abbreviations, short `//` comments that say why, use existing guards (`isDefined`, `isNonEmptyString`, ...) instead of writing new ones.
- Commits: conventional style (`feat:`, `fix:`, `chore:`, `docs:`), lower case, one line. No AI attribution of any kind, CI rejects it. Do not commit translation catalogs (`.po`, `locales/generated`).
- Style of writing: direct, no marketing language, no em dashes, no emojis.
- Bump the app `version` in `package.json` when an installed Twenty app changes in a way that must sync.

## 9. Traps already hit

- Twenty reserves some field names. `type` on `ugcAsset` was renamed to `assetType`, `position` on keyword opportunities to `rankPosition`. Check before naming a field `type`, `position`, `status` collisions on standard objects, or other system names.
- Do not rewrite or reuse `universalIdentifier` values, and give new select option ids fresh UUIDs.
- Twenty REST depth only goes to 2, `limit` is capped by `QUERY_MAX_RECORDS`, and the responses nest under `data.<namePlural>`.
- Database event triggers fire on your own writes. `resume-task-on-approval-decided` guards on `decidedAt` to stop a loop, copy that pattern.
- Report pages are built from crawled third party text. Everything must stay HTML escaped and the page keeps its own Content-Security-Policy. Do not loosen that.
- Audits and generations cost real money. Check for an existing result before starting a new one, and never loop calls in bulk.
- AI answers and confidence values are samples and model estimates. Quote measured numbers exactly, label judgments as judgments.
- Package managers differ: yarn in the Twenty apps and monorepo, npm in `roaswell-app` and `roaswell-website`.
- After switching branches or touching `twenty-shared`, rebuild it (`npx nx build twenty-shared --skip-nx-cache`) before trusting type errors in dependent packages.

## 10. What is open

- Roaswell app M4 client portal (invites, client login).
- Decide mail transport for magic links.
- Verify file delivery of FILES fields over REST and generate a first real video.
- Website sub pages for SEO, Meta Ads and Google Ads, and filling the legal and founder variables.
- seo-audit: Google AI Overview, JavaScript rendering, deeper Lighthouse coverage, a live run of the DataForSEO integration.
- agency-ops has no README and no agent runner in this repository: the app provides the queue and the gates, the agents that pick up `QUEUED` tasks run elsewhere (not verified where).
