import { describe, expect, it } from 'vitest';

import { buildAiVisibility } from 'src/__mocks__/build-ai-visibility.mock';
import { buildAiVisibilityReportSection } from 'src/utils/build-ai-visibility-report-section.util';

describe('buildAiVisibilityReportSection', () => {
  it('lists the share, the date and the answers as a table', () => {
    const text = buildAiVisibilityReportSection({ aiVisibility: buildAiVisibility(), language: 'EN' }).join('\n');

    expect(text).toContain('## AI answers');
    expect(text).toContain('Share of answers that name the website: 30 %');
    expect(text).toContain('Measured on 2026-10-09');
    expect(text).toContain('| Question | ChatGPT | Perplexity | Gemini | Named instead |');
    expect(text).toContain('| Welcher Anwalt hilft bei einer Kündigung? | cited | absent | n/a | rival.de, other.de |');
  });

  it('writes the section in German', () => {
    const text = buildAiVisibilityReportSection({ aiVisibility: buildAiVisibility(), language: 'DE' }).join('\n');

    expect(text).toContain('## KI-Antworten');
    expect(text).toContain('Anteil der Antworten, die die Website nennen: 30 %');
  });

  it('shows only the notes when nothing could be asked', () => {
    const text = buildAiVisibilityReportSection({
      aiVisibility: buildAiVisibility({
        rows: [],
        presenceRate: null,
        queriesTested: 0,
        notes: ['AI visibility needs DataForSEO and an Anthropic key. It was skipped.'],
      }),
      language: 'EN',
    }).join('\n');

    expect(text).toContain('## AI answers');
    expect(text).toContain('> - AI visibility needs DataForSEO and an Anthropic key. It was skipped.');
    expect(text).not.toContain('| Question |');
    expect(text).not.toContain('Share of answers');
  });

  it('escapes pipes in questions', () => {
    const text = buildAiVisibilityReportSection({
      aiVisibility: buildAiVisibility({
        rows: [{ query: 'A | B?', results: { CHATGPT: 'ABSENT', PERPLEXITY: 'ABSENT', GEMINI: 'ABSENT' }, instead: [] }],
      }),
      language: 'EN',
    }).join('\n');

    expect(text).toContain('| A \\| B? | absent |');
  });
});
