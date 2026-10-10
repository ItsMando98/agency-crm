import { useEffect, useState } from 'react';
import { Form, Link, data, useActionData, useNavigation, useRevalidator } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import {
  ASSET_STATUS_LABELS,
  ASSET_TYPE_LABELS,
  CREATOR_STATUS_LABELS,
  PLATFORM_LABELS,
  formatDate,
} from '~/lib/labels';
import { requirePrincipal, requireTeam } from '~/lib/server/require-principal.server';
import { getServices } from '~/lib/server/services.server';
import { estimateAssetCostUsd, formatUsd } from '~/lib/twenty/asset-cost';
import {
  ASSET_PLATFORMS,
  ASSET_TYPES,
  CREATOR_STATUSES,
  VIDEO_DURATIONS_SECONDS,
  type Asset,
  type AssetType,
} from '~/lib/twenty/creator-types';
import { getCreator, listCreatorAssets, requestAsset, updateCreator } from '~/lib/twenty/creators.server';

import type { Route } from './+types/creator-detail';

const POLL_INTERVAL_MS = 5000;
const PENDING_STATUSES = ['QUEUED', 'RUNNING'];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const principal = await requirePrincipal(request);
  const { twenty } = getServices();
  const creator = await getCreator(twenty, principal, params.creatorId);

  if (creator === null) {
    throw data('Profil nicht gefunden', { status: 404 });
  }

  return {
    creator,
    assets: await listCreatorAssets(twenty, principal, creator.id),
    canEdit: principal.kind === 'TEAM',
  };
};

type ActionResult = { ok: boolean; message?: string };

export const action = async ({ request, params }: Route.ActionArgs): Promise<ActionResult> => {
  const principal = await requireTeam(request);
  const { twenty } = getServices();
  const form = await request.formData();
  const text = (key: string) => String(form.get(key) ?? '').trim();

  if (text('intent') === 'save') {
    const status = CREATOR_STATUSES.find((candidate) => candidate === form.get('status'));
    const ok = await updateCreator(twenty, principal, params.creatorId, {
      name: text('name'),
      handle: text('handle'),
      persona: text('persona'),
      niche: text('niche'),
      tone: text('tone'),
      targetAudience: text('targetAudience'),
      appearancePrompt: text('appearancePrompt'),
      voiceName: text('voiceName'),
      rules: text('rules'),
      disclosureLabel: text('disclosureLabel'),
      language: form.get('language') === 'EN' ? 'EN' : 'DE',
      ...(status === undefined ? {} : { status }),
    });

    return ok ? { ok: true, message: 'Profil gespeichert.' } : { ok: false, message: 'Das Profil konnte nicht gespeichert werden.' };
  }

  const type = ASSET_TYPES.find((candidate) => candidate === form.get('type'));
  const platform = ASSET_PLATFORMS.find((candidate) => candidate === form.get('platform'));
  const duration = Number(form.get('durationSeconds'));

  if (type === undefined) {
    return { ok: false, message: 'Bitte wähle, was erzeugt werden soll.' };
  }

  if (type === 'VIDEO' && form.get('confirmCost') !== 'yes') {
    return { ok: false, message: 'Bitte bestätige die Kosten für das Video.' };
  }

  const result = await requestAsset(twenty, principal, params.creatorId, {
    type,
    prompt: text('prompt'),
    script: text('script'),
    platform,
    durationSeconds: Number.isFinite(duration) && duration > 0 ? duration : undefined,
  });

  if (result.status === 'QUEUED') {
    return { ok: true, message: 'Auftrag angelegt. Das Ergebnis erscheint unten, sobald es fertig ist.' };
  }

  return { ok: false, message: result.status === 'INVALID' ? result.message : 'Dafür fehlt dir die Berechtigung.' };
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-medium">
    {label}
    {children}
  </label>
);

const selectClass = 'h-9 rounded-md border border-border bg-card px-3 text-sm font-normal';

const AssetCard = ({ asset }: { asset: Asset }) => (
  <li className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
    <div className="flex items-center justify-between gap-2">
      <Badge tone="primary">{ASSET_TYPE_LABELS[asset.type]}</Badge>
      <Badge tone={asset.status === 'DONE' ? 'success' : asset.status === 'FAILED' ? 'danger' : 'warning'}>
        {ASSET_STATUS_LABELS[asset.status]}
      </Badge>
    </div>
    {asset.status === 'DONE' && asset.fileUrl !== null && asset.type === 'IMAGE' && (
      <img src={asset.fileUrl} alt={asset.prompt ?? 'Erzeugtes Bild'} className="aspect-[9/16] w-full rounded-md object-cover" />
    )}
    {asset.status === 'DONE' && asset.fileUrl !== null && asset.type === 'VIDEO' && (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video src={asset.fileUrl} controls className="aspect-[9/16] w-full rounded-md bg-muted" />
    )}
    {asset.status === 'DONE' && asset.fileUrl !== null && asset.type === 'VOICE' && (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio src={asset.fileUrl} controls className="w-full" />
    )}
    {asset.status === 'DONE' && asset.fileUrl === null && (
      <p className="text-sm text-muted-foreground">Die Datei liegt in Twenty am Datensatz.</p>
    )}
    {asset.status === 'FAILED' && <p role="alert" className="text-sm text-danger">{asset.failureReason ?? 'Die Erzeugung ist fehlgeschlagen.'}</p>}
    {(asset.prompt ?? asset.script) !== null && (
      <p className="line-clamp-2 text-sm text-muted-foreground">{asset.script ?? asset.prompt}</p>
    )}
    <p className="mt-auto flex justify-between text-xs text-muted-foreground">
      <span>{formatDate(asset.createdAt)}{asset.platform !== null && ` · ${PLATFORM_LABELS[asset.platform] ?? asset.platform}`}</span>
      <span className="tabular-nums">{formatUsd(asset.costUsd)}</span>
    </p>
  </li>
);

export default function CreatorDetail({ loaderData }: Route.ComponentProps) {
  const { creator, assets, canEdit } = loaderData;
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const [type, setType] = useState<AssetType>('IMAGE');
  const [duration, setDuration] = useState<number>(8);
  const isWorking = assets.some((asset) => PENDING_STATUSES.includes(asset.status));
  const estimate = estimateAssetCostUsd(type, duration);
  const isSubmitting = navigation.state === 'submitting';
  const totalCost = assets.reduce((sum, asset) => sum + (asset.costUsd ?? 0), 0);

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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/creators" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Alle Creator
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{creator.name ?? 'Ohne Namen'}</h1>
          <Badge tone={creator.status === 'ACTIVE' ? 'success' : 'neutral'}>{CREATOR_STATUS_LABELS[creator.status]}</Badge>
          <span className="text-sm text-muted-foreground">Bisher {formatUsd(totalCost)} für {assets.length} Assets</span>
        </div>
      </div>

      {result?.message !== undefined && (
        <p role={result.ok ? 'status' : 'alert'} className={result.ok ? 'text-sm text-success' : 'text-sm text-danger'}>
          {result.message}
        </p>
      )}

      {canEdit && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
            <CardContent>
              <Form method="post" className="grid gap-3">
                <input type="hidden" name="intent" value="save" />
                <Field label="Name"><Input name="name" defaultValue={creator.name ?? ''} required /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <select name="status" defaultValue={creator.status} className={selectClass}>
                      {CREATOR_STATUSES.map((status) => <option key={status} value={status}>{CREATOR_STATUS_LABELS[status]}</option>)}
                    </select>
                  </Field>
                  <Field label="Sprache">
                    <select name="language" defaultValue={creator.language} className={selectClass}>
                      <option value="DE">Deutsch</option>
                      <option value="EN">English</option>
                    </select>
                  </Field>
                </div>
                <Field label="Persona"><Input name="persona" defaultValue={creator.persona ?? ''} placeholder="Alter, Beruf, Charakter" /></Field>
                <Field label="Aussehen"><Input name="appearancePrompt" defaultValue={creator.appearancePrompt ?? ''} placeholder="Haare, Stil, Ausstrahlung" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Themenfeld"><Input name="niche" defaultValue={creator.niche ?? ''} /></Field>
                  <Field label="Stimme"><Input name="voiceName" defaultValue={creator.voiceName ?? ''} placeholder="Kore" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tonalität"><Input name="tone" defaultValue={creator.tone ?? ''} /></Field>
                  <Field label="Zielgruppe"><Input name="targetAudience" defaultValue={creator.targetAudience ?? ''} /></Field>
                </div>
                <Field label="Regeln"><Input name="rules" defaultValue={creator.rules ?? ''} placeholder="Was darf nie gesagt oder gezeigt werden" /></Field>
                <Field label="KI-Kennzeichnung"><Input name="disclosureLabel" defaultValue={creator.disclosureLabel ?? ''} /></Field>
                <Field label="Handle"><Input name="handle" defaultValue={creator.handle ?? ''} /></Field>
                <Button type="submit" disabled={isSubmitting} className="w-fit">Profil speichern</Button>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Neues Asset erzeugen</CardTitle></CardHeader>
            <CardContent>
              <Form method="post" className="grid gap-3">
                <input type="hidden" name="intent" value="generate" />
                <Field label="Was soll erzeugt werden?">
                  <select name="type" value={type} onChange={(event) => setType(event.target.value as AssetType)} className={selectClass}>
                    {ASSET_TYPES.map((option) => <option key={option} value={option}>{ASSET_TYPE_LABELS[option]}</option>)}
                  </select>
                </Field>
                <Field label={type === 'VOICE' ? 'Szene (optional)' : 'Szene'}>
                  <Input name="prompt" placeholder="Zum Beispiel: im Wohnzimmer mit Yogamatte, Morgenlicht" />
                </Field>
                {type !== 'IMAGE' && (
                  <Field label="Text, den sie spricht">
                    <Input name="script" placeholder="Hallo, das ist meine Morgenroutine." required={type === 'VOICE'} />
                  </Field>
                )}
                {type === 'VIDEO' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Länge">
                      <select name="durationSeconds" value={duration} onChange={(event) => setDuration(Number(event.target.value))} className={selectClass}>
                        {VIDEO_DURATIONS_SECONDS.map((seconds) => <option key={seconds} value={seconds}>{seconds} Sekunden</option>)}
                      </select>
                    </Field>
                    <Field label="Plattform">
                      <select name="platform" defaultValue="TIKTOK" className={selectClass}>
                        {ASSET_PLATFORMS.map((platform) => <option key={platform} value={platform}>{PLATFORM_LABELS[platform]}</option>)}
                      </select>
                    </Field>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Geschätzte Kosten: <strong className="text-foreground">{formatUsd(estimate)}</strong>
                  {type === 'VIDEO' && ' (mit Ton, 0,15 USD pro Sekunde)'}
                </p>
                {type === 'VIDEO' && (
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="confirmCost" value="yes" required className="mt-1" />
                    Ich bestätige die Kosten von bis zu {formatUsd(estimate)} für dieses Video.
                  </label>
                )}
                <Button type="submit" disabled={isSubmitting} className="w-fit">Erzeugen</Button>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      <section aria-label="Assets" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Assets</h2>
        {isWorking && <p role="status" className="text-sm text-muted-foreground">Es läuft eine Erzeugung. Diese Seite aktualisiert sich selbst.</p>}
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch kein Asset erzeugt.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
