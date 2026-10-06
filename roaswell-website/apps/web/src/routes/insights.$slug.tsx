import type { Route } from './+types/insights.$slug';
import { metaContext, seo } from '@/lib/seo';
import { getArticles, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ArticleView } from '@/components/insights/article';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	const articles = await getArticles(localeFromParams(params));
	const article = articles.find(item => item.slug === params.slug);
	if (!article) {
		throw new Response('Article not found', { status: 404 });
	}
	return { article };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const article = loaderData?.article;
	if (!article) {
		return seo(
			{ matches, location },
			{ title: t('meta.notFound.title'), description: t('meta.notFound.description'), noindex: true },
		);
	}
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.article.title', { title: article.title }),
			description: article.excerpt,
			type: 'article',
			jsonLd: [
				buildArticleSchema(site, article),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.insights'), path: '/insights' },
					{ name: article.title, path: `/insights/${article.slug}` },
				]),
			],
		},
	);
}

export default function ArticleRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<ArticleView article={loaderData.article} />
			</main>
			<SiteFooter />
		</>
	);
}
