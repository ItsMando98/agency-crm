import { describe, expect, it } from 'vitest';

import { evaluateAiCrawlerAccess } from 'src/utils/evaluate-ai-crawler-access.util';

describe('evaluateAiCrawlerAccess', () => {
  it('allows every crawler when there is no robots.txt', () => {
    expect(Object.values(evaluateAiCrawlerAccess(null))).toEqual(
      Array(5).fill('ALLOWED'),
    );
    expect(Object.values(evaluateAiCrawlerAccess(''))).toEqual(Array(5).fill('ALLOWED'));
  });

  it('blocks only the crawler that is named', () => {
    expect(
      evaluateAiCrawlerAccess('User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /admin'),
    ).toEqual({
      GPTBOT: 'BLOCKED',
      OAI_SEARCHBOT: 'ALLOWED',
      CLAUDEBOT: 'ALLOWED',
      PERPLEXITYBOT: 'ALLOWED',
      GOOGLE_EXTENDED: 'ALLOWED',
    });
  });

  it('blocks every crawler when the wildcard group closes the whole site', () => {
    expect(Object.values(evaluateAiCrawlerAccess('User-agent: *\nDisallow: /'))).toEqual(
      Array(5).fill('BLOCKED'),
    );
  });

  it('lets a specific group override the wildcard group', () => {
    const access = evaluateAiCrawlerAccess(
      'User-agent: *\nDisallow: /\n\nUser-agent: ClaudeBot\nAllow: /',
    );

    expect(access.CLAUDEBOT).toBe('ALLOWED');
    expect(access.GPTBOT).toBe('BLOCKED');
  });

  it('ignores rules that do not close the homepage', () => {
    expect(
      Object.values(evaluateAiCrawlerAccess('User-agent: *\nDisallow: /private\nDisallow: /cart')),
    ).toEqual(Array(5).fill('ALLOWED'));
  });

  it('matches crawler names regardless of case', () => {
    expect(evaluateAiCrawlerAccess('user-agent: gptbot\ndisallow: /').GPTBOT).toBe('BLOCKED');
  });

  it('treats several user agents in one group alike', () => {
    const access = evaluateAiCrawlerAccess(
      'User-agent: GPTBot\nUser-agent: PerplexityBot\nDisallow: /',
    );

    expect(access.GPTBOT).toBe('BLOCKED');
    expect(access.PERPLEXITYBOT).toBe('BLOCKED');
    expect(access.CLAUDEBOT).toBe('ALLOWED');
  });
});
