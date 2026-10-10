import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier.const';
import {
  TREG_ORG_VARIABLE_KEY,
  TREG_TOKEN_VARIABLE_KEY,
} from 'src/constants/application-variable-keys.const';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Creator Studio',
  description:
    'AI UGC creator profiles with generated pictures, voices and short videos, produced through treg.',
  applicationVariables: {
    [TREG_TOKEN_VARIABLE_KEY]: {
      universalIdentifier: '8d4b2066-7f3d-4159-b82b-12763189d355',
      label: 'treg token',
      description:
        'Generates the pictures, voices and videos through treg.to. Create an agent token at treg.to.',
      isSecret: true,
    },
    [TREG_ORG_VARIABLE_KEY]: {
      universalIdentifier: '2e01b0dc-6142-42e2-b8cb-5234179d7882',
      label: 'treg team',
      description:
        'The team slug in treg. Only needed for tokens created with the treg login, not for agent tokens.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
  },
});
