import { Link } from 'react-router';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { listCompanies, listPeople } from '~/lib/twenty/crm.server';

import type { Route } from './+types/people';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const [people, { companies }] = await Promise.all([
    listPeople(twenty, principal),
    listCompanies(twenty, principal),
  ]);
  const companyNameById = Object.fromEntries(companies.map((company) => [company.id, company.name ?? '']));

  return {
    people: people.map((person) => ({
      ...person,
      companyName: person.companyId === null ? null : (companyNameById[person.companyId] ?? null),
    })),
  };
};

export default function People({ loaderData }: Route.ComponentProps) {
  const { people } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Kontakte</h1>
      <Card>
        <CardHeader><CardTitle>{people.length} Kontakte</CardTitle></CardHeader>
        <CardContent>
          {people.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch kein Kontakt. Lege Kontakte auf der Firmenseite an.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Firma</th>
                  <th className="pb-2 font-medium">E-Mail</th>
                  <th className="pb-2 font-medium">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {people.map((person) => (
                  <tr key={person.id}>
                    <td className="py-3 font-medium">{person.fullName}</td>
                    <td className="py-3">
                      {person.companyId !== null && person.companyName !== null ? (
                        <Link to={`/companies/${person.companyId}`} className="hover:text-primary">{person.companyName}</Link>
                      ) : '-'}
                    </td>
                    <td className="py-3 text-muted-foreground">{person.email ?? '-'}</td>
                    <td className="py-3 text-muted-foreground">{person.jobTitle ?? '-'}</td>
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
