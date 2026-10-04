import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER = 'e07c0181-8b4f-412e-b8cc-1a7142213298';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Agency Ops',
  description:
    'Task queue and human approval gates for AI agents running a web and advertising agency',
});
