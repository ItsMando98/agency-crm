import { describe, expect, it } from 'vitest';

import { classifyAiAnswer } from 'src/utils/classify-ai-answer.util';

const OWN_DOMAIN = 'kanzlei-beispiel.de';
const BRAND_NAMES = ['kanzlei-beispiel', 'kanzlei beispiel'];
const LONG_TEXT = 'Hier steht eine ausführliche Antwort über Anbieter in der Region.';

const classify = (answer: Parameters<typeof classifyAiAnswer>[0]['answer']) =>
  classifyAiAnswer({ answer, ownDomain: OWN_DOMAIN, brandNames: BRAND_NAMES });

describe('classifyAiAnswer', () => {
  it('is cited when a source belongs to the website', () => {
    expect(
      classify({
        text: LONG_TEXT,
        sources: [{ url: 'https://www.kanzlei-beispiel.de/leistungen?utm_source=openai', title: null }],
      }).status,
    ).toBe('CITED');
  });

  it('counts a subdomain as the website but not a look-alike domain', () => {
    expect(
      classify({ text: LONG_TEXT, sources: [{ url: 'https://blog.kanzlei-beispiel.de/a', title: null }] }).status,
    ).toBe('CITED');
    expect(
      classify({ text: LONG_TEXT, sources: [{ url: 'https://notkanzlei-beispiel.de/', title: null }] }).status,
    ).toBe('ABSENT');
  });

  it('is mentioned when the text names the brand but no source belongs to the website', () => {
    expect(
      classify({ text: 'Zu empfehlen ist auch die Kanzlei Beispiel aus Berlin.', sources: [] }).status,
    ).toBe('MENTIONED');
  });

  it('is mentioned when the text names the domain', () => {
    expect(classify({ text: 'Mehr unter kanzlei-beispiel.de, falls Interesse besteht.', sources: [] }).status).toBe(
      'MENTIONED',
    );
  });

  it('does not match a brand inside a longer word', () => {
    expect(classify({ text: 'Die Superkanzlei Beispielhaft ist bekannt für ihre Arbeit.', sources: [] }).status).toBe(
      'ABSENT',
    );
  });

  it('is absent when neither text nor sources name the website', () => {
    expect(classify({ text: LONG_TEXT, sources: [{ url: 'https://rival.de/', title: null }] }).status).toBe('ABSENT');
  });

  it('is unknown without a usable answer', () => {
    expect(classify(null).status).toBe('UNKNOWN');
    expect(classify({ text: 'kurz', sources: [] }).status).toBe('UNKNOWN');
  });

  it('lists the other domains, most often first, without search engines and the website itself', () => {
    const { competitorDomains } = classify({
      text: LONG_TEXT,
      sources: [
        { url: 'https://www.rival.de/a', title: null },
        { url: 'https://other.de/', title: null },
        { url: 'https://rival.de/b', title: null },
        { url: 'https://de.wikipedia.org/wiki/Thema', title: null },
        { url: 'https://kanzlei-beispiel.de/', title: null },
        { url: 'https://third.de/', title: null },
        { url: 'https://fourth.de/', title: null },
        { url: 'kein link', title: null },
      ],
    });

    expect(competitorDomains).toEqual(['rival.de', 'other.de', 'third.de']);
  });

  it('ignores brand names that are too short', () => {
    expect(
      classifyAiAnswer({ answer: { text: LONG_TEXT + ' abc', sources: [] }, ownDomain: 'abc.de', brandNames: ['abc'] })
        .status,
    ).toBe('ABSENT');
  });
});
