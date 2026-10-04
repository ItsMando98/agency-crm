import { absoluteUrl } from '@/lib/seo';
import type { Discipline, SubPage } from '@/data/expertise';
import type { Article } from '@/data/articles';
import type { CaseStudy } from '@/data/case-studies';

export function buildOrganizationSchema(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': ['Organization', 'ProfessionalService'],
		'@id': `${origin}/#organization`,
		name: 'ROASWELL',
		alternateName: 'ROASWELL Studio',
		url: origin,
		logo: absoluteUrl(origin, '/favicon.ico'),
		image: absoluteUrl(origin, '/og-image.png'),
		description:
			'Independent, senior-led digital growth studio specializing in SEO & Content, Meta Ads, Google Ads, and Motion Graphics.',
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
			name: 'Growth Studio Capabilities',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'SEO & Content',
						description:
							'Intent mapping, commercial keyword prioritization, technical crawlability, and compounding editorial architecture.',
						url: absoluteUrl(origin, '/expertise/seo-content'),
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Meta Ads',
						description:
							'Creative-led testing systems, audience strategy, and full-funnel conversion campaigns across Meta platforms.',
						url: absoluteUrl(origin, '/expertise/meta-ads'),
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Google Ads',
						description:
							'High-intent search, shopping, and conversion value modeling tied to real economic returns.',
						url: absoluteUrl(origin, '/expertise/google-ads'),
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Motion Graphics',
						description:
							'Paid social creative, explainer videos, product animation, brand films and web motion built for creative testing.',
						url: absoluteUrl(origin, '/expertise/motion-graphics'),
					},
				},
			],
		},
		contactPoint: [
			{
				'@type': 'ContactPoint',
				contactType: 'customer service',
				email: 'hello@roaswell.com',
				availableLanguage: ['English', 'German'],
			},
		],
	};
}

export function buildWebSiteSchema(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: 'ROASWELL',
		description: 'Independent digital growth studio. SEO & Content, Meta Ads, Google Ads, Motion Graphics.',
		publisher: {
			'@id': `${origin}/#organization`,
		},
		inLanguage: 'en',
	};
}

export function buildBreadcrumbSchema(origin: string, items: Array<{ name: string; path: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(origin, item.path),
		})),
	};
}

export function buildServiceSchema(origin: string, discipline: Discipline) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': absoluteUrl(origin, `/expertise/${discipline.slug}#service`),
		name: discipline.name,
		headline: `${discipline.headline} ${discipline.headlineAccent}`,
		description: discipline.summary,
		url: absoluteUrl(origin, `/expertise/${discipline.slug}`),
		provider: {
			'@id': `${origin}/#organization`,
		},
		serviceType: discipline.capabilities.join(', '),
		areaServed: 'Worldwide',
	};
}

export function buildArticleSchema(origin: string, article: Article) {
	const url = absoluteUrl(origin, `/insights/${article.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: article.title,
		description: article.excerpt,
		url,
		datePublished: article.date,
		dateModified: article.date,
		articleSection: article.category,
		author: {
			'@id': `${origin}/#organization`,
		},
		publisher: {
			'@id': `${origin}/#organization`,
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		image: absoluteUrl(origin, '/og-image.png'),
	};
}

export function buildCaseStudySchema(origin: string, study: CaseStudy) {
	const url = absoluteUrl(origin, `/work/${study.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		'@id': `${url}#case-study`,
		headline: study.title,
		description: study.summary,
		url,
		datePublished: study.publishedAt,
		articleSection: study.discipline,
		author: {
			'@id': `${origin}/#organization`,
		},
		publisher: {
			'@id': `${origin}/#organization`,
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': url,
		},
		image: absoluteUrl(origin, '/og-image.png'),
	};
}

export function buildAboutPageSchema(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		'@id': `${origin}/about#about`,
		url: absoluteUrl(origin, '/about'),
		name: 'About ROASWELL',
		description:
			'ROASWELL is an independent, senior-led digital growth studio uniting SEO & Content, Meta Ads, Google Ads, and Motion Graphics.',
		mainEntity: {
			'@id': `${origin}/#organization`,
		},
	};
}

export function buildContactPageSchema(origin: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'@id': `${origin}/contact#contact`,
		url: absoluteUrl(origin, '/contact'),
		name: 'Contact ROASWELL',
		description: 'Start a conversation with the ROASWELL studio.',
		mainEntity: {
			'@id': `${origin}/#organization`,
		},
	};
}

export function buildSubpageSchema(origin: string, discipline: Discipline, subpage: SubPage) {
	const url = absoluteUrl(origin, `/expertise/${discipline.slug}/${subpage.slug}`);
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		'@id': `${url}#service`,
		name: subpage.name,
		headline: `${subpage.headline} ${subpage.headlineAccent}`,
		description: subpage.summary,
		url,
		isPartOf: { '@id': absoluteUrl(origin, `/expertise/${discipline.slug}#service`) },
		provider: { '@id': `${origin}/#organization` },
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
