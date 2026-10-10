import nodemailer from 'nodemailer';

import { type AppEnv } from '~/lib/env.server';

export const createMailer = (env: AppEnv) => async ({ to, link }: { to: string; link: string }) => {
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
    subject: 'Dein Login-Link für Roaswell',
    text: `Mit diesem Link meldest du dich an. Er ist 15 Minuten gültig:\n\n${link}\n\nWenn du ihn nicht angefordert hast, ignoriere diese E-Mail.`,
  });
};
