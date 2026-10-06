import type { Route } from './+types/expertise';
import { metaContext, seo } from '@/lib/seo';
import { getDisciplines, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ExpertiseHero } from '@/components/expertise/hero';
import { ExpertiseDisciplines } from '@/components/expertise/disciplines';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	return { disciplines: await getDisciplines(localeFromParams(params)) };
}

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	return seo(
		{ matches, location },
		{
			title: t('meta.expertise.title'),
			description: t('meta.expertise.description'),
			jsonLd: buildBreadcrumbSchema({ origin, locale }, [
				{ name: t('breadcrumb.home'), path: '/' },
				{ name: t('nav.expertise'), path: '/expertise' },
			]),
		},
	);
}

export default function ExpertisePage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<ExpertiseHero />
				<ExpertiseDisciplines disciplines={loaderData.disciplines} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
