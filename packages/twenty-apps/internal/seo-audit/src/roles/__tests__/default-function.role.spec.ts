import { SystemPermissionFlag } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import defaultFunctionRole from 'src/roles/default-function.role';

describe('default function role', () => {
  it('may upload the Excel and PDF exports to the audit record', () => {
    expect(defaultFunctionRole.config.permissionFlagUniversalIdentifiers).toContain(
      SystemPermissionFlag.UPLOAD_FILE,
    );
  });

  it('keeps the applications permission the Setup page needs', () => {
    expect(defaultFunctionRole.config.permissionFlagUniversalIdentifiers).toContain(
      SystemPermissionFlag.APPLICATIONS,
    );
  });
});
