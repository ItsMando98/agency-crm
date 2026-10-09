export const SEO_AUDIT_SKILL_CONTENT = `You run and interpret SEO audits for websites of the agency's clients and prospects.

## When to use this skill

- Someone asks how a website performs in search, what to fix first, or wants an SEO audit, a report or a pitch for a prospect.
- A company record should get a technical and content check.
- A client wants to see progress since the last audit.

## Workflow

1. Look for an existing audit first with \`app_list_seo_audits\` (filter by companyId or domain). A new audit costs money, so reuse a recent finished one when the user does not need fresh data.
2. If a new one is needed, call \`app_start_seo_audit\` with a domain or a companyId. If the response has alreadyRunning true, use the returned auditId and do not start another one.
3. Poll \`app_get_seo_audit\` with the auditId every 30 to 60 seconds until the status is DONE or FAILED. A normal audit takes a few minutes. On FAILED, tell the user the failureReason.
4. Read the result: score, grade, area scores, market data and the report. Pass includeReport false when only the numbers are needed.
5. Get the work list with \`app_list_seo_audit_tasks\`. Start with CRITICAL and HIGH tasks and prefer low effort within the same priority. The list is already sorted that way.
6. Do the work or hand it over. Mark tasks with \`app_update_seo_audit_tasks\` (IN_PROGRESS when started, DONE once the fix is live, WONT_FIX when the client declines).
7. After fixes are deployed, start a new audit and call \`app_compare_seo_audits\` to show what improved, what is resolved and what is new.

## Tools

- \`app_list_seo_audits\`: find audits by companyId, domain or status, newest first.
- \`app_start_seo_audit\`: queue an audit for a domain or company. Returns an auditId at once.
- \`app_get_seo_audit\`: status while running, full result when done. It also returns the mobile speed of the homepage (Lighthouse) when DataForSEO is configured and the AI answers when the AI visibility check ran.
- \`app_list_seo_audit_tasks\`: action items with fix description, affected URLs, priority, effort, area, source and status. Filter by status, priority or area.
- \`app_update_seo_audit_tasks\`: change the status of up to 50 tasks per call.
- \`app_list_seo_keywords\`: ranking keywords with position, search volume and category. Needs DataForSEO.
- \`app_compare_seo_audits\`: change against the previous finished audit of the same website, including mobile speed and AI presence. When \`scoreNote\` is set, the two overall scores cover different areas, so compare the area scores.

## Reading the result

- Score runs from 0 to 100. 80 and above is strong, 60 to 79 is okay, below 60 is weak. Grades go from A (90+) to F.
- Areas: CRAWLABILITY, ON_PAGE, CONTENT_QUALITY, LINKS, STRUCTURED_DATA, PERFORMANCE, SECURITY, VISIBILITY and AI_VISIBILITY. VISIBILITY only exists when DataForSEO is configured. AI_VISIBILITY combines how ready the site is for AI crawlers (robots.txt access, llms.txt, organization and FAQ markup) with, when the optional and paid AI visibility check is switched on in the Variables tab, how often ChatGPT, Perplexity and Gemini name the site in answers to typical customer questions. Those answers vary from run to run, so treat them as a sample.
- Task source RULE means the code measured it, so it is a fact. Source CLASSIFIER means a model judged content quality or relevance, so treat it as a well-founded opinion that a person should skim.
- Pages and keywords with needsReview true were judged with low confidence. Do not present them as facts. Say they need a manual look.
- Priority sets the order, effort sets the cost. Critical or high priority with low effort belongs in the first week. Other high priority work fits the first month, the rest into the quarter.
- Keyword categories: TOP_3 is already strong. QUICK_WIN is position 4 to 10 and the cheapest gain. NEAR_PAGE_ONE is position 11 to 30. LOW_RANKING is beyond that. NOT_RELEVANT keywords do not fit the business. NEEDS_REVIEW means the relevance is unclear.
- Use \`app_list_seo_keywords\` with category QUICK_WIN or NEAR_PAGE_ONE and a minSearchVolume to pick targets.

## Cautions

- Quote numbers exactly as they appear in the audit or report. Do not estimate traffic, rankings or backlinks yourself.
- Market data (rankings, keywords, backlinks, competitors) is missing when DataForSEO is not set up. Say so instead of guessing. The marketDataNotes field explains what was skipped.
- The audit crawls at most 60 pages. For large sites it is a sample, so phrase counts as "in the pages checked".
- Only set a task to DONE when the fix is actually live. A new audit is the proof.
- Do not start audits in bulk. Each one costs roughly 0.15 to 0.35 USD in DataForSEO and Anthropic usage.
- Private or internal addresses are refused. Only public websites can be audited.

## Sharing with clients

- The reportUrl of a finished audit opens a branded HTML report. In the browser it can be saved as PDF. Share this link rather than pasting the Markdown report.
- The Excel and PDF files are attached to the audit record in the CRM when export is configured. exportNotes says what was skipped.
- Write summaries for clients in their language, plain and without jargon, and lead with the three most important findings and the first week of work.
`;
