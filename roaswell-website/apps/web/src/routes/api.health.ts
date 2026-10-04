import { withApi } from '@/lib/api.server';

export const loader = withApi(async () => Response.json({ status: 'ok' }));
