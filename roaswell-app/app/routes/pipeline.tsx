import { Form, Link, useActionData, useFetcher, useNavigation } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { formatMoney, STAGE_LABELS } from '~/lib/labels';
import { requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { OPPORTUNITY_STAGES, type Opportunity } from '~/lib/twenty/crm-types';
import { createOpportunity, listCompanies, listOpportunities, moveOpportunity } from '~/lib/twenty/crm.server';

import type { Route } from './+types/pipeline';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const [opportunities, { companies }] = await Promise.all([
    listOpportunities(twenty, principal),
    listCompanies(twenty, principal),
  ]);

  return {
    opportunities,
    companies: companies.map((company) => ({ id: company.id, name: company.name ?? 'Ohne Namen' })),
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const form = await request.formData();

  if (form.get('intent') === 'move') {
    const stage = OPPORTUNITY_STAGES.find((candidate) => candidate === form.get('stage'));

    if (stage === undefined) {
      return { ok: false, error: 'Unbekannte Phase.' };
    }

    const ok = await moveOpportunity(twenty, principal, String(form.get('id') ?? ''), stage);

    return { ok, error: ok ? undefined : 'Der Deal konnte nicht verschoben werden.' };
  }

  const name = String(form.get('name') ?? '').trim();
  const companyId = String(form.get('companyId') ?? '');
  const rawAmount = String(form.get('amount') ?? '').replace(',', '.').trim();
  const amount = rawAmount === '' ? undefined : Number(rawAmount);

  if (name === '') {
    return { ok: false, error: 'Bitte gib einen Namen für den Deal ein.' };
  }

  if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
    return { ok: false, error: 'Der Betrag ist keine gültige Zahl.' };
  }

  const created = await createOpportunity(twenty, principal, {
    name,
    amount,
    companyId: companyId === '' ? undefined : companyId,
  });

  return { ok: created !== null, error: created === null ? 'Der Deal konnte nicht angelegt werden.' : undefined };
};

const DealCard = ({ deal, companyName }: { deal: Opportunity; companyName: string | null }) => {
  const fetcher = useFetcher();
  const pending = fetcher.formData?.get('stage');

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 shadow-sm">
      <span className="font-medium">{deal.name ?? 'Ohne Namen'}</span>
      <span className="flex items-center justify-between text-xs text-muted-foreground">
        {deal.companyId !== null && companyName !== null ? (
          <Link to={`/companies/${deal.companyId}`} className="truncate hover:text-primary">{companyName}</Link>
        ) : <span>-</span>}
        <span className="tabular-nums">{formatMoney(deal.amount, deal.currency)}</span>
      </span>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="move" />
        <input type="hidden" name="id" value={deal.id} />
        <select
          name="stage"
          aria-label={`Phase von ${deal.name ?? 'Deal'}`}
          value={typeof pending === 'string' ? pending : deal.stage}
          onChange={(event) => fetcher.submit(event.currentTarget.form)}
          className="h-8 w-full rounded-md border border-border bg-card px-2 text-sm"
        >
          {OPPORTUNITY_STAGES.map((stage) => (
            <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>
          ))}
        </select>
      </fetcher.Form>
    </li>
  );
};

export default function Pipeline({ loaderData }: Route.ComponentProps) {
  const { opportunities, companies } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting' && navigation.formData?.get('intent') !== 'move';
  const companyNameById = Object.fromEntries(companies.map((company) => [company.id, company.name]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
      <Card>
        <CardHeader><CardTitle>Deal anlegen</CardTitle></CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-3 sm:flex-row">
            <Input name="name" aria-label="Name des Deals" placeholder="Name des Deals" required />
            <select name="companyId" aria-label="Firma" className="h-9 rounded-md border border-border bg-card px-3 text-sm" defaultValue="">
              <option value="">Ohne Firma</option>
              {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
            </select>
            <Input name="amount" aria-label="Betrag in Euro" placeholder="Betrag in EUR" inputMode="decimal" className="sm:w-40" />
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Wird angelegt' : 'Anlegen'}</Button>
          </Form>
          {result?.error !== undefined && <p role="alert" className="mt-3 text-sm text-danger">{result.error}</p>}
        </CardContent>
      </Card>
      <div className="grid gap-4 overflow-x-auto md:grid-cols-5">
        {OPPORTUNITY_STAGES.map((stage) => {
          const deals = opportunities.filter((deal) => deal.stage === stage);
          const sum = deals.reduce((total, deal) => total + (deal.amount ?? 0), 0);

          return (
            <section key={stage} aria-label={STAGE_LABELS[stage]} className="flex min-w-48 flex-col gap-3 rounded-lg bg-muted/60 p-3">
              <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h2>
                <Badge>{deals.length}</Badge>
              </header>
              <p className="text-xs tabular-nums text-muted-foreground">{formatMoney(sum, 'EUR')}</p>
              <ul className="flex flex-col gap-2">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} companyName={deal.companyId === null ? null : (companyNameById[deal.companyId] ?? null)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
