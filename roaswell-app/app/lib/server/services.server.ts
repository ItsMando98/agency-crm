import { type Principal } from '~/lib/auth/principal';
import { createRateLimiter } from '~/lib/auth/rate-limit.server';
import { getEnv } from '~/lib/env.server';
import { createMailer } from '~/lib/server/mailer.server';
import { createTwentyClient } from '~/lib/twenty/twenty-client.server';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginLimiter = createRateLimiter({
  maxAttempts: LOGIN_MAX_ATTEMPTS,
  windowMs: LOGIN_WINDOW_MS,
});

// Team members come from the allow list. Client logins arrive with the portal
// milestone and resolve to a person with portal access and a company.
export const resolvePrincipal = async (email: string): Promise<Principal | null> => {
  const normalized = email.trim().toLowerCase();

  return getEnv().TEAM_EMAILS.includes(normalized) ? { kind: 'TEAM', email: normalized } : null;
};

export const getServices = () => {
  const env = getEnv();

  return {
    env,
    twenty: createTwentyClient({ baseUrl: env.TWENTY_API_URL, apiKey: env.TWENTY_API_KEY }),
    sendMail: createMailer(env),
    isLoginAllowed: loginLimiter.isAllowed,
  };
};
