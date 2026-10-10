import { Form, redirect, useActionData, useNavigation, useSearchParams } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { requestMagicLink } from '~/lib/auth/request-magic-link.server';
import { getPrincipal } from '~/lib/server/require-principal.server';
import { getServices, resolvePrincipal } from '~/lib/server/services.server';

import type { Route } from './+types/login';

export const loader = async ({ request }: Route.LoaderArgs) => {
  if ((await getPrincipal(request)) !== null) {
    throw redirect('/');
  }

  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { env, sendMail, isLoginAllowed } = getServices();

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
} as const;

export default function Login() {
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
          <p className="text-sm text-muted-foreground">
            Wir schicken dir einen Login-Link. Ein Passwort brauchst du nicht.
          </p>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-3">
            <label className="text-sm font-medium" htmlFor="email">E-Mail</label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="name@firma.de" />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gesendet' : 'Login-Link senden'}
            </Button>
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
