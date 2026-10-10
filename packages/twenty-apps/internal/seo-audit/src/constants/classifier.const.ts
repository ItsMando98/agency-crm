// Makes the many small decisions: pages, keywords, profile, questions.
export const CLASSIFIER_MODEL = 'claude-haiku-5-5';
// Reads the facts of a finished audit and writes the summary.
export const SUMMARY_MODEL = 'claude-opus-5-5';
export const CLASSIFIER_CONCURRENCY = 6;
// Haiku 5.5 stopped at 400 tokens for 3 of 63 requests in a real audit.
export const PAGE_ASSESSMENT_MAX_TOKENS = 800;
export const SITE_PROFILE_MAX_TOKENS = 400;
