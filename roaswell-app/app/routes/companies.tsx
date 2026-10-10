import { Form, Link, redirect, useActionData, useNavigation } from 'react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { formatHost } from '~/lib/labels';
import { normalizeDomain } from '~/lib/normalize-domain';
import { requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { createCompany, listCompanies } from '~/lib/twenty/crm.server';

import type { Route } from './+types/companies';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requireTeam(request);
  const search = new URL(request.url).searchParams.get('q') ?? '';
  const { companies, totalCount } = await listCompanies(getServices().twenty, principal, { search });

  return { companies, totalCount, search };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const principal = await requireTeam(request);
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const rawDomain = String(form.get('domain') ?? '').trim();
  const domain = rawDomain === '' ? undefined : normalizeDomain(rawDomain);

  if (name === '') {
    return { error: 'Bitte gib einen Firmennamen ein.' };
  }

  if (rawDomain !== '' && domain === null) {
    return { error: 'Die Website ist keine gültige Adresse.' };
  }

  const created = await createCompany(getServices().twenty, principal, {
    name,
    domain: domain ?? undefined,
  });

  return created === null
    ? { error: 'Die Firma konnte nicht angelegt werden.' }
    : redirect(`/companies/${created.id}`);
};

export default function Companies({ loaderData }: Route.ComponentProps) {
  const { companies, totalCount, search } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting' && navigation.formMethod === 'POST';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Firmen</h1>
      <Card>
        <CardHeader><CardTitle>Firma anlegen</CardTitle></CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-3 sm:flex-row">
            <Input name="name" aria-label="Firmenname" placeholder="Firmenname" required />
            <Input name="domain" aria-label="Website" placeholder="firma.de (optional)" />
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Wird angelegt' : 'Anlegen'}</Button>
          </Form>
          {result?.error !== undefined && <p role="alert" className="mt-3 text-sm text-danger">{result.error}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{totalCount} Firmen</CardTitle>
          <Form method="get" role="search">
            <Input name="q" defaultValue={search} aria-label="Firma suchen" placeholder="Firma suchen" className="w-56" />
          </Form>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {search === '' ? 'Noch keine Firma. Lege die erste oben an.' : 'Keine Firma passt zur Suche.'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {companies.map((company) => (
                <li key={company.id}>
                  <Link to={`/companies/${company.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-primary">
                    <span className="min-w-0 truncate font-medium">{company.name ?? 'Ohne Namen'}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {[company.city, formatHost(company.domain)].filter((part) => part !== null && part !== '').join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
