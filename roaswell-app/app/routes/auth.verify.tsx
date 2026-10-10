import { redirect } from 'react-router';

import { verifyToken } from '~/lib/auth/signed-token.server';
import { buildSessionCookie } from '~/lib/auth/session.server';
import { getEnv } from '~/lib/env.server';
import { resolvePrincipal } from '~/lib/server/services.server';

import type { Route } from './+types/auth.verify';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const env = getEnv();
  const token = new URL(request.url).searchParams.get('token') ?? '';
  const verified = verifyToken({ token, purpose: 'magic-link', secret: env.SESSION_SECRET });
  const principal = verified === null ? null : await resolvePrincipal(verified.subject);

  if (principal === null) {
    return redirect('/login?error=expired');
  }

  return redirect('/', {
    headers: {
      'set-cookie': buildSessionCookie({
        email: principal.email,
        secret: env.SESSION_SECRET,
        isSecure: env.NODE_ENV === 'production',
      }),
    },
  });
};
