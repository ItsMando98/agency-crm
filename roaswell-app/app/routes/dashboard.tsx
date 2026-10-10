import { Link } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { formatDate, formatHost, getScoreTone, STATUS_LABELS } from '~/lib/labels';
import { requirePrincipal } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { countOpenTasks, listAudits } from '~/lib/twenty/audits.server';

import type { Route } from './+types/dashboard';

const DASHBOARD_AUDIT_LIMIT = 50;
const RECENT_COUNT = 5;
const DAYS_IN_PERIOD = 30;
const MILLISECONDS_PER_DAY = 86_400_000;

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);
  const { twenty } = getServices();
  const [{ audits }, openTasks] = await Promise.all([
    listAudits(twenty, principal, { limit: DASHBOARD_AUDIT_LIMIT }),
    countOpenTasks(twenty, principal),
  ]);
  const since = Date.now() - DAYS_IN_PERIOD * MILLISECONDS_PER_DAY;
  const recentPeriod = audits.filter((audit) => audit.createdAt !== null && new Date(audit.createdAt).getTime() >= since);
  const scored = audits.filter((audit) => audit.status === 'DONE' && audit.score !== null);
  const averageScore =
    scored.length === 0
      ? null
      : Math.round(scored.reduce((sum, audit) => sum + (audit.score ?? 0), 0) / scored.length);

  return {
    auditsInPeriod: recentPeriod.length,
    averageScore,
    openTasks,
    recent: audits.slice(0, RECENT_COUNT),
  };
};

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <Card>
    <CardHeader>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
    </CardHeader>
  </Card>
);

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { auditsInPeriod, averageScore, openTasks, recent } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Übersicht</h1>
        <Button asChild>
          <Link to="/audits">Neuen Audit starten</Link>
        </Button>
      </header>
      <section aria-label="Kennzahlen" className="grid gap-4 sm:grid-cols-3">
        <Kpi label={`Audits in ${DAYS_IN_PERIOD} Tagen`} value={String(auditsInPeriod)} />
        <Kpi label="Durchschnittlicher Score" value={averageScore === null ? '-' : String(averageScore)} />
        <Kpi label="Offene Aufgaben" value={openTasks === null ? '-' : String(openTasks)} />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Letzte Audits</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch kein Audit. Starte den ersten über den Button oben.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((audit) => (
                <li key={audit.id}>
                  <Link to={`/audits/${audit.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-primary">
                    <span className="min-w-0 truncate font-medium">{formatHost(audit.domain)}</span>
                    <span className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                      {formatDate(audit.createdAt)}
                      {audit.status === 'DONE' && audit.score !== null ? (
                        <Badge tone={getScoreTone(audit.score)}>{audit.score}</Badge>
                      ) : (
                        <Badge tone={audit.status === 'FAILED' ? 'danger' : 'primary'}>{STATUS_LABELS[audit.status]}</Badge>
                      )}
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
