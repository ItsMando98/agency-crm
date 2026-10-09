import { AI_READINESS_DETAIL_LABELS } from 'src/constants/ai-readiness-detail-labels.const';
import { AI_CRAWLERS } from 'src/constants/ai-readiness.const';
import { type AiReadiness } from 'src/types/ai-readiness';
import { type AuditLanguage } from 'src/types/audit-language';
import { type Finding } from 'src/types/finding';

type CheckAiReadinessParams = {
  aiReadiness: AiReadiness;
  language: AuditLanguage;
};

// Missing organization markup is reported by checkStructuredData, so it is not repeated here.
export const checkAiReadiness = ({
  aiReadiness,
  language,
}: CheckAiReadinessParams): Finding[] => {
  const findings: Finding[] = [];
  const blockedCrawlers = AI_CRAWLERS.filter(
    ({ id }) => aiReadiness.crawlerAccess[id] === 'BLOCKED',
  );

  if (blockedCrawlers.length > 0) {
    findings.push({
      ruleId: 'AI_CRAWLERS_BLOCKED',
      affectedUrls: [],
      count: blockedCrawlers.length,
      details: [
        AI_READINESS_DETAIL_LABELS[language].blockedCrawlers(
          blockedCrawlers.map(({ label }) => label).join(', '),
        ),
      ],
    });
  }

  if (!aiReadiness.llmsTxtFound) {
    findings.push({ ruleId: 'LLMS_TXT_MISSING', affectedUrls: [] });
  }

  if (!aiReadiness.faqSchemaFound) {
    findings.push({ ruleId: 'FAQ_SCHEMA_MISSING', affectedUrls: [] });
  }

  return findings;
};
