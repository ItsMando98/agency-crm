import { describe, expect, it } from 'vitest';

import { type AiAnswerStatus, type AiVisibility } from 'src/types/ai-visibility';
import { checkAiPresence } from 'src/utils/check-ai-presence.util';

const buildRow = (
  query: string,
  statuses: [AiAnswerStatus, AiAnswerStatus, AiAnswerStatus],
  instead: string[] = [],
) => ({
  query,
  results: { CHATGPT: statuses[0], PERPLEXITY: statuses[1], GEMINI: statuses[2] },
  instead,
});

const buildVisibility = (
  rows: AiVisibility['rows'],
  presenceRate: number | null,
): AiVisibility => ({
  rows,
  engines: ['CHATGPT', 'PERPLEXITY', 'GEMINI'],
  presenceRate,
  queriesTested: rows.filter((row) => Object.values(row.results).some((status) => status !== 'UNKNOWN')).length,
  testedAt: '2026-10-09T10:00:00.000Z',
  costUsd: 0,
  notes: [],
});

const absentRows = (count: number, instead: string[] = ['rival.de']) =>
  Array.from({ length: count }, (_, index) =>
    buildRow(`Frage ${index}?`, ['ABSENT', 'ABSENT', 'ABSENT'], instead),
  );

describe('checkAiPresence', () => {
  it('returns nothing without a measurement', () => {
    expect(checkAiPresence({ aiVisibility: null, language: 'DE' })).toEqual([]);
    expect(checkAiPresence({ aiVisibility: buildVisibility([], null), language: 'DE' })).toEqual([]);
  });

  it('does not judge a handful of questions', () => {
    expect(checkAiPresence({ aiVisibility: buildVisibility(absentRows(5), 0), language: 'DE' })).toEqual([]);
  });

  it('reports questions where no AI names the website, with examples', () => {
    const findings = checkAiPresence({
      aiVisibility: buildVisibility(
        [
          buildRow('Welcher Anwalt hilft bei einer Kündigung?', ['ABSENT', 'ABSENT', 'ABSENT'], ['rival.de', 'other.de']),
          buildRow('Was kostet ein Anwalt?', ['ABSENT', 'ABSENT', 'ABSENT'], []),
          buildRow('Wie finde ich einen Anwalt?', ['CITED', 'ABSENT', 'ABSENT'], []),
          ...absentRows(4, []),
        ],
        0.1,
      ),
      language: 'DE',
    });

    expect(findings[0]).toEqual({
      ruleId: 'AI_NOT_CITED',
      affectedUrls: [],
      count: 6,
      details: [
        '"Welcher Anwalt hilft bei einer Kündigung?" (stattdessen genannt: rival.de, other.de)',
        '"Was kostet ein Anwalt?"',
        '"Frage 0?"',
      ],
    });
  });

  it('writes the examples in English', () => {
    const findings = checkAiPresence({
      aiVisibility: buildVisibility(absentRows(6, ['rival.de']), 0),
      language: 'EN',
    });

    expect(findings[0].details?.[0]).toBe('"Frage 0?" (named instead: rival.de)');
  });

  it('stays quiet when the website is named often enough', () => {
    const rows = [
      ...Array.from({ length: 6 }, (_, index) => buildRow(`Genannt ${index}?`, ['CITED', 'MENTIONED', 'ABSENT'])),
      ...absentRows(2, []),
    ];

    expect(
      checkAiPresence({ aiVisibility: buildVisibility(rows, 0.6), language: 'DE' }).map((finding) => finding.ruleId),
    ).not.toContain('AI_NOT_CITED');
  });

  it('points out a competitor that is named in three or more of those questions', () => {
    const findings = checkAiPresence({
      aiVisibility: buildVisibility(
        [
          ...absentRows(3, ['rival.de', 'other.de']),
          ...absentRows(3, ['other.de']).map((row, index) => ({ ...row, query: `Weitere ${index}?` })),
        ],
        0,
      ),
      language: 'DE',
    });
    const competitorFinding = findings.find((finding) => finding.ruleId === 'AI_COMPETITOR_PREFERRED');

    expect(competitorFinding).toEqual({
      ruleId: 'AI_COMPETITOR_PREFERRED',
      affectedUrls: [],
      details: ['other.de: in 6 Fragen genannt', 'rival.de: in 3 Fragen genannt'],
    });
  });

  it('ignores a competitor that is named in only two questions', () => {
    const findings = checkAiPresence({
      aiVisibility: buildVisibility(
        [...absentRows(2, ['rival.de']), ...absentRows(4, []).map((row, index) => ({ ...row, query: `Andere ${index}?` }))],
        0,
      ),
      language: 'DE',
    });

    expect(findings.map((finding) => finding.ruleId)).toEqual(['AI_NOT_CITED']);
  });
});
