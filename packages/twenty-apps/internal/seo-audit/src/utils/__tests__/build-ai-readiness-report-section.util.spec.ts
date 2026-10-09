import { describe, expect, it } from 'vitest';

import { buildAiReadiness } from 'src/__mocks__/build-ai-readiness.mock';
import { buildAiReadinessReportSection } from 'src/utils/build-ai-readiness-report-section.util';

describe('buildAiReadinessReportSection', () => {
  it('lists the checks as a table for agents', () => {
    const text = buildAiReadinessReportSection({
      aiReadiness: buildAiReadiness({ faqSchemaFound: false }),
      language: 'EN',
    }).join('\n');

    expect(text).toContain('## AI readiness');
    expect(text).toContain('| Crawler access: GPTBot | allowed |');
    expect(text).toContain('| FAQ markup | missing |');
    expect(text).toContain('| llms.txt | present |');
  });

  it('writes the section in German', () => {
    const text = buildAiReadinessReportSection({
      aiReadiness: buildAiReadiness(),
      language: 'DE',
    }).join('\n');

    expect(text).toContain('## KI-Bereitschaft');
    expect(text).toContain('| Prüfung | Status |');
  });
});
