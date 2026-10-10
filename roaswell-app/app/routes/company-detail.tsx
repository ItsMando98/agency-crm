import { Form, Link, data, useActionData, useFetcher, useNavigation } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { CRM_TASK_STATUS_LABELS, formatDate, formatHost, formatMoney, getScoreTone, STAGE_LABELS, STATUS_LABELS } from '~/lib/labels';
import { normalizeDomain } from '~/lib/normalize-domain';
import { requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { listAudits, startAudit } from '~/lib/twenty/audits.server';
import { CRM_TASK_STATUSES, type CrmTask } from '~/lib/twenty/crm-types';
import {
  createCompanyNote,
  createCompanyTask,
  createOpportunity,
  createPerson,
  getCompany,
  listCompanyNotes,
  listCompanyTasks,
  listOpportunities,
  listPeople,
  updateCrmTaskStatus,
} from '~/lib/twenty/crm.server';

import type { Route } from './+types/company-detail';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const company = await getCompany(twenty, principal, params.companyId);

  if (company === null) {
    throw data('Firma nicht gefunden', { status: 404 });
  }

  const [people, deals, notes, tasks, { audits }] = await Promise.all([
    listPeople(twenty, principal, { companyId: company.id }),
    listOpportunities(twenty, principal, { companyId: company.id }),
    listCompanyNotes(twenty, principal, company.id),
    listCompanyTasks(twenty, principal, company.id),
    listAudits(twenty, principal, { companyId: company.id, limit: 10 }),
  ]);

  return { company, people, deals, notes, tasks, audits };
};

type ActionResult = { ok: boolean; error?: string };

export const action = async ({ request, params }: Route.ActionArgs): Promise<ActionResult> => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();
  const intent = text('intent');
  const failed = (error: string): ActionResult => ({ ok: false, error });

  switch (intent) {
    case 'add-person': {
      if (text('firstName') === '') return failed('Bitte gib einen Vornamen ein.');
      const created = await createPerson(twenty, principal, {
        firstName: text('firstName'),
        lastName: text('lastName'),
        email: text('email'),
        jobTitle: text('jobTitle'),
        companyId: params.companyId,
      });

      return created === null ? failed('Der Kontakt konnte nicht angelegt werden.') : { ok: true };
    }
    case 'add-deal': {
      const rawAmount = text('amount').replace(',', '.');
      const amount = rawAmount === '' ? undefined : Number(rawAmount);

      if (text('name') === '') return failed('Bitte gib einen Namen für den Deal ein.');
      if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) return failed('Der Betrag ist keine gültige Zahl.');

      const created = await createOpportunity(twenty, principal, { name: text('name'), amount, companyId: params.companyId });

      return created === null ? failed('Der Deal konnte nicht angelegt werden.') : { ok: true };
    }
    case 'add-note': {
      if (text('title') === '') return failed('Bitte gib einen Titel ein.');
      const created = await createCompanyNote(twenty, principal, params.companyId, { title: text('title'), body: text('body') });

      return created === null ? failed('Die Notiz konnte nicht gespeichert werden.') : { ok: true };
    }
    case 'add-task': {
      if (text('title') === '') return failed('Bitte gib einen Titel ein.');
      const created = await createCompanyTask(twenty, principal, params.companyId, { title: text('title'), dueAt: text('dueAt') });

      return created === null ? failed('Die Aufgabe konnte nicht gespeichert werden.') : { ok: true };
    }
    case 'task-status': {
      const status = CRM_TASK_STATUSES.find((candidate) => candidate === form.get('status'));

      if (status === undefined) return failed('Unbekannter Status.');
      const ok = await updateCrmTaskStatus(twenty, principal, text('taskId'), status);

      return ok ? { ok: true } : failed('Der Status konnte nicht geändert werden.');
    }
    case 'start-audit': {
      const company = await getCompany(twenty, principal, params.companyId);
      const domain = normalizeDomain(company?.domain ?? '');

      if (company === null || domain === null) return failed('Die Firma hat keine gültige Website.');
      const created = await startAudit(twenty, principal, { domain, language: 'DE', companyId: company.id });

      return created === null ? failed('Der Audit konnte nicht gestartet werden.') : { ok: true };
    }
    default:
      return failed('Unbekannte Aktion.');
  }
};

const SmallForm = ({ intent, children, submitLabel }: { intent: string; children: React.ReactNode; submitLabel: string }) => {
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting' && navigation.formData?.get('intent') === intent;

  return (
    <Form method="post" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <input type="hidden" name="intent" value={intent} />
      {children}
      <Button type="submit" size="sm" disabled={isSaving} className="self-start">
        {isSaving ? 'Wird gespeichert' : submitLabel}
      </Button>
    </Form>
  );
};

const TaskItem = ({ task }: { task: CrmTask }) => {
  const fetcher = useFetcher();
  const pending = fetcher.formData?.get('status');

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block truncate font-medium">{task.title}</span>
        {task.dueAt !== null && <span className="text-xs text-muted-foreground">fällig {formatDate(task.dueAt)}</span>}
      </span>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="task-status" />
        <input type="hidden" name="taskId" value={task.id} />
        <select
          name="status"
          aria-label={`Status von ${task.title ?? 'Aufgabe'}`}
          value={typeof pending === 'string' ? pending : task.status}
          onChange={(event) => fetcher.submit(event.currentTarget.form)}
          className="h-8 rounded-md border border-border bg-card px-2 text-sm"
        >
          {CRM_TASK_STATUSES.map((status) => <option key={status} value={status}>{CRM_TASK_STATUS_LABELS[status]}</option>)}
        </select>
      </fetcher.Form>
    </li>
  );
};

export default function CompanyDetail({ loaderData }: Route.ComponentProps) {
  const { company, people, deals, notes, tasks, audits } = loaderData;
  const result = useActionData<typeof action>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/companies" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Alle Firmen
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{company.name ?? 'Ohne Namen'}</h1>
        <p className="text-sm text-muted-foreground">
          {[formatHost(company.domain), company.city, company.employees === null ? null : `${company.employees} Mitarbeitende`]
            .filter((part) => part !== null && part !== '')
            .join(' · ') || 'Keine weiteren Angaben'}
        </p>
      </div>

      {result?.ok === false && result.error !== undefined && (
        <p role="alert" className="rounded-md border border-danger px-3 py-2 text-sm text-danger">{result.error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Kontakte</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {people.length === 0 ? <p className="text-sm text-muted-foreground">Noch kein Kontakt.</p> : (
              <ul className="divide-y divide-border">
                {people.map((person) => (
                  <li key={person.id} className="py-2">
                    <span className="font-medium">{person.fullName}</span>
                    <span className="block text-xs text-muted-foreground">{[person.jobTitle, person.email].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            )}
            <SmallForm intent="add-person" submitLabel="Kontakt anlegen">
              <Input name="firstName" aria-label="Vorname" placeholder="Vorname" required className="sm:w-32" />
              <Input name="lastName" aria-label="Nachname" placeholder="Nachname" className="sm:w-32" />
              <Input name="email" type="email" aria-label="E-Mail" placeholder="E-Mail" className="sm:w-48" />
            </SmallForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Deals</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {deals.length === 0 ? <p className="text-sm text-muted-foreground">Noch kein Deal.</p> : (
              <ul className="divide-y divide-border">
                {deals.map((deal) => (
                  <li key={deal.id} className="flex items-center justify-between py-2">
                    <span className="font-medium">{deal.name}</span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      {formatMoney(deal.amount, deal.currency)}
                      <Badge tone={deal.stage === 'CUSTOMER' ? 'success' : 'primary'}>{STAGE_LABELS[deal.stage]}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <SmallForm intent="add-deal" submitLabel="Deal anlegen">
              <Input name="name" aria-label="Name des Deals" placeholder="Name des Deals" required className="sm:w-48" />
              <Input name="amount" aria-label="Betrag in Euro" placeholder="Betrag in EUR" inputMode="decimal" className="sm:w-32" />
            </SmallForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notizen</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notes.length === 0 ? <p className="text-sm text-muted-foreground">Noch keine Notiz.</p> : (
              <ul className="divide-y divide-border">
                {notes.map((note) => (
                  <li key={note.id} className="py-2">
                    <span className="font-medium">{note.title}</span>
                    {note.body !== null && <p className="whitespace-pre-line text-sm text-muted-foreground">{note.body}</p>}
                  </li>
                ))}
              </ul>
            )}
            <SmallForm intent="add-note" submitLabel="Notiz speichern">
              <Input name="title" aria-label="Titel" placeholder="Titel" required className="sm:w-48" />
              <Input name="body" aria-label="Text" placeholder="Text" className="sm:flex-1" />
            </SmallForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aufgaben</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">Noch keine Aufgabe.</p> : (
              <ul className="divide-y divide-border">
                {tasks.map((task) => <TaskItem key={task.id} task={task} />)}
              </ul>
            )}
            <SmallForm intent="add-task" submitLabel="Aufgabe anlegen">
              <Input name="title" aria-label="Titel" placeholder="Titel" required className="sm:w-48" />
              <Input name="dueAt" type="date" aria-label="Fällig am" className="sm:w-40" />
            </SmallForm>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Audits</CardTitle>
          {company.domain !== null && (
            <Form method="post">
              <input type="hidden" name="intent" value="start-audit" />
              <Button type="submit" size="sm" variant="outline">Audit für {formatHost(company.domain)} starten</Button>
            </Form>
          )}
        </CardHeader>
        <CardContent>
          {audits.length === 0 ? <p className="text-sm text-muted-foreground">Noch kein Audit für diese Firma.</p> : (
            <ul className="divide-y divide-border">
              {audits.map((audit) => (
                <li key={audit.id}>
                  <Link to={`/audits/${audit.id}`} className="flex items-center justify-between py-3 hover:text-primary">
                    <span>{formatDate(audit.createdAt)}</span>
                    {audit.status === 'DONE' && audit.score !== null
                      ? <Badge tone={getScoreTone(audit.score)}>{audit.score} {audit.grade ?? ''}</Badge>
                      : <Badge tone={audit.status === 'FAILED' ? 'danger' : 'primary'}>{STATUS_LABELS[audit.status]}</Badge>}
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
