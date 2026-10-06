export type SetupStep = {
  id: 'ANTHROPIC_KEY' | 'DATAFORSEO' | 'DEFAULTS' | 'PDF_EXPORT' | 'FIRST_AUDIT';
  status: 'DONE' | 'TODO' | 'OPTIONAL';
};
