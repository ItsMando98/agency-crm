export const CRAWL_USER_AGENT = 'TwentySeoAuditBot/1.0';
export const MAX_CRAWLED_PAGES = 60;
export const MAX_LINK_TARGET_CHECKS = 40;
export const CRAWL_CONCURRENCY = 4;
export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_REDIRECTS = 5;
export const MAX_BODY_BYTES = 2_000_000;
export const MAX_TEXT_EXCERPT_CHARS = 2_500;
export const SITEMAP_NESTING_LIMIT = 3;
export const NON_HTML_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'avif',
  'css', 'js', 'json', 'xml', 'txt', 'zip', 'rar', 'gz', 'mp3', 'mp4',
  'mov', 'avi', 'woff', 'woff2', 'ttf', 'eot', 'doc', 'docx', 'xls',
  'xlsx', 'ppt', 'pptx',
] as const;
export const CRAWL_TIME_BUDGET_MS = 240_000;
export const ROBOTS_USER_AGENT_TOKEN = 'twentyseoauditbot';
