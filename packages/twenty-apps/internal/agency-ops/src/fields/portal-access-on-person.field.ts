import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const PORTAL_ACCESS_FIELD_UNIVERSAL_IDENTIFIER =
  'eb072f18-03c0-4c45-ae3a-1f895c13daa0';

export default defineField({
  universalIdentifier: PORTAL_ACCESS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'portalAccess',
  label: 'Client portal access',
  description: 'Whether this contact may sign in to the client portal and see the audits and creators of their company',
  icon: 'IconKey',
  defaultValue: false,
});
