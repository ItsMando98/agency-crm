import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

// Compose passes unset optional variables as empty strings.
const optionalText = z
  .string()
  .optional()
  .transform((value) => (value === undefined || value.trim() === '' ? undefined : value.trim()));

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  APP_URL: z.string().url().default('http://localhost:3100'),
  TWENTY_API_URL: z.string().url().default('http://twenty-server:3000'),
  TWENTY_API_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(MIN_SECRET_LENGTH),
  TEAM_EMAILS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email !== ''),
    ),
  // Address of the Twenty workspace, where the public report route is served.
  TWENTY_PUBLIC_URL: z.string().url().default('https://crm.roaswell.com'),
  TEAM_PASSWORD_HASH: optionalText,
  SETTINGS_DIR: z.string().default('./data'),
  SMTP_HOST: optionalText,
  SMTP_PORT: z
    .string()
    .optional()
    .transform((value) => (value === undefined || value.trim() === '' ? 587 : Number(value))),
  SMTP_USER: optionalText,
  SMTP_PASSWORD: optionalText,
  MAIL_FROM: z.string().default('Roaswell <no-reply@roaswell.com>'),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export const getEnv = (source: Record<string, string | undefined> = process.env): AppEnv => {
  if (source === process.env && cachedEnv !== null) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const names = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');

    throw new Error(`Invalid environment configuration: ${names}`);
  }

  if (source === process.env) {
    cachedEnv = parsed.data;
  }

  return parsed.data;
};
