import { describe, expect, it } from 'vitest';

import { buildApprovalDecisionData } from 'src/front-components/utils/build-approval-decision.util';

describe('buildApprovalDecisionData', () => {
  it('returns only the status when the note is empty', () => {
    expect(buildApprovalDecisionData('APPROVED', '')).toEqual({ status: 'APPROVED' });
  });

  it('treats a whitespace-only note as empty', () => {
    expect(buildApprovalDecisionData('REJECTED', '   ')).toEqual({ status: 'REJECTED' });
  });

  it('trims the note and keeps it with the decision', () => {
    expect(buildApprovalDecisionData('REJECTED', '  Budget too high  ')).toEqual({
      status: 'REJECTED',
      decisionNote: 'Budget too high',
    });
  });
});
