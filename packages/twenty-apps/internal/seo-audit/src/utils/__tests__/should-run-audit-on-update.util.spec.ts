import { describe, expect, it } from 'vitest';

import { shouldRunAuditOnUpdate } from 'src/utils/should-run-audit-on-update.util';

describe('shouldRunAuditOnUpdate', () => {
  it('runs when a website is added to a queued record', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: '', status: 'QUEUED' },
        { domain: 'https://example.com', status: 'QUEUED' },
      ),
    ).toBe(true);
  });

  it('runs when a website is added to a failed record', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: '', status: 'FAILED' },
        { domain: 'https://example.com', status: 'FAILED' },
      ),
    ).toBe(true);
  });

  it('runs when status is set back to queued and a website is present', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: 'https://example.com', status: 'FAILED' },
        { domain: 'https://example.com', status: 'QUEUED' },
      ),
    ).toBe(true);
  });

  it('does not run when the audit marks itself running or failed', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: 'https://example.com', status: 'QUEUED' },
        { domain: 'https://example.com', status: 'RUNNING' },
      ),
    ).toBe(false);
    expect(
      shouldRunAuditOnUpdate(
        { domain: 'https://example.com', status: 'RUNNING' },
        { domain: 'https://example.com', status: 'FAILED' },
      ),
    ).toBe(false);
  });

  it('does not rerun a finished audit when only the website changes', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: 'https://old.example', status: 'DONE' },
        { domain: 'https://new.example', status: 'DONE' },
      ),
    ).toBe(false);
  });

  it('does not run when the website is still empty', () => {
    expect(
      shouldRunAuditOnUpdate(
        { domain: '', status: 'QUEUED' },
        { domain: '   ', status: 'QUEUED' },
      ),
    ).toBe(false);
  });
});
