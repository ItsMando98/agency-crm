import { absoluteUrl } from '@/lib/seo';
import { LOCALES, getLocaleDefinition, localizePath } from '@/i18n/locales';
import type { Translate } from '@/i18n/context';
import type { Discipline, SubPage } from '@/data/expertise';
import type { Article } from '@/data/articles';
import type { CaseStudy } from '@/data/case-studies';

export type SchemaSite = { origin: string; locale: string };

function pageUrl(site: SchemaSite, path: string) {
	return absoluteUrl(site.origin, localizePath(path, site.locale));
}

type DisciplineSummary = Pick<Discipline, 'slug' | 'name' | 'summary'>;

export function buildOrganizationSchema(site: SchemaSite, t: Translate, disciplines: DisciplineSummary[]) {
	const { origin } = site;
	return {
		'@context': 'https://schema.org',
		'@type': ['Organization', 'ProfessionalService'],
		'@id': `${origin}/#organization`,
		name: 'ROASWELL',
		alternateName: 'ROASWELL Studio',
		url: origin,
		logo: absoluteUrl(origin, '/favicon.ico'),
		image: absoluteUrl(origin, '/og-image.png'),
		description: t('schema.organization.description'),
		email: 'hello@roaswell.com',
		areaServed: 'Worldwide',
		knowsAbout: [
			'Search Engine Optimization',
			'Content Strategy & Editorial',
			'Commercial B2B SEO',
			'Meta Ads & Paid Social',
			'Creative Testing Frameworks',
			'Google Ads & Paid Search',
			'Conversion Rate Optimization',
			'Motion Graphics & Performance Creative',
			'Server-Side Attribution & Tracking',
			'Incrementality Measurement',
		],
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: t('schema.organization.catalog'),
			itemListElement: disciplines.map(discipline => ({
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Service',
					name: discipline.name,
					description: discipline.summary,
					url: pageUrl(site, `/expertise/${discipline.slug}`),
				},
			})),
		},
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'customer service',
				email: 'hello@roaswell.com',
				availableLanguage: LOCALES.map(locale => locale.hreflang),
			},
		],
	};
}

export function buildWebSiteSchema(site: SchemaSite, t: Translate) {
	const { origin, locale } = site;
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: 'ROASWELL',
		description: t('schema.website.description'),
		publisher: {
			'@id': `${origin}/#organization`,
		},
		inLanguage: getLocaleDefinition(locale).hreflang,
	};
}

export function buildBreadcrumbSchema(site: SchemaSite, items: Array<{ name: string; path: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: pageUrl(site, item.path),
		})),
	};
}

export function buildServiceSchema(site: SchemaSite, discipline: Discipline) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${pageUrl(site, `/expertise/${discipline.slug}`)}#service`,
		name: discipline.name,
		headline: `${discipline.headline} ${discipline.headlineAccent}`,
		description: discipline.summary,
		url: pageUrl(site, `/expertise/${discipline.slug}`),
		provider: {
			'@id': `${site.origin}/#organization`,
		},
		serviceType: discipline.capabilities.join(', '),
		areaServed: 'Worldwide',
	};
}

export function buildArticleSchema(site: SchemaSite, article: Article) {
	const url = pageUrl(site, `/insights/${article.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: article.title,
		description: article.excerpt,
		url,
		inLanguage: getLocaleDefinition(site.locale).hreflang,
		datePublished: article.date,
		dateModified: article.date,
		articleSection: article.category,
		author: {
			'@id': `${site.origin}/#organization`,
		},
		publisher: {
			'@id': `${site.origin}/#organization`,
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		image: absoluteUrl(site.origin, '/og-image.png'),
	};
}

export function buildCaseStudySchema(site: SchemaSite, study: CaseStudy) {
	const url = pageUrl(site, `/work/${study.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': `${url}#case-study`,
		headline: study.title,
		description: study.summary,
		url,
		inLanguage: getLocaleDefinition(site.locale).hreflang,
		datePublished: study.publishedAt,
		articleSection: study.discipline,
		author: {
			'@id': `${site.origin}/#organization`,
		},
		publisher: {
			'@id': `${site.origin}/#organization`,
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		image: absoluteUrl(site.origin, '/og-image.png'),
	};
}

export function buildAboutPageSchema(site: SchemaSite, t: Translate) {
	return {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		'@id': `${pageUrl(site, '/about')}#about`,
		url: pageUrl(site, '/about'),
		name: t('schema.about.name'),
		description: t('schema.about.description'),
		mainEntity: {
			'@id': `${site.origin}/#organization`,
		},
	};
}

export function buildContactPageSchema(site: SchemaSite, t: Translate) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'@id': `${pageUrl(site, '/contact')}#contact`,
		url: pageUrl(site, '/contact'),
		name: t('schema.contact.name'),
		description: t('schema.contact.description'),
		mainEntity: {
			'@id': `${site.origin}/#organization`,
		},
	};
}

export function buildSubpageSchema(site: SchemaSite, discipline: Discipline, subpage: SubPage) {
	const url = pageUrl(site, `/expertise/${discipline.slug}/${subpage.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${url}#service`,
		name: subpage.name,
		headline: `${subpage.headline} ${subpage.headlineAccent}`,
		description: subpage.summary,
		url,
		isPartOf: { '@id': `${pageUrl(site, `/expertise/${discipline.slug}`)}#service` },
		provider: { '@id': `${site.origin}/#organization` },
		serviceType: subpage.deliverables.map(item => item.title).join(', '),
		areaServed: 'Worldwide',
	};
}

export function buildFaqSchema(faqs: SubPage['faqs']) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map(item => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer },
		})),
	};
}
