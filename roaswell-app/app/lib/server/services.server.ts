import { type Principal } from '~/lib/auth/principal';
import { resolvePrincipalFromDirectory } from '~/lib/auth/resolve-principal';
import { createRateLimiter } from '~/lib/auth/rate-limit.server';
import { getEnv } from '~/lib/env.server';
import { createMailer } from '~/lib/server/mailer.server';
import { createMailSettingsStore, type MailConfig } from '~/lib/settings/mail-settings.server';
import { findPortalContact } from '~/lib/twenty/portal.server';
import { createTwentyClient } from '~/lib/twenty/twenty-client.server';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginLimiter = createRateLimiter({
  maxAttempts: LOGIN_MAX_ATTEMPTS,
  windowMs: LOGIN_WINDOW_MS,
});

const buildTwentyClient = () => {
  const env = getEnv();

  return createTwentyClient({ baseUrl: env.TWENTY_API_URL, apiKey: env.TWENTY_API_KEY });
};

// Team members come from the allow list, clients from contacts with portal access.
export const resolvePrincipal = (email: string): Promise<Principal | null> =>
  resolvePrincipalFromDirectory(email, {
    teamEmails: getEnv().TEAM_EMAILS,
    findPortalContact: (candidate) => findPortalContact(buildTwentyClient(), candidate),
  });

const buildMailSettingsStore = () => {
  const env = getEnv();

  return createMailSettingsStore({ directory: env.SETTINGS_DIR, secret: env.SESSION_SECRET });
};

// Settings saved on the settings page win. The server variables are the fallback.
export const resolveMailConfig = async (): Promise<MailConfig | null> => {
  const stored = await buildMailSettingsStore().readConfig();

  if (stored !== null) {
    return stored;
  }

  const env = getEnv();

  return env.SMTP_HOST === undefined || env.SMTP_USER === undefined
    ? null
    : {
        from: env.MAIL_FROM,
        transport: {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          user: env.SMTP_USER,
          password: env.SMTP_PASSWORD ?? '',
        },
      };
};

export const getServices = () => {
  const env = getEnv();

  return {
    env,
    twenty: buildTwentyClient(),
    mailSettings: buildMailSettingsStore(),
    sendMail: createMailer({
      resolveConfig: resolveMailConfig,
      isProduction: env.NODE_ENV === 'production',
    }),
    isLoginAllowed: loginLimiter.isAllowed,
  };
};
