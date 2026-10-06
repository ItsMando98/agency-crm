import type { Route } from './+types/insights';
import { metaContext, seo } from '@/lib/seo';
import { getArticles, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { InsightsList } from '@/components/insights/list';
import { ContactCta } from '@/components/contact-cta';
import { buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	return { articles: await getArticles(localeFromParams(params)) };
}

export function meta({ matches, location }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	return seo(
		{ matches, location },
		{
			title: t('meta.insights.title'),
			description: t('meta.insights.description'),
			jsonLd: buildBreadcrumbSchema({ origin, locale }, [
				{ name: t('breadcrumb.home'), path: '/' },
				{ name: t('nav.insights'), path: '/insights' },
			]),
		},
	);
}

export default function InsightsPage({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<InsightsList articles={loaderData.articles} />
				<ContactCta />
			</main>
			<SiteFooter />
		</>
	);
}
