import { describe, expect, it } from 'vitest';

import { formatPersonName } from 'src/front-components/utils/format-person-name.util';
import { formatShowingTime } from 'src/front-components/utils/format-showing-time.util';
import { getFollowUpReason } from 'src/front-components/utils/get-follow-up-reason.util';

describe('formatPersonName', () => {
  it('joins first and last name', () => {
    expect(formatPersonName({ firstName: 'Anna', lastName: 'Keller' }, 'Unknown')).toBe(
      'Anna Keller',
    );
  });

  it('keeps a single name part without extra spaces', () => {
    expect(formatPersonName({ firstName: ' Anna ', lastName: '' }, 'Unknown')).toBe('Anna');
  });

  it('falls back when there is no name', () => {
    expect(formatPersonName(null, 'Unknown')).toBe('Unknown');
    expect(formatPersonName({ firstName: ' ', lastName: null }, 'Unknown')).toBe('Unknown');
  });
});

describe('formatShowingTime', () => {
  it('formats the local time of the showing', () => {
    expect(formatShowingTime(new Date(2026, 9, 6, 14, 5).toISOString(), 'en-GB')).toBe('14:05');
  });

  it('returns an empty string for a missing or invalid date', () => {
    expect(formatShowingTime(null, 'en-GB')).toBe('');
    expect(formatShowingTime('not a date', 'en-GB')).toBe('');
  });
});

describe('getFollowUpReason', () => {
  it('asks for the outcome of a showing that is still scheduled', () => {
    expect(getFollowUpReason({ id: '1', status: 'SCHEDULED' })).toBe('Outcome still open');
  });

  it('asks for the buyer interest of a completed showing without a rating', () => {
    expect(getFollowUpReason({ id: '1', status: 'COMPLETED', interestLevel: null })).toBe(
      'Buyer interest missing',
    );
  });

  it('needs nothing for a rated, cancelled or no-show showing', () => {
    expect(getFollowUpReason({ id: '1', status: 'COMPLETED', interestLevel: 'RATING_4' })).toBeNull();
    expect(getFollowUpReason({ id: '2', status: 'CANCELLED' })).toBeNull();
    expect(getFollowUpReason({ id: '3', status: 'NO_SHOW' })).toBeNull();
  });
});
