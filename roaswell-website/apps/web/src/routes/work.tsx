import type { Route } from './+types/work';
import { metaContext, seo } from '@/lib/seo';
import { getCaseStudies, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WorkList } from '@/components/work/list';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	return { caseStudies: await getCaseStudies(localeFromParams(params)) };
}

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	return seo(
		{ matches, location },
		{
			title: t('meta.work.title'),
			description: t('meta.work.description'),
			jsonLd: buildBreadcrumbSchema({ origin, locale }, [
				{ name: t('breadcrumb.home'), path: '/' },
				{ name: t('nav.work'), path: '/work' },
			]),
		},
	);
}

export default function WorkPage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<WorkList caseStudies={loaderData.caseStudies} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
