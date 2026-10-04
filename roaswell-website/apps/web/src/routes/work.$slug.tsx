import type { Route } from './+types/work.$slug';
import { seo, siteOriginFrom } from '@/lib/seo';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CaseStudyView } from '@/components/work/case-study';
import { getCaseStudy } from '@/data/case-studies';
import { buildCaseStudySchema, buildBreadcrumbSchema } from '@/lib/schema';

export function loader({ params }: Route.LoaderArgs) {
	const study = getCaseStudy(params.slug);
	if (!study) {
		throw new Response('Case study not found', { status: 404 });
	}
	return { study };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const s = loaderData?.study;
	if (!s) {
		return seo(
			{ matches, location },
			{ title: 'Not found — ROASWELL', description: 'This page could not be found.', noindex: true },
		);
	}
	const origin = siteOriginFrom(matches);
	return seo(
		{ matches, location },
		{
			title: `${s.title} — ROASWELL Case Study`,
			description: s.summary,
			type: 'article',
			jsonLd: [
				buildCaseStudySchema(origin, s),
				buildBreadcrumbSchema(origin, [
					{ name: 'Home', path: '/' },
					{ name: 'Work', path: '/work' },
					{ name: s.title, path: `/work/${s.slug}` },
				]),
			],
		},
	);
}

export default function CaseStudyRoute({ loaderData }: Route.ComponentProps) {
	return (
		<>
			<SiteHeader />
			<main>
				<CaseStudyView study={loaderData.study} />
			</main>
			<SiteFooter />
		</>
	);
}
