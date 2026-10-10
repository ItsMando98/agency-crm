import nodemailer from 'nodemailer';

import { type AppEnv } from '~/lib/env.server';

type MailKind = 'LOGIN' | 'INVITE';

const BODIES: Record<MailKind, { subject: string; intro: string }> = {
  LOGIN: {
    subject: 'Dein Login-Link für Roaswell',
    intro: 'Mit diesem Link meldest du dich an. Er ist 15 Minuten gültig:',
  },
  INVITE: {
    subject: 'Dein Zugang zum Roaswell Kundenportal',
    intro: 'Du wurdest zum Kundenportal eingeladen. Dort siehst du deine Audits, Berichte und Creator. Der Link ist 7 Tage gültig:',
  },
};

export const createMailer = (env: AppEnv) => async ({
  to,
  link,
  kind = 'LOGIN',
}: {
  to: string;
  link: string;
  kind?: MailKind;
}) => {
  if (env.SMTP_HOST === undefined) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Mail is not configured. Set SMTP_HOST to send login links.');
    }

    // Development only: there is no mail server, so the link goes to the log.
    console.info(`[dev] Login link for ${to}: ${link}`);

    return;
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER === undefined
        ? undefined
        : { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? '' },
  });

  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: BODIES[kind].subject,
    text: `${BODIES[kind].intro}\n\n${link}\n\nWenn du das nicht erwartet hast, ignoriere diese E-Mail.`,
  });
};
