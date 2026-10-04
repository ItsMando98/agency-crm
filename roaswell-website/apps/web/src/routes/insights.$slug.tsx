import type { Route } from './+types/insights.$slug';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ArticleView } from '@/components/insights/article';
import { getArticle } from '@/data/articles';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/schema';

export function loader({ params }: Route.LoaderArgs) {
	const article = getArticle(params.slug);
	if (!article) {
		throw new Response('Article not found', { status: 404 });
	}
	return { article };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const a = loaderData?.article;
	if (!a) {
		return seo(
			{ matches, location },
			{ title: 'Not found — ROASWELL', description: 'This page could not be found.', noindex: true },
		);
	}
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: `${a.title} — ROASWELL Insights`,
			description: a.excerpt,
			type: 'article',
			jsonLd: [
				buildArticleSchema(origin, a),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Insights', path: '/insights' },
					{ name: a.title, path: `/insights/${a.slug}` },
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
