import { Form, Link, redirect, useActionData, useNavigation } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { formatDate, formatHost, getScoreTone, STATUS_LABELS } from '~/lib/labels';
import { normalizeDomain } from '~/lib/normalize-domain';
import { requirePrincipal, requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { listAudits, startAudit } from '~/lib/twenty/audits.server';

import type { Route } from './+types/audits';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);
  const search = new URL(request.url).searchParams.get('q') ?? '';
  const { audits, totalCount } = await listAudits(getServices().twenty, principal, {
    domainContains: search,
  });

  return { audits, totalCount, search, canStart: principal.kind === 'TEAM' };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const principal = await requireTeam(request);
  const form = await request.formData();
  const domain = normalizeDomain(String(form.get('domain') ?? ''));
  const language = form.get('language') === 'EN' ? 'EN' : 'DE';

  if (domain === null) {
    return { error: 'Bitte gib eine öffentliche Website ein, zum Beispiel firma.de.' };
  }

  const created = await startAudit(getServices().twenty, principal, { domain, language });

  if (created === null) {
    return { error: 'Der Audit konnte nicht gestartet werden. Bitte versuche es erneut.' };
  }

  return redirect(`/audits/${created.id}`);
};

export default function Audits({ loaderData }: Route.ComponentProps) {
  const { audits, totalCount, search, canStart } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const isStarting = navigation.state === 'submitting' && navigation.formMethod === 'POST';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Audits</h1>
      {canStart && (
        <Card>
          <CardHeader>
            <CardTitle>Neuen Audit starten</CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className="flex flex-col gap-3 sm:flex-row">
              <Input name="domain" aria-label="Website" placeholder="firma.de" required />
              <select
                name="language"
                aria-label="Sprache des Berichts"
                className="h-9 rounded-md border border-border bg-card px-3 text-sm"
                defaultValue="DE"
              >
                <option value="DE">Deutsch</option>
                <option value="EN">English</option>
              </select>
              <Button type="submit" disabled={isStarting}>
                {isStarting ? 'Wird gestartet' : 'Audit starten'}
              </Button>
            </Form>
            {result?.error !== undefined && (
              <p role="alert" className="mt-3 text-sm text-danger">{result.error}</p>
            )}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{totalCount} Audits</CardTitle>
          <Form method="get" role="search">
            <Input name="q" defaultValue={search} aria-label="Domain suchen" placeholder="Domain suchen" className="w-56" />
          </Form>
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search === '' ? 'Noch kein Audit vorhanden.' : 'Kein Audit passt zur Suche.'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Website</th>
                  <th className="pb-2 font-medium">Datum</th>
                  <th className="pb-2 font-medium">Seiten</th>
                  <th className="pb-2 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-muted/50">
                    <td className="py-3 font-medium">
                      <Link to={`/audits/${audit.id}`} className="hover:text-primary">{formatHost(audit.domain)}</Link>
                    </td>
                    <td className="py-3 text-muted-foreground">{formatDate(audit.createdAt)}</td>
                    <td className="py-3 tabular-nums text-muted-foreground">{audit.pagesCrawled ?? '-'}</td>
                    <td className="py-3 text-right">
                      {audit.status === 'DONE' && audit.score !== null ? (
                        <Badge tone={getScoreTone(audit.score)}>{audit.score} {audit.grade ?? ''}</Badge>
                      ) : (
                        <Badge tone={audit.status === 'FAILED' ? 'danger' : 'primary'}>{STATUS_LABELS[audit.status]}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
