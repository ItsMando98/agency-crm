import { Form, redirect, useActionData, useLoaderData, useNavigation, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { authenticateWithPassword } from '~/lib/auth/authenticate-with-password.server';
import { requestMagicLink } from '~/lib/auth/request-magic-link.server';
import { buildSessionCookie } from '~/lib/auth/session.server';
import { getEnv } from '~/lib/env.server';
import { getPrincipal } from '~/lib/server/require-principal.server';
import { getServices, resolveMailConfig, resolvePrincipal } from '~/lib/server/services.server';

import type { Route } from './+types/login';

export const loader = async ({ request }: Route.LoaderArgs) => {
  if ((await getPrincipal(request)) !== null) {
    throw redirect('/');
  }

  const env = getEnv();

  return {
    hasPassword: env.TEAM_PASSWORD_HASH !== undefined,
    hasMail: (await resolveMailConfig()) !== null || env.NODE_ENV !== 'production',
  };
};

const getIpAddress = (request: Request): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const ipAddress = getIpAddress(request);
  const { env, sendMail, isLoginAllowed } = getServices();

  if (form.get('intent') === 'password') {
    const result = await authenticateWithPassword(
      { email, password: String(form.get('password') ?? ''), ipAddress },
      {
        teamEmails: env.TEAM_EMAILS,
        passwordHash: env.TEAM_PASSWORD_HASH,
        isAllowed: (key) => isLoginAllowed(key),
      },
    );

    if (result.status === 'OK') {
      return redirect('/', {
        headers: {
          'set-cookie': buildSessionCookie({
            email: result.email,
            secret: env.SESSION_SECRET,
            isSecure: env.NODE_ENV === 'production',
          }),
        },
      });
    }

    return { status: result.status };
  }

  try {
    return await requestMagicLink(
      { email, ipAddress },
      {
        resolvePrincipal,
        sendMail,
        isAllowed: (key) => isLoginAllowed(key),
        secret: env.SESSION_SECRET,
        appUrl: env.APP_URL,
      },
    );
  } catch (error) {
    console.error('Magic link could not be sent', error);

    return { status: 'MAIL_FAILED' as const };
  }
};

const MESSAGES = {
  SENT_OR_IGNORED: 'Wenn die Adresse freigeschaltet ist, kommt in Kürze ein Login-Link per E-Mail.',
  INVALID_EMAIL: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  RATE_LIMITED: 'Zu viele Versuche. Bitte warte ein paar Minuten.',
  MAIL_FAILED: 'Die E-Mail konnte nicht versendet werden. Bitte melde dich beim Team.',
  INVALID_CREDENTIALS: 'E-Mail oder Passwort stimmen nicht.',
  NOT_AVAILABLE: 'Die Anmeldung mit Passwort ist nicht eingerichtet.',
} as const;

export default function Login() {
  const { hasPassword, hasMail } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const [params] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  const isError = result !== undefined && result.status !== 'SENT_OR_IGNORED';

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Anmelden</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="email">E-Mail</label>
            <Input id="email" name="email" type="email" autoComplete="username" required placeholder="name@firma.de" />
            {hasPassword && (
              <>
                <label className="text-sm font-medium" htmlFor="password">Passwort</label>
                <Input id="password" name="password" type="password" autoComplete="current-password" />
                <Button type="submit" name="intent" value="password" disabled={isSubmitting}>
                  {isSubmitting ? 'Wird geprüft' : 'Anmelden'}
                </Button>
              </>
            )}
            {hasMail && (
              <Button
                type="submit"
                name="intent"
                value="link"
                variant={hasPassword ? 'outline' : 'primary'}
                disabled={isSubmitting}
              >
                Login-Link per E-Mail senden
              </Button>
            )}
          </Form>
          {params.get('error') === 'expired' && result === undefined && (
            <p role="alert" className="mt-4 text-sm text-danger">
              Der Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an.
            </p>
          )}
          {result !== undefined && (
            <p role={isError ? 'alert' : 'status'} className={isError ? 'mt-4 text-sm text-danger' : 'mt-4 text-sm text-muted-foreground'}>
              {MESSAGES[result.status]}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
