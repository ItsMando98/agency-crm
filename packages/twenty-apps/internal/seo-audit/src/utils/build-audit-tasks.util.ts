import { FINDING_CATALOG } from 'src/constants/finding-catalog.const';
import { EFFORT_RANK, PRIORITY_RANK } from 'src/constants/seo-ranks.const';
import { MAX_AFFECTED_URLS_PER_TASK } from 'src/constants/seo-thresholds.const';
import { type AuditLanguage } from 'src/types/audit-language';
import { type AuditTask } from 'src/types/audit-task';
import { type Finding } from 'src/types/finding';

export const buildAuditTasks = (
  findings: Finding[],
  language: AuditLanguage,
): AuditTask[] =>
  findings
    .map((finding) => {
      const definition = FINDING_CATALOG[finding.ruleId];
      const text = definition.text[language];
      const count = finding.count ?? finding.affectedUrls.length;
      const details = finding.details ?? [];

      return {
        ruleId: finding.ruleId,
        name: text.title.replace('{count}', String(count)),
        description:
          details.length > 0
            ? `${text.recommendation}\n\n${details.map((detail) => `- ${detail}`).join('\n')}`
            : text.recommendation,
        priority: definition.priority,
        effort: definition.effort,
        area: definition.area,
        source: definition.source,
        affectedUrls: finding.affectedUrls.slice(0, MAX_AFFECTED_URLS_PER_TASK),
        affectedCount: count,
      };
    })
    .sort(
      (first, second) =>
        PRIORITY_RANK[first.priority] - PRIORITY_RANK[second.priority] ||
        EFFORT_RANK[first.effort] - EFFORT_RANK[second.effort] ||
        second.affectedCount - first.affectedCount,
    )
    .map(({ affectedCount: _affectedCount, ...task }) => task);
