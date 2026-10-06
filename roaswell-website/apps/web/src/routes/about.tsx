import type { Route } from './+types/about';
import { getFounderProfile } from '@/data/company.server';
import { metaContext, seo } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AboutPage } from '@/components/about/page';
import { buildAboutPageSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function loader() {
	return { founder: getFounderProfile() };
}

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.about.title'),
			description: t('meta.about.description'),
			jsonLd: [
				buildAboutPageSchema(site, t),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.about'), path: '/about' },
				]),
			],
		},
	);
}

export default function AboutRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<AboutPage founder={loaderData.founder} />
			</main>
			<SiteFooter />
		</>
	);
}
