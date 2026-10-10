import { z } from 'zod';

const MIN_SECRET_LENGTH = 32;

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
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
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
