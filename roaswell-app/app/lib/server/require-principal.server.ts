import { redirect } from 'react-router';

import { type Principal } from '~/lib/auth/principal';
import { readPrincipal } from '~/lib/auth/session.server';
import { getEnv } from '~/lib/env.server';
import { resolvePrincipal } from '~/lib/server/services.server';

export const getPrincipal = (request: Request): Promise<Principal | null> =>
  readPrincipal({
    cookieHeader: request.headers.get('cookie'),
    secret: getEnv().SESSION_SECRET,
    resolvePrincipal,
  });

export const requirePrincipal = async (request: Request): Promise<Principal> => {
  const principal = await getPrincipal(request);

  if (principal === null) {
    throw redirect('/login');
  }

  return principal;
};

export const requireTeam = async (request: Request): Promise<Principal> => {
  const principal = await requirePrincipal(request);

  if (principal.kind !== 'TEAM') {
    throw new Response('Forbidden', { status: 403 });
  }

  return principal;
};
