import { describe, expect, it } from 'vitest';

import { buildInvitationLink } from '~/lib/auth/build-invitation-link';
import { verifyToken } from '~/lib/auth/signed-token.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';
const NOW = new Date('2026-10-10T10:00:00Z');

describe('buildInvitationLink', () => {
  it('builds a link whose token works for seven days', () => {
    const link = buildInvitationLink({ email: ' Kunde@Firma.de ', secret: SECRET, appUrl: 'https://app.roaswell.com/', now: NOW });
    const token = new URL(link).searchParams.get('token') ?? '';
    const sixDaysLater = new Date(NOW.getTime() + 6 * 86_400_000);
    const eightDaysLater = new Date(NOW.getTime() + 8 * 86_400_000);

    expect(link.startsWith('https://app.roaswell.com/auth/verify?token=')).toBe(true);
    expect(verifyToken({ token, purpose: 'magic-link', secret: SECRET, now: sixDaysLater })).toEqual({ subject: 'kunde@firma.de' });
    expect(verifyToken({ token, purpose: 'magic-link', secret: SECRET, now: eightDaysLater })).toBeNull();
  });
});
