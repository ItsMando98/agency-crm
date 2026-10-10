import { type Principal } from '~/lib/auth/principal';
import { resolvePrincipalFromDirectory } from '~/lib/auth/resolve-principal';
import { createRateLimiter } from '~/lib/auth/rate-limit.server';
import { getEnv } from '~/lib/env.server';
import { createMailer } from '~/lib/server/mailer.server';
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

export const getServices = () => {
  const env = getEnv();

  return {
    env,
    twenty: buildTwentyClient(),
    sendMail: createMailer(env),
    isLoginAllowed: loginLimiter.isAllowed,
  };
};
