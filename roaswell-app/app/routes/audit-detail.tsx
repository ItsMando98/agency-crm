import { useEffect } from 'react';
import { Link, data, useFetcher, useRevalidator } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import { AreaBars } from '~/components/area-bars';
import { ScoreRing } from '~/components/score-ring';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { compareAudits } from '~/lib/compare-audits';
import {
  ENGINE_LABELS,
  formatDate,
  formatHost,
  getAreaLabel,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUS_LABELS,
} from '~/lib/labels';
import { requirePrincipal, requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { TASK_STATUSES, type AuditTask, type TaskStatus } from '~/lib/twenty/audit-types';
import {
  getAudit,
  getPreviousAudit,
  listAuditKeywords,
  listAuditTasks,
  updateTaskStatus,
} from '~/lib/twenty/audits.server';

import type { Route } from './+types/audit-detail';

const POLL_INTERVAL_MS = 5000;

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);
  const { twenty } = getServices();
  const audit = await getAudit(twenty, principal, params.auditId);

  if (audit === null) {
    throw data('Audit nicht gefunden', { status: 404 });
  }

  const [tasks, keywords, previous] = await Promise.all([
    listAuditTasks(twenty, principal, audit.id),
    listAuditKeywords(twenty, principal, audit.id),
    audit.status === 'DONE' ? getPreviousAudit(twenty, principal, audit) : Promise.resolve(null),
  ]);

  return {
    audit,
    tasks,
    keywords,
    comparison: previous === null ? null : compareAudits(audit, previous),
    previousDate: previous?.createdAt ?? null,
    canEdit: principal.kind === 'TEAM',
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const principal = await requireTeam(request);
  const form = await request.formData();
  const taskId = String(form.get('taskId') ?? '');
  const status = TASK_STATUSES.find((candidate) => candidate === form.get('status'));

  if (taskId === '' || status === undefined) {
    return data({ ok: false }, { status: 400 });
  }

  return { ok: await updateTaskStatus(getServices().twenty, principal, taskId, status) };
};

const AUTO_REFRESH_STATUSES = ['QUEUED', 'RUNNING'];

const TaskRow = ({ task, canEdit }: { task: AuditTask; canEdit: boolean }) => {
  const fetcher = useFetcher();
  const pending = fetcher.formData?.get('status');
  const status = (typeof pending === 'string' ? pending : task.status) as TaskStatus;

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{task.name}</span>
        <span className="flex items-center gap-2">
          <Badge tone={task.priority === 'CRITICAL' || task.priority === 'HIGH' ? 'danger' : 'neutral'}>
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.area !== null && <Badge>{getAreaLabel(task.area)}</Badge>}
          {canEdit ? (
            <fetcher.Form method="post">
              <input type="hidden" name="taskId" value={task.id} />
              <select
                name="status"
                aria-label={`Status von ${task.name ?? 'Aufgabe'}`}
                value={status}
                onChange={(event) => fetcher.submit(event.currentTarget.form)}
                className="h-8 rounded-md border border-border bg-card px-2 text-sm"
              >
                {TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>{TASK_STATUS_LABELS[option]}</option>
                ))}
              </select>
            </fetcher.Form>
          ) : (
            <Badge tone="primary">{TASK_STATUS_LABELS[task.status]}</Badge>
          )}
        </span>
      </div>
      {task.description !== null && <p className="text-sm text-muted-foreground">{task.description}</p>}
      {task.affectedUrls.length > 0 && (
        <ul className="text-xs text-muted-foreground">
          {task.affectedUrls.slice(0, 3).map((url) => (
            <li key={url} className="truncate">{url}</li>
          ))}
          {task.affectedUrls.length > 3 && <li>und {task.affectedUrls.length - 3} weitere</li>}
        </ul>
      )}
    </li>
  );
};

const RESULT_TONE = { CITED: 'success', MENTIONED: 'warning', ABSENT: 'neutral', UNKNOWN: 'neutral' } as const;
const RESULT_LABEL = { CITED: 'Zitiert', MENTIONED: 'Genannt', ABSENT: 'Nicht genannt', UNKNOWN: 'Unklar' } as const;

export default function AuditDetail({ loaderData }: Route.ComponentProps) {
  const { audit, tasks, keywords, comparison, previousDate, canEdit } = loaderData;
  const revalidator = useRevalidator();
  const isWorking = AUTO_REFRESH_STATUSES.includes(audit.status);

  useEffect(() => {
    if (!isWorking) {
      return undefined;
    }

    const timer = setInterval(() => {
      if (revalidator.state === 'idle') {
        revalidator.revalidate();
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isWorking, revalidator]);

  const openTasks = tasks.filter((task) => task.status === 'OPEN' || task.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((task) => task.status === 'DONE' || task.status === 'WONT_FIX');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/audits" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Alle Audits
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{formatHost(audit.domain)}</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(audit.createdAt)}
              {audit.pagesCrawled !== null && ` · ${audit.pagesCrawled} Seiten geprüft`}
            </p>
          </div>
          {audit.reportUrl !== null && (
            <Button asChild variant="outline">
              <a href={audit.reportUrl} target="_blank" rel="noreferrer">
                Bericht öffnen <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          )}
        </div>
      </div>

      {isWorking && (
        <Card role="status">
          <CardContent className="pt-5">
            <p className="font-medium">{STATUS_LABELS[audit.status]}</p>
            <p className="text-sm text-muted-foreground">
              Der Audit dauert meist 5 bis 10 Minuten. Diese Seite aktualisiert sich selbst.
            </p>
          </CardContent>
        </Card>
      )}

      {audit.status === 'FAILED' && (
        <Card role="alert" className="border-danger">
          <CardContent className="pt-5">
            <p className="font-medium text-danger">Der Audit ist fehlgeschlagen.</p>
            {audit.failureReason !== null && <p className="text-sm text-muted-foreground">{audit.failureReason}</p>}
          </CardContent>
        </Card>
      )}

      {audit.status === 'DONE' && (
        <>
          <section className="grid gap-4 md:grid-cols-[auto_1fr]" aria-label="Ergebnis">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 pt-5">
                <ScoreRing score={audit.score} grade={audit.grade} />
                {comparison?.scoreDelta !== null && comparison !== null && (
                  <p className="text-sm text-muted-foreground">
                    {comparison.scoreDelta === 0
                      ? 'Unverändert'
                      : `${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta}`}{' '}
                    seit {formatDate(previousDate)}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Bereiche</CardTitle></CardHeader>
              <CardContent><AreaBars areaScores={audit.areaScores} /></CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Aufgaben</CardTitle>
              <p className="text-sm text-muted-foreground">
                {openTasks.length} offen, {doneTasks.length} erledigt oder verworfen
              </p>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Aufgaben.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {[...openTasks, ...doneTasks].map((task) => (
                    <TaskRow key={task.id} task={task} canEdit={canEdit} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {audit.aiVisibility !== null && audit.aiVisibility.rows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>KI-Sichtbarkeit</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {audit.aiVisibility.queriesTested} Fragen getestet
                  {audit.aiVisibility.presenceRate !== null && `, Präsenz ${Math.round(audit.aiVisibility.presenceRate * 100)} %`}
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Frage</th>
                      {audit.aiVisibility.engines.map((engine) => (
                        <th key={engine} className="pb-2 font-medium">{ENGINE_LABELS[engine] ?? engine}</th>
                      ))}
                      <th className="pb-2 font-medium">Stattdessen genannt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {audit.aiVisibility.rows.map((row) => (
                      <tr key={row.query}>
                        <td className="max-w-xs py-3 pr-3">{row.query}</td>
                        {audit.aiVisibility?.engines.map((engine) => {
                          const result = row.results[engine] ?? 'UNKNOWN';

                          return (
                            <td key={engine} className="py-3 pr-3">
                              <Badge tone={RESULT_TONE[result]}>{RESULT_LABEL[result]}</Badge>
                            </td>
                          );
                        })}
                        <td className="py-3 text-muted-foreground">{row.instead.join(', ') || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {audit.aiVisibility.notes.length > 0 && (
                  <ul className="mt-3 text-xs text-muted-foreground">
                    {audit.aiVisibility.notes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {keywords.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Keywords</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Keyword</th>
                      <th className="pb-2 text-right font-medium">Position</th>
                      <th className="pb-2 text-right font-medium">Suchvolumen</th>
                      <th className="pb-2 pl-4 font-medium">Einstufung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {keywords.map((keyword) => (
                      <tr key={keyword.id}>
                        <td className="py-2">{keyword.keyword}</td>
                        <td className="py-2 text-right tabular-nums">{keyword.rankPosition ?? '-'}</td>
                        <td className="py-2 text-right tabular-nums">{keyword.searchVolume ?? '-'}</td>
                        <td className="py-2 pl-4"><Badge>{keyword.category ?? '-'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
