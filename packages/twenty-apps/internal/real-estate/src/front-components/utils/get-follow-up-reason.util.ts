import { type ShowingSummary } from 'src/front-components/types/showing-summary';

// Only meant for showings that already took place.
export const getFollowUpReason = (showing: ShowingSummary): string | null => {
  if (showing.status === 'SCHEDULED') {
    return 'Outcome still open';
  }

  if (showing.status === 'COMPLETED' && !showing.interestLevel) {
    return 'Buyer interest missing';
  }

  return null;
};
