import { defineApplicationRole, SystemPermissionFlag } from 'twenty-sdk/define';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER = '23fc22a6-e6a7-4ecf-82a1-641b1d83bd98';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'SEO Audit default function role',
  description: 'Role the SEO Audit logic functions run as',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  // The Setup page runs as this role and calls findOneApplication, which requires the Applications setting.
  // The audit run uploads the Excel and PDF exports to the audit record, which requires the upload permission.
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.APPLICATIONS,
    SystemPermissionFlag.UPLOAD_FILE,
  ],
});
