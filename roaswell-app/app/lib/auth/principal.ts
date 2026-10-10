export type Principal =
  | { kind: 'TEAM'; email: string }
  | { kind: 'CLIENT'; email: string; companyId: string };
