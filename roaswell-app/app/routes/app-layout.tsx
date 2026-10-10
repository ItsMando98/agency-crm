import { Form, NavLink, Outlet } from 'react-router';
import { Building2, ClipboardList, Kanban, LayoutDashboard, LogOut, Sparkles, Users } from 'lucide-react';

import { cn } from '~/lib/cn';
import { requirePrincipal } from '~/lib/server/require-principal.server';

import type { Route } from './+types/app-layout';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);

  return { email: principal.email, role: principal.kind };
};

const NAV_ITEMS = [
  { to: '/', label: 'Übersicht', icon: LayoutDashboard, end: true, teamOnly: false },
  { to: '/audits', label: 'Audits', icon: ClipboardList, end: false, teamOnly: false },
  { to: '/creators', label: 'Creator', icon: Sparkles, end: false, teamOnly: false },
  { to: '/companies', label: 'Firmen', icon: Building2, end: false, teamOnly: true },
  { to: '/people', label: 'Kontakte', icon: Users, end: false, teamOnly: true },
  { to: '/pipeline', label: 'Pipeline', icon: Kanban, end: false, teamOnly: true },
] as const;

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col gap-6 border-b border-border bg-card p-4 md:border-b-0 md:border-r">
        <div className="px-2 text-lg font-semibold tracking-tight">Roaswell</div>
        <nav aria-label="Hauptnavigation" className="flex flex-row gap-1 md:flex-col">
          {NAV_ITEMS.filter((item) => !item.teamOnly || loaderData.role === 'TEAM').map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted',
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 border-t border-border pt-4 text-sm md:flex">
          <span className="truncate text-muted-foreground" title={loaderData.email}>{loaderData.email}</span>
          <Form method="post" action="/logout">
            <button type="submit" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" aria-hidden />
              Abmelden
            </button>
          </Form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
