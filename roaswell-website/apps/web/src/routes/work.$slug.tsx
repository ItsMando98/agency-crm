import type { Route } from './+types/work.$slug';
import { metaContext, seo } from '@/lib/seo';
import { getCaseStudies, localeFromParams } from '@/lib/content.server';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CaseStudyView } from '@/components/work/case-study';
import { buildCaseStudySchema, buildBreadcrumbSchema } from '@/lib/schema';

export async function loader({ params }: Route.LoaderArgs) {
	const caseStudies = await getCaseStudies(localeFromParams(params));
	const study = caseStudies.find(item => item.slug === params.slug);
	if (!study) {
		throw new Response('Case study not found', { status: 404 });
	}
	return { study };
}

export function meta({ matches, location, loaderData }: Route.MetaArgs) {
	const { origin, locale, t } = metaContext(matches);
	const study = loaderData?.study;
	if (!study) {
		return seo(
			{ matches, location },
			{ title: t('meta.notFound.title'), description: t('meta.notFound.description'), noindex: true },
		);
	}
	const site = { origin, locale };
	return seo(
		{ matches, location },
		{
			title: t('meta.study.title', { title: study.title }),
			description: study.summary,
			type: 'article',
			jsonLd: [
				buildCaseStudySchema(site, study),
				buildBreadcrumbSchema(site, [
					{ name: t('breadcrumb.home'), path: '/' },
					{ name: t('nav.work'), path: '/work' },
					{ name: study.title, path: `/work/${study.slug}` },
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
