import { describe, expect, it, vi } from 'vitest';

import { buildEnvelope, createMailer, deliverMail } from '~/lib/server/mailer.server';
import { type MailConfig } from '~/lib/settings/mail-settings.server';

const config: MailConfig = {
  from: 'Roaswell <no-reply@roaswell.com>',
  transport: { host: 'smtp.resend.com', port: 465, secure: true, user: 'resend', password: 're_key' },
};

const fakeTransport = () => {
  const sendMail = vi.fn(async () => undefined);
  const createTransport = vi.fn(() => ({ sendMail })) as never;

  return { sendMail, createTransport };
};

describe('mailer', () => {
  it('sends through the configured transport with the sender', async () => {
    const { sendMail, createTransport } = fakeTransport();

    await createMailer({ resolveConfig: async () => config, isProduction: true, createTransport })({
      to: 'kunde@firma.de',
      link: 'https://app.roaswell.com/auth/verify?token=x',
      kind: 'INVITE',
    });

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: { user: 'resend', pass: 're_key' },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Roaswell <no-reply@roaswell.com>',
        to: 'kunde@firma.de',
        subject: 'Dein Zugang zum Roaswell Kundenportal',
      }),
    );
  });

  it('fails in production when no mail is configured', async () => {
    await expect(
      createMailer({ resolveConfig: async () => null, isProduction: true })({ to: 'a@b.de', link: 'x' }),
    ).rejects.toThrow(/Einstellungen/);
  });

  it('only logs the link outside production', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    await createMailer({ resolveConfig: async () => null, isProduction: false })({ to: 'a@b.de', link: 'https://x/y' });

    expect(info).toHaveBeenCalledWith(expect.stringContaining('https://x/y'));
    info.mockRestore();
  });

  it('builds a test mail and passes the provider error on', async () => {
    const failing = vi.fn(() => ({
      sendMail: vi.fn(async () => {
        throw new Error('The roaswell.com domain is not verified');
      }),
    })) as never;

    expect(buildEnvelope({ to: 'a@b.de', link: 'https://x', kind: 'TEST' }).subject).toBe('Testmail von Roaswell');
    await expect(
      deliverMail(config, buildEnvelope({ to: 'a@b.de', link: 'https://x', kind: 'TEST' }), failing),
    ).rejects.toThrow('not verified');
  });
});
