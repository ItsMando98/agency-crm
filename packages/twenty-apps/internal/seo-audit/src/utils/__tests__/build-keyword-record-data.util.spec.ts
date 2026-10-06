import { describe, expect, it } from 'vitest';

import { buildScoredKeyword } from 'src/__mocks__/build-scored-keyword.mock';
import { buildKeywordRecordData } from 'src/utils/build-keyword-record-data.util';

describe('buildKeywordRecordData', () => {
  it('maps a scored keyword onto the record fields', () => {
    expect(buildKeywordRecordData('audit-1', buildScoredKeyword())).toEqual({
      seoAuditId: 'audit-1',
      keyword: 'kündigungsfrist',
      rankPosition: 17,
      searchVolume: 60000,
      estimatedTraffic: 10,
      url: 'https://example.com/kuendigung',
      category: 'NEAR_PAGE_ONE',
      relevance: 0.9,
      confidence: 0.9,
      needsReview: false,
    });
  });
});
