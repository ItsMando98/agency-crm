import { useRouteLoaderData } from 'react-router';
import type { loader } from '@/root';

export function useRootData() {
	return useRouteLoaderData<typeof loader>('root');
}

export function useDisciplineNav() {
	return useRootData()?.disciplineNav ?? [];
}

export function usePrimaryCta() {
	const bookingUrl = useRootData()?.bookingUrl ?? null;
	return bookingUrl
		? { href: bookingUrl, external: true, labelKey: 'cta.book' as const }
		: { href: '/contact', external: false, labelKey: 'cta.talk' as const };
}
