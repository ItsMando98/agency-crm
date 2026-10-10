import { useState } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { deliverMail, buildEnvelope } from '~/lib/server/mailer.server';
import { requireTeam } from '~/lib/server/require-principal.server';
import { getServices, resolveMailConfig } from '~/lib/server/services.server';

import type { Route } from './+types/settings';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireTeam(request);
  const { mailSettings } = getServices();
  const view = await mailSettings.readView();
  const active = await resolveMailConfig();

  return {
    view,
    isConfigured: active !== null,
    source: view !== null && view.isReadable ? ('APP' as const) : active !== null ? ('SERVER' as const) : null,
  };
};

type ActionResult = { ok: boolean; message: string };

export const action = async ({ request }: Route.ActionArgs): Promise<ActionResult> => {
  const principal = await requireTeam(request);
  const { mailSettings, env } = getServices();
  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();
  const intent = text('intent');

  if (intent === 'clear') {
    await mailSettings.clear();

    return { ok: true, message: 'Die gespeicherten Mail-Einstellungen wurden entfernt.' };
  }

  if (intent === 'test') {
    const config = await resolveMailConfig();

    if (config === null) {
      return { ok: false, message: 'Es ist noch kein E-Mail-Versand eingerichtet.' };
    }

    try {
      await deliverMail(
        config,
        buildEnvelope({ to: principal.email, link: `${env.APP_URL}/login`, kind: 'TEST' }),
      );
    } catch (error) {
      return {
        ok: false,
        message: `Die Testmail konnte nicht gesendet werden: ${error instanceof Error ? error.message : 'unbekannter Fehler'}`,
      };
    }

    return { ok: true, message: `Testmail an ${principal.email} gesendet. Prüfe dein Postfach, auch den Spam-Ordner.` };
  }

  const provider = text('provider') === 'SMTP' ? 'SMTP' : 'RESEND';
  const result =
    provider === 'RESEND'
      ? await mailSettings.save({ provider, from: text('from'), apiKey: String(form.get('apiKey') ?? '') })
      : await mailSettings.save({
          provider,
          from: text('from'),
          host: text('host'),
          port: Number(text('port') || 587),
          user: text('user'),
          password: String(form.get('password') ?? ''),
        });

  return result.ok
    ? { ok: true, message: 'Gespeichert. Sende jetzt eine Testmail, um es zu prüfen.' }
    : { ok: false, message: result.message };
};

const fieldClass = 'flex flex-col gap-1 text-sm font-medium';

export default function Settings({ loaderData }: Route.ComponentProps) {
  const { view, isConfigured, source } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const [provider, setProvider] = useState<'RESEND' | 'SMTP'>(view?.provider ?? 'RESEND');
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>

      {result !== undefined && (
        <p
          role={result.ok ? 'status' : 'alert'}
          className={result.ok ? 'rounded-md border border-success px-3 py-2 text-sm text-success' : 'rounded-md border border-danger px-3 py-2 text-sm text-danger'}
        >
          {result.message}
        </p>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>E-Mail-Versand</CardTitle>
          {isConfigured ? (
            <Badge tone="success">{source === 'APP' ? 'Eingerichtet' : 'Aus der Server-Konfiguration'}</Badge>
          ) : (
            <Badge tone="warning">Nicht eingerichtet</Badge>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Wird für Login-Links und die Einladung von Kunden ins Portal gebraucht. Als Team meldest du dich auch mit Passwort an.
          </p>
          {view !== null && !view.isReadable && (
            <p role="alert" className="text-sm text-danger">
              Die gespeicherten Zugangsdaten sind nicht mehr lesbar, weil sich das Session-Secret geändert hat. Gib den Key bitte neu ein.
            </p>
          )}
          <Form method="post" className="grid gap-4">
            <fieldset className="flex gap-4 text-sm">
              <legend className="mb-2 font-medium">Anbieter</legend>
              <label className="flex items-center gap-2">
                <input type="radio" name="provider" value="RESEND" checked={provider === 'RESEND'} onChange={() => setProvider('RESEND')} />
                Resend
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="provider" value="SMTP" checked={provider === 'SMTP'} onChange={() => setProvider('SMTP')} />
                Eigener SMTP-Server
              </label>
            </fieldset>

            <label className={fieldClass}>
              Absender
              <Input name="from" defaultValue={view?.from ?? ''} placeholder="Roaswell <no-reply@roaswell.com>" required />
              {provider === 'RESEND' && (
                <span className="text-xs font-normal text-muted-foreground">
                  Die Domain des Absenders muss in Resend verifiziert sein.
                </span>
              )}
            </label>

            {provider === 'RESEND' ? (
              <label className={fieldClass}>
                Resend-API-Key
                <Input
                  name="apiKey"
                  type="password"
                  autoComplete="off"
                  placeholder={view?.provider === 'RESEND' && view.hasSecret ? 'Gespeichert. Leer lassen, um ihn zu behalten.' : 're_...'}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  In Resend unter API Keys einen Key mit Sende-Recht anlegen.
                </span>
              </label>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={fieldClass}>
                  SMTP-Host
                  <Input name="host" defaultValue={view?.host ?? ''} placeholder="smtp.beispiel.de" />
                </label>
                <label className={fieldClass}>
                  Port
                  <Input name="port" inputMode="numeric" defaultValue={view?.port ?? 587} />
                </label>
                <label className={fieldClass}>
                  Benutzer
                  <Input name="user" autoComplete="off" defaultValue={view?.user ?? ''} />
                </label>
                <label className={fieldClass}>
                  Passwort
                  <Input
                    name="password"
                    type="password"
                    autoComplete="off"
                    placeholder={view?.provider === 'SMTP' && view.hasSecret ? 'Gespeichert. Leer lassen, um es zu behalten.' : ''}
                  />
                </label>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" name="intent" value="save" disabled={isSubmitting}>Speichern</Button>
              <Button type="submit" name="intent" value="test" variant="outline" disabled={isSubmitting || !isConfigured} formNoValidate>
                Testmail an mich senden
              </Button>
              {view !== null && (
                <Button type="submit" name="intent" value="clear" variant="ghost" disabled={isSubmitting} formNoValidate>
                  Einstellungen entfernen
                </Button>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
