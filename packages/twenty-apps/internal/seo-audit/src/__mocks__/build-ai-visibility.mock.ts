import { type AiVisibility } from 'src/types/ai-visibility';

export const buildAiVisibility = (overrides: Partial<AiVisibility> = {}): AiVisibility => ({
  rows: [
    {
      query: 'Welcher Anwalt hilft bei einer Kündigung?',
      results: { CHATGPT: 'CITED', PERPLEXITY: 'ABSENT', GEMINI: 'UNKNOWN' },
      instead: ['rival.de', 'other.de'],
    },
    {
      query: 'Was kostet ein Anwalt für Arbeitsrecht?',
      results: { CHATGPT: 'MENTIONED', PERPLEXITY: 'ABSENT', GEMINI: 'ABSENT' },
      instead: [],
    },
  ],
  engines: ['CHATGPT', 'PERPLEXITY', 'GEMINI'],
  presenceRate: 0.3,
  queriesTested: 2,
  testedAt: '2026-10-09T10:00:00.000Z',
  costUsd: 0.17,
  notes: [],
  ...overrides,
});
