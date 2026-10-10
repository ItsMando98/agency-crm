import nodemailer from 'nodemailer';

import { type MailConfig } from '~/lib/settings/mail-settings.server';

export type MailKind = 'LOGIN' | 'INVITE' | 'TEST';

type Envelope = { to: string; subject: string; text: string };

type TransportFactory = typeof nodemailer.createTransport;

const BODIES: Record<MailKind, { subject: string; intro: string }> = {
  LOGIN: {
    subject: 'Dein Login-Link für Roaswell',
    intro: 'Mit diesem Link meldest du dich an. Er ist 15 Minuten gültig:',
  },
  INVITE: {
    subject: 'Dein Zugang zum Roaswell Kundenportal',
    intro: 'Du wurdest zum Kundenportal eingeladen. Dort siehst du deine Audits, Berichte und Creator. Der Link ist 7 Tage gültig:',
  },
  TEST: {
    subject: 'Testmail von Roaswell',
    intro: 'Der E-Mail-Versand ist eingerichtet. Diese Nachricht war nur ein Test:',
  },
};

export const buildEnvelope = ({ to, link, kind }: { to: string; link: string; kind: MailKind }): Envelope => ({
  to,
  subject: BODIES[kind].subject,
  text: `${BODIES[kind].intro}\n\n${link}\n\nWenn du das nicht erwartet hast, ignoriere diese E-Mail.`,
});

export const deliverMail = async (
  config: MailConfig,
  envelope: Envelope,
  createTransport: TransportFactory = nodemailer.createTransport,
): Promise<void> => {
  const transport = createTransport({
    host: config.transport.host,
    port: config.transport.port,
    secure: config.transport.secure,
    auth: { user: config.transport.user, pass: config.transport.password },
  });

  await transport.sendMail({ from: config.from, ...envelope });
};

type MailerDeps = {
  resolveConfig: () => Promise<MailConfig | null>;
  isProduction: boolean;
  createTransport?: TransportFactory;
};

// The configuration is read on every send, so a change on the settings page
// applies without a restart.
export const createMailer =
  ({ resolveConfig, isProduction, createTransport }: MailerDeps) =>
  async ({ to, link, kind = 'LOGIN' }: { to: string; link: string; kind?: MailKind }): Promise<void> => {
    const config = await resolveConfig();

    if (config === null) {
      if (isProduction) {
        throw new Error('Mail is not configured. Set it up under Einstellungen.');
      }

      // Development only: there is no mail server, so the link goes to the log.
      console.info(`[dev] Login link for ${to}: ${link}`);

      return;
    }

    await deliverMail(config, buildEnvelope({ to, link, kind }), createTransport);
  };
