export type SetupStep = {
  id: 'ANTHROPIC_KEY' | 'DATAFORSEO' | 'DEFAULTS' | 'FIRST_AUDIT';
  status: 'DONE' | 'TODO' | 'OPTIONAL';
};
