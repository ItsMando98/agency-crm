import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createMailSettingsStore, validateMailInput } from '~/lib/settings/mail-settings.server';

const SECRET = 'a-secret-that-is-long-enough-for-hmac-signing';
let directory = '';

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'roaswell-settings-'));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('mail settings store', () => {
  it('has no settings before anything is saved', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    expect(await store.readConfig()).toBeNull();
    expect(await store.readView()).toBeNull();
  });

  it('turns a Resend key into the Resend SMTP transport', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    expect(await store.save({ provider: 'RESEND', from: 'Roaswell <no-reply@roaswell.com>', apiKey: 're_live_key' })).toEqual({ ok: true });
    expect(await store.readConfig()).toEqual({
      from: 'Roaswell <no-reply@roaswell.com>',
      transport: { host: 'smtp.resend.com', port: 465, secure: true, user: 'resend', password: 're_live_key' },
    });
  });

  it('stores the key encrypted, in a file only the owner can read', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    await store.save({ provider: 'RESEND', from: 'no-reply@roaswell.com', apiKey: 're_live_key' });

    const file = path.join(directory, 'settings.json');

    expect(await readFile(file, 'utf8')).not.toContain('re_live_key');
    expect((await stat(file)).mode & 0o777).toBe(0o600);
  });

  it('never exposes the key in the view and keeps it when the field stays empty', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    await store.save({ provider: 'RESEND', from: 'no-reply@roaswell.com', apiKey: 're_live_key' });
    await store.save({ provider: 'RESEND', from: 'Neu <neu@roaswell.com>', apiKey: '' });

    expect(JSON.stringify(await store.readView())).not.toContain('re_live_key');
    expect(await store.readView()).toMatchObject({ provider: 'RESEND', from: 'Neu <neu@roaswell.com>', hasSecret: true, isReadable: true });
    expect((await store.readConfig())?.transport.password).toBe('re_live_key');
  });

  it('asks for the key again when switching provider', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    await store.save({ provider: 'RESEND', from: 'no-reply@roaswell.com', apiKey: 're_live_key' });

    expect(
      await store.save({ provider: 'SMTP', from: 'no-reply@roaswell.com', host: 'mail.example.com', port: 587, user: 'me', password: '' }),
    ).toMatchObject({ ok: false });
  });

  it('saves a custom server and uses implicit TLS only on port 465', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    await store.save({ provider: 'SMTP', from: 'no-reply@roaswell.com', host: 'mail.example.com', port: 587, user: 'me', password: 'pw' });
    expect((await store.readConfig())?.transport).toMatchObject({ host: 'mail.example.com', port: 587, secure: false });

    await store.save({ provider: 'SMTP', from: 'no-reply@roaswell.com', host: 'mail.example.com', port: 465, user: 'me', password: '' });
    expect((await store.readConfig())?.transport).toMatchObject({ port: 465, secure: true, password: 'pw' });
  });

  it('reports unreadable settings after the session secret changed', async () => {
    await createMailSettingsStore({ directory, secret: SECRET }).save({
      provider: 'RESEND',
      from: 'no-reply@roaswell.com',
      apiKey: 're_live_key',
    });
    const other = createMailSettingsStore({ directory, secret: 'another-secret-with-enough-length-1234' });

    expect(await other.readConfig()).toBeNull();
    expect(await other.readView()).toMatchObject({ isReadable: false });
  });

  it('can be cleared', async () => {
    const store = createMailSettingsStore({ directory, secret: SECRET });

    await store.save({ provider: 'RESEND', from: 'no-reply@roaswell.com', apiKey: 're_live_key' });
    await store.clear();

    expect(await store.readConfig()).toBeNull();
  });
});

describe('validateMailInput', () => {
  it.each([
    ['a sender that is not an address', { provider: 'RESEND' as const, from: 'Roaswell', apiKey: 'k' }],
    ['an empty key', { provider: 'RESEND' as const, from: 'a@b.de', apiKey: ' ' }],
    ['a host with a path', { provider: 'SMTP' as const, from: 'a@b.de', host: 'mail.example.com/x', port: 587, user: 'u', password: 'p' }],
    ['a port out of range', { provider: 'SMTP' as const, from: 'a@b.de', host: 'mail.example.com', port: 70000, user: 'u', password: 'p' }],
    ['a missing user', { provider: 'SMTP' as const, from: 'a@b.de', host: 'mail.example.com', port: 587, user: '', password: 'p' }],
  ])('refuses %s', (_label, input) => {
    expect(validateMailInput(input).ok).toBe(false);
  });

  it('accepts a sender with a display name', () => {
    expect(validateMailInput({ provider: 'RESEND', from: 'Roaswell <no-reply@roaswell.com>', apiKey: 'k' })).toEqual({ ok: true });
  });
});
