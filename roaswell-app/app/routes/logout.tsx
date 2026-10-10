import { redirect } from 'react-router';

import { buildLogoutCookie } from '~/lib/auth/session.server';
import { getEnv } from '~/lib/env.server';

import type { Route } from './+types/logout';

export const action = async (_args: Route.ActionArgs) =>
  redirect('/login', {
    headers: { 'set-cookie': buildLogoutCookie(getEnv().NODE_ENV === 'production') },
  });

export const loader = () => redirect('/');
