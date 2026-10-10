import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import { decryptSecret, encryptSecret } from '~/lib/settings/secret-box.server';

const SETTINGS_FILE = 'settings.json';
const RESEND_HOST = 'smtp.resend.com';
const RESEND_PORT = 465;
const RESEND_USER = 'resend';
const MAX_PORT = 65_535;
const SMTPS_PORT = 465;
const FILE_MODE = 0o600;

const FROM_PATTERN = /^(?:[^<>\r\n]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/;
const HOST_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

export type MailTransportConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};

export type MailConfig = { from: string; transport: MailTransportConfig };

export type MailSettingsInput =
  | { provider: 'RESEND'; from: string; apiKey: string }
  | { provider: 'SMTP'; from: string; host: string; port: number; user: string; password: string };

// The secret may stay empty on save, which keeps the stored one.
export type SaveMailInput =
  | { provider: 'RESEND'; from: string; apiKey?: string }
  | { provider: 'SMTP'; from: string; host: string; port: number; user: string; password?: string };

// What the settings page may see. Secrets never leave the server.
export type MailSettingsView = {
  provider: 'RESEND' | 'SMTP';
  from: string;
  host: string | null;
  port: number | null;
  user: string | null;
  hasSecret: boolean;
  isReadable: boolean;
};

const storedSchema = z.object({
  version: z.literal(1),
  mail: z
    .object({
      provider: z.enum(['RESEND', 'SMTP']),
      from: z.string(),
      host: z.string().nullable().default(null),
      port: z.number().nullable().default(null),
      user: z.string().nullable().default(null),
      secret: z.string(),
    })
    .nullable(),
});

type StoredMail = NonNullable<z.infer<typeof storedSchema>['mail']>;

export type ValidationResult = { ok: true } | { ok: false; message: string };

export const validateMailInput = (input: MailSettingsInput): ValidationResult => {
  if (!FROM_PATTERN.test(input.from.trim())) {
    return { ok: false, message: 'Bitte gib den Absender als name@firma.de oder Name <name@firma.de> an.' };
  }

  if (input.provider === 'RESEND') {
    return input.apiKey.trim() === ''
      ? { ok: false, message: 'Bitte gib den Resend-API-Key ein.' }
      : { ok: true };
  }

  if (!HOST_PATTERN.test(input.host.trim())) {
    return { ok: false, message: 'Der SMTP-Host ist keine gültige Adresse.' };
  }

  if (!Number.isInteger(input.port) || input.port < 1 || input.port > MAX_PORT) {
    return { ok: false, message: 'Der Port muss zwischen 1 und 65535 liegen.' };
  }

  return input.user.trim() === '' || input.password === ''
    ? { ok: false, message: 'Bitte gib Benutzer und Passwort des SMTP-Servers ein.' }
    : { ok: true };
};

export const toMailConfig = (stored: StoredMail, secret: string): MailConfig | null => {
  const password = decryptSecret(stored.secret, secret);

  if (password === null) {
    return null;
  }

  if (stored.provider === 'RESEND') {
    return {
      from: stored.from,
      transport: { host: RESEND_HOST, port: RESEND_PORT, secure: true, user: RESEND_USER, password },
    };
  }

  if (stored.host === null || stored.port === null || stored.user === null) {
    return null;
  }

  return {
    from: stored.from,
    transport: {
      host: stored.host,
      port: stored.port,
      secure: stored.port === SMTPS_PORT,
      user: stored.user,
      password,
    },
  };
};

export const createMailSettingsStore = ({
  directory,
  secret,
}: {
  directory: string;
  secret: string;
}) => {
  const filePath = path.join(directory, SETTINGS_FILE);

  const readStored = async (): Promise<StoredMail | null> => {
    try {
      const parsed = storedSchema.safeParse(JSON.parse(await readFile(filePath, 'utf8')));

      return parsed.success ? parsed.data.mail : null;
    } catch {
      return null;
    }
  };

  const write = async (mail: StoredMail | null): Promise<void> => {
    await mkdir(directory, { recursive: true });

    const temporaryPath = `${filePath}.${process.pid}.tmp`;

    await writeFile(temporaryPath, JSON.stringify({ version: 1, mail }), { mode: FILE_MODE });
    await rename(temporaryPath, filePath);
  };

  return {
    readConfig: async (): Promise<MailConfig | null> => {
      const stored = await readStored();

      return stored === null ? null : toMailConfig(stored, secret);
    },

    readView: async (): Promise<MailSettingsView | null> => {
      const stored = await readStored();

      return stored === null
        ? null
        : {
            provider: stored.provider,
            from: stored.from,
            host: stored.host,
            port: stored.port,
            user: stored.user,
            hasSecret: true,
            isReadable: toMailConfig(stored, secret) !== null,
          };
    },

    // An empty secret keeps the stored one, so the page never needs to show it.
    save: async (input: SaveMailInput): Promise<ValidationResult> => {
      const existing = await readStored();
      const kept = existing !== null && existing.provider === input.provider ? existing : null;
      const keptSecret = kept === null ? null : decryptSecret(kept.secret, secret);
      const typedSecret = input.provider === 'RESEND' ? input.apiKey ?? '' : input.password ?? '';
      const effectiveSecret = typedSecret !== '' ? typedSecret : (keptSecret ?? '');
      const candidate: MailSettingsInput =
        input.provider === 'RESEND'
          ? { provider: 'RESEND', from: input.from, apiKey: effectiveSecret }
          : { provider: 'SMTP', from: input.from, host: input.host, port: input.port, user: input.user, password: effectiveSecret };
      const validation = validateMailInput(candidate);

      if (!validation.ok) {
        return validation;
      }

      await write({
        provider: candidate.provider,
        from: candidate.from.trim(),
        host: candidate.provider === 'SMTP' ? candidate.host.trim() : null,
        port: candidate.provider === 'SMTP' ? candidate.port : null,
        user: candidate.provider === 'SMTP' ? candidate.user.trim() : null,
        secret: encryptSecret(effectiveSecret, secret),
      });

      return { ok: true };
    },

    clear: (): Promise<void> => write(null),
  };
};

export type MailSettingsStore = ReturnType<typeof createMailSettingsStore>;
