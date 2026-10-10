import { useEffect } from 'react';
import { Link, data, useFetcher, useRevalidator } from 'react-router';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import { AreaBars } from '~/components/area-bars';
import { ScoreRing } from '~/components/score-ring';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { compareAudits } from '~/lib/compare-audits';
import { buildReportLink } from '~/lib/build-report-link';
import { describeStrength } from '~/lib/describe-strength';
import { getEnv } from '~/lib/env.server';
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
import { TASK_STATUSES, type AuditPage, type AuditTask, type SummaryItem, type TaskStatus } from '~/lib/twenty/audit-types';
import {
  getAudit,
  getPreviousAudit,
  listAuditKeywords,
  listAuditPages,
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

  const [tasks, keywords, pages, previous] = await Promise.all([
    listAuditTasks(twenty, principal, audit.id),
    listAuditKeywords(twenty, principal, audit.id),
    listAuditPages(twenty, principal, audit.id),
    audit.status === 'DONE' ? getPreviousAudit(twenty, principal, audit) : Promise.resolve(null),
  ]);

  return {
    audit,
    tasks,
    keywords,
    pages,
    reportLink: buildReportLink({
      publicBaseUrl: getEnv().TWENTY_PUBLIC_URL,
      auditId: audit.id,
      shareToken: audit.shareToken,
    }),
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

const pageScore = (page: AuditPage): number =>
  (page.helpfulness ?? 0) + (page.specificity ?? 0) + (page.trust ?? 0);

const sortWeakest = (pages: AuditPage[]): AuditPage[] =>
  [...pages].sort(
    (first, second) =>
      pageScore(first) - pageScore(second) ||
      Number(second.needsReview) - Number(first.needsReview) ||
      (first.url ?? '').localeCompare(second.url ?? ''),
  );

const HEAT_CLASS: Record<number, string> = {
  1: 'bg-danger/25',
  2: 'bg-warning/30',
  3: 'bg-warning/15',
  4: 'bg-success/15',
  5: 'bg-success/30',
};

const MAX_HEATMAP_ROWS = 25;

const SummaryList = ({ title, items }: { title: string; items: SummaryItem[] }) =>
  items.length === 0 ? null : (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.text}>
            {item.text}
            {item.unverifiedNumbers.length > 0 && (
              <span className="ml-1 text-xs text-danger">(nicht belegt: {item.unverifiedNumbers.join(', ')})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

const RESULT_TONE = { CITED: 'success', MENTIONED: 'warning', ABSENT: 'neutral', UNKNOWN: 'neutral' } as const;
const RESULT_LABEL = { CITED: 'Zitiert', MENTIONED: 'Genannt', ABSENT: 'Nicht genannt', UNKNOWN: 'Unklar' } as const;

export default function AuditDetail({ loaderData }: Route.ComponentProps) {
  const { audit, tasks, keywords, pages, reportLink, comparison, previousDate, canEdit } = loaderData;
  const insights = audit.insights;
  const weakestPages = sortWeakest(pages);
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
          {reportLink !== null && (
            <Button asChild variant="outline">
              <a href={reportLink} target="_blank" rel="noreferrer">
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
          {insights?.summary != null && (
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
                <p className="text-base font-medium">
                  {insights.summary.headline.text}
                  {insights.summary.headline.unverifiedNumbers.length > 0 && (
                    <span className="ml-1 text-xs font-normal text-danger">
                      (nicht belegt: {insights.summary.headline.unverifiedNumbers.join(', ')})
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <SummaryList title="Was gut läuft" items={insights.summary.strengths} />
                <SummaryList title="Was bremst" items={insights.summary.blockers} />
                <SummaryList title="Diese Woche" items={insights.summary.thisWeek} />
                <SummaryList title="Diesen Monat" items={insights.summary.thisMonth} />
                <SummaryList title="Dieses Quartal" items={insights.summary.thisQuarter} />
                <p className="text-xs text-muted-foreground md:col-span-2">
                  Geschrieben von {insights.summary.model}.{' '}
                  {insights.summary.isFullyVerified
                    ? 'Jede Zahl wurde mit den Messwerten des Audits abgeglichen.'
                    : 'Zahlen, die der Audit nicht belegt, sind markiert.'}
                </p>
              </CardContent>
            </Card>
          )}

          <section className="grid gap-4 md:grid-cols-[auto_1fr]" aria-label="Ergebnis">
            <Card>
              <CardContent className="flex flex-col items-center gap-3 pt-5">
                <ScoreRing score={audit.score} grade={audit.grade} />
                {insights?.rulesOnlyScore != null && insights.rulesOnlyScore !== audit.score && (
                  <p className="max-w-[10rem] text-center text-xs text-muted-foreground">
                    Nur mit den gemessenen Regeln: {insights.rulesOnlyScore}. Die Inhaltsbewertung senkt oder hebt den Wert auf {audit.score}.
                  </p>
                )}
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

          {insights !== null && insights.strengths.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Was schon funktioniert</CardTitle></CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  {insights.strengths.map((strength) => (
                    <li key={describeStrength(strength)}>{describeStrength(strength)}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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

          {weakestPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Seiten im Detail</CardTitle>
                <p className="text-sm text-muted-foreground">
                  1 ist schwach, 5 ist stark. Bei Unsicherheit steht "bitte prüfen".
                  {insights?.confidence.sharePercent != null &&
                    ` ${insights.confidence.definitive} von ${insights.confidence.total} Bewertungen (${insights.confidence.sharePercent} %) waren eindeutig.`}
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Seite</th>
                      <th className="pb-2 text-center font-medium">Hilfreich</th>
                      <th className="pb-2 text-center font-medium">Konkret</th>
                      <th className="pb-2 text-center font-medium">Vertrauen</th>
                      <th className="pb-2 pl-3 font-medium">Sicherheit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {weakestPages.slice(0, MAX_HEATMAP_ROWS).map((page) => (
                      <tr key={page.id}>
                        <td className="max-w-sm truncate py-2 pr-3" title={page.url ?? ''}>{page.url}</td>
                        {[page.helpfulness, page.specificity, page.trust].map((value, index) => (
                          <td key={index} className={`py-2 text-center tabular-nums ${HEAT_CLASS[value ?? 0] ?? ''}`}>{value ?? '-'}</td>
                        ))}
                        <td className="py-2 pl-3">
                          {page.needsReview ? <Badge tone="danger">bitte prüfen</Badge> : <span className="text-muted-foreground">eindeutig</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {weakestPages.length > MAX_HEATMAP_ROWS && (
                  <p className="mt-2 text-xs text-muted-foreground">und {weakestPages.length - MAX_HEATMAP_ROWS} weitere Seiten</p>
                )}
              </CardContent>
            </Card>
          )}

          {insights !== null && insights.competingPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Seiten, die um dasselbe Thema konkurrieren</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                {insights.competingPages.map((group) => (
                  <div key={group.topic}>
                    <strong>{group.topic}</strong>
                    <ul className="text-muted-foreground">
                      {group.urls.map((url) => <li key={url} className="truncate">{url}</li>)}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {insights !== null && insights.missingLocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orte mit Suchvolumen, aber ohne eigene Seite</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border text-sm">
                  {insights.missingLocations.map((location) => (
                    <li key={location.place} className="flex items-center justify-between gap-3 py-2">
                      <span>
                        <strong>{location.place}</strong>
                        <span className="ml-2 text-muted-foreground">{location.keywords.join(', ')}</span>
                      </span>
                      <span className="tabular-nums">{new Intl.NumberFormat('de-DE').format(location.searchVolume)} Suchen im Monat</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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
