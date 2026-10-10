import { Form, Link, redirect, useActionData, useNavigation } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { CREATOR_STATUS_LABELS } from '~/lib/labels';
import { requirePrincipal, requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { createCreator, listCreators } from '~/lib/twenty/creators.server';

import type { Route } from './+types/creators';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);

  return {
    creators: await listCreators(getServices().twenty, principal),
    canCreate: principal.kind === 'TEAM',
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const principal = await requireTeam(request);
  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();

  if (text('name') === '') {
    return { error: 'Bitte gib dem Profil einen Namen.' };
  }

  const created = await createCreator(getServices().twenty, principal, {
    name: text('name'),
    niche: text('niche'),
    persona: text('persona'),
    appearancePrompt: text('appearancePrompt'),
    language: form.get('language') === 'EN' ? 'EN' : 'DE',
    disclosureLabel: 'Mit KI erstellt',
  });

  return created === null
    ? { error: 'Das Profil konnte nicht angelegt werden.' }
    : redirect(`/creators/${created.id}`);
};

export default function Creators({ loaderData }: Route.ComponentProps) {
  const { creators, canCreate } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSaving = navigation.state === 'submitting';

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Creator</h1>
      {canCreate && (
        <Card>
          <CardHeader><CardTitle>Profil anlegen</CardTitle></CardHeader>
          <CardContent>
            <Form method="post" className="grid gap-3 md:grid-cols-2">
              <Input name="name" aria-label="Name" placeholder="Name, zum Beispiel Mara" required />
              <Input name="niche" aria-label="Themenfeld" placeholder="Themenfeld, zum Beispiel Home Workouts" />
              <Input name="persona" aria-label="Persona" placeholder="Persona: Alter, Beruf, Charakter" className="md:col-span-2" />
              <Input name="appearancePrompt" aria-label="Aussehen" placeholder="Aussehen: Haare, Stil, Ausstrahlung" className="md:col-span-2" />
              <select name="language" aria-label="Sprache" defaultValue="DE" className="h-9 rounded-md border border-border bg-card px-3 text-sm">
                <option value="DE">Deutsch</option>
                <option value="EN">English</option>
              </select>
              <Button type="submit" disabled={isSaving} className="md:w-fit">{isSaving ? 'Wird angelegt' : 'Profil anlegen'}</Button>
            </Form>
            {result?.error !== undefined && <p role="alert" className="mt-3 text-sm text-danger">{result.error}</p>}
          </CardContent>
        </Card>
      )}
      {creators.length === 0 ? (
        <p className="text-sm text-muted-foreground">Noch kein Profil vorhanden.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <li key={creator.id}>
              <Link to={`/creators/${creator.id}`} className="block h-full rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg font-semibold">{creator.name ?? 'Ohne Namen'}</span>
                  <Badge tone={creator.status === 'ACTIVE' ? 'success' : 'neutral'}>{CREATOR_STATUS_LABELS[creator.status]}</Badge>
                </div>
                {creator.niche !== null && <p className="mt-1 text-sm text-muted-foreground">{creator.niche}</p>}
                {creator.persona !== null && <p className="mt-3 line-clamp-3 text-sm">{creator.persona}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
