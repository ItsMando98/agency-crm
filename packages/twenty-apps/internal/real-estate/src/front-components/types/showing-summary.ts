export type PersonName = {
  firstName?: string | null;
  lastName?: string | null;
};

export type ShowingSummary = {
  id: string;
  name?: string | null;
  scheduledAt?: string | null;
  status?: string | null;
  interestLevel?: string | null;
  property?: { id: string; name?: string | null } | null;
  buyer?: { id: string; name?: PersonName | null } | null;
  agent?: { id: string; name?: PersonName | null } | null;
};

export type ShowingDayGroup = {
  dayKey: string;
  label: string;
  showings: ShowingSummary[];
};
