export type TregCredentials = {
  token: string;
  // The team slug. Tokens from `treg login` need it, agent tokens do not.
  organization: string | null;
};
