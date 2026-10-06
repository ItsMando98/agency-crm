export type SetupStep = {
  id: 'ANTHROPIC_KEY' | 'DEFAULTS' | 'FIRST_AUDIT';
  status: 'DONE' | 'TODO' | 'OPTIONAL';
};
