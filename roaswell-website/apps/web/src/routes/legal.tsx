import type { Route } from './+types/legal';
import { metaContext, seo } from '@/lib/seo';
import { localeFromParams } from '@/lib/content.server';
import { buildImprint } from '@/lib/legal.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { LegalDocument } from '@/components/legal/page';
import { buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	return { document: await buildImprint(localeFromParams(params)) };
}

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	return seo(
		{ matches, location },
		{
			title: t('meta.legal.title'),
			description: t('meta.legal.description'),
			jsonLd: buildBreadcrumbSchema({ origin, locale }, [
				{ name: t('breadcrumb.home'), path: '/' },
				{ name: t('footer.legal'), path: '/legal' },
			]),
		},
	);
}

export default function LegalRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<LegalDocument {...loaderData.document} />
			</main>
			<SiteFooter />
		</>
	);
}
