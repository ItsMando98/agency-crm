import type { Route } from './+types/approach';
import { metaContext, seo } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ApproachPage } from '@/components/approach/page';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	return seo(
		{ matches, location },
		{
			title: t('meta.approach.title'),
			description: t('meta.approach.description'),
			jsonLd: buildBreadcrumbSchema({ origin, locale }, [
				{ name: t('breadcrumb.home'), path: '/' },
				{ name: t('nav.approach'), path: '/approach' },
			]),
		},
	);
}

export default function ApproachRoute() {
	return (
		<>
			<SiteHeader />
			<main>
				<ApproachPage />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
