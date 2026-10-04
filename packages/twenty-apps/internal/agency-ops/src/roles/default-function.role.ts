import { defineApplicationRole } from 'twenty-sdk/define';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER = '9449bb1f-f7f0-4d90-b9ab-cba8a981dfd8';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Agency Ops default function role',
  description: 'Role the Agency Ops logic functions run as',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
});
