import { AI_PRESENCE_DETAIL_LABELS } from 'src/constants/ai-presence-detail-labels.const';
import {
  AI_COMPETITOR_MIN_QUERIES,
  AI_MAX_COMPETITORS_SHOWN,
  AI_MAX_EXAMPLES,
  AI_MIN_QUERIES_FOR_FINDINGS,
  AI_PRESENCE_GOOD_RATE,
} from 'src/constants/ai-visibility.const';
import { type AiVisibility } from 'src/types/ai-visibility';
import { type AuditLanguage } from 'src/types/audit-language';
import { type Finding } from 'src/types/finding';

type CheckAiPresenceParams = {
  aiVisibility: AiVisibility | null;
  language: AuditLanguage;
};

// A handful of answers is a sample, not a finding, so small measurements stay silent.
export const checkAiPresence = ({
  aiVisibility,
  language,
}: CheckAiPresenceParams): Finding[] => {
  if (
    aiVisibility === null ||
    aiVisibility.presenceRate === null ||
    aiVisibility.queriesTested < AI_MIN_QUERIES_FOR_FINDINGS
  ) {
    return [];
  }

  const labels = AI_PRESENCE_DETAIL_LABELS[language];
  const unnamedRows = aiVisibility.rows.filter((row) => {
    const statuses = Object.values(row.results);

    return (
      statuses.some((status) => status === 'ABSENT') &&
      !statuses.some((status) => status === 'CITED' || status === 'MENTIONED')
    );
  });
  const findings: Finding[] = [];

  if (
    aiVisibility.presenceRate < AI_PRESENCE_GOOD_RATE &&
    unnamedRows.length > 0
  ) {
    findings.push({
      ruleId: 'AI_NOT_CITED',
      affectedUrls: [],
      count: unnamedRows.length,
      details: unnamedRows
        .slice(0, AI_MAX_EXAMPLES)
        .map((row) => labels.question(row.query, row.instead)),
    });
  }

  const queryCountByDomain = new Map<string, number>();

  unnamedRows
    .flatMap((row) => row.instead)
    .forEach((domain) =>
      queryCountByDomain.set(domain, (queryCountByDomain.get(domain) ?? 0) + 1),
    );

  const preferredCompetitors = [...queryCountByDomain.entries()]
    .filter(([, queryCount]) => queryCount >= AI_COMPETITOR_MIN_QUERIES)
    .sort((first, second) => second[1] - first[1])
    .slice(0, AI_MAX_COMPETITORS_SHOWN);

  if (preferredCompetitors.length > 0) {
    findings.push({
      ruleId: 'AI_COMPETITOR_PREFERRED',
      affectedUrls: [],
      details: preferredCompetitors.map(([domain, queryCount]) =>
        labels.competitor(domain, queryCount),
      ),
    });
  }

  return findings;
};
