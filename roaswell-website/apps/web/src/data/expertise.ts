export type Discipline = {
	slug: string;
	number: string;
	name: string;
	eyebrow: string;
	headline: string;
	headlineAccent: string;
	summary: string;
	capabilities: string[];
	cta: string;
	body: { type: 'p' | 'h2' | 'quote'; text: string }[];
};

export const disciplines: Discipline[] = [
	{
		slug: 'seo-content',
		number: '01',
		name: 'SEO & Content',
		eyebrow: '01 / SEO & CONTENT',
		headline: 'Be found.',
		headlineAccent: 'Be chosen.',
		summary:
			'Search captures intent. Content builds demand. We turn questions into qualified traffic — and traffic into customers — with strategy, editorial, and technical foundations that compound over time.',
		capabilities: [
			'SEO Strategy',
			'Content Strategy',
			'Keyword Research',
			'Editorial',
			'On-page SEO',
			'Content Optimisation',
		],
		cta: 'Explore SEO & Content',
		body: [
			{ type: 'p', text: 'Most search traffic is wasted because it answers the wrong question, or the right question badly. We start from intent — what your audience is actually trying to understand, decide, or buy — and build outward from there.' },
			{ type: 'h2', text: 'Strategy before output' },
			{ type: 'p', text: 'A content engine only works when every piece has a job. We map the topics that move commercial outcomes, prioritise by opportunity, and sequence the work so momentum compounds instead of scattering.' },
			{ type: 'quote', text: 'Be the answer your audience is looking for — not just another result on the page.' },
			{ type: 'h2', text: 'Technical foundations that hold' },
			{ type: 'p', text: 'Crawlability, site architecture, core web vitals, structured data. The unglamorous work that decides whether great content ever gets the chance to rank. We treat it as part of the strategy, not an afterthought.' },
			{ type: 'p', text: 'Then we measure. Search console data, rank tracking, conversion attribution — tied back to the commercial outcomes that matter, not vanity traffic charts.' },
		],
	},
	{
		slug: 'meta-ads',
		number: '02',
		name: 'Meta Ads',
		eyebrow: '02 / META ADS',
		headline: 'Turn attention',
		headlineAccent: 'into demand.',
		summary:
			'Creative that connects, campaigns that convert. We pair audience insight with relentless testing to make every impression work harder across Facebook, Instagram and the wider Meta ecosystem.',
		capabilities: [
			'Paid Social',
			'Creative Testing',
			'Audience Strategy',
			'Full-funnel Campaigns',
			'Conversion Optimisation',
			'Retargeting',
		],
		cta: 'Explore Meta Ads',
		body: [
			{ type: 'p', text: 'Attention is abundant; demand is not. The job of paid social is not to be seen — it is to be remembered, considered, and chosen. That starts with creative that earns the scroll-stop.' },
			{ type: 'h2', text: 'Creative is the targeting' },
			{ type: 'p', text: 'On modern platforms, what you show matters more than who you show it to. We build a structured creative testing system — hypotheses, variants, clear winners — so the work gets sharper every cycle.' },
			{ type: 'quote', text: 'Every click has a job to do. Make it count.' },
			{ type: 'h2', text: 'Full-funnel, not last-click' },
			{ type: 'p', text: 'Awareness, consideration, conversion, retention. We design the journey so each stage feeds the next — and measure incrementally, so you know what the spend actually produced.' },
			{ type: 'p', text: 'No set-and-forget. Weekly creative reviews, audience refreshes, and budget shifts toward what is working — and away from what is not.' },
		],
	},
	{
		slug: 'google-ads',
		number: '03',
		name: 'Google Ads',
		eyebrow: '03 / GOOGLE ADS',
		headline: 'Capture intent',
		headlineAccent: 'when it matters.',
		summary:
			'Meet intent with precision. From search to shopping, we put budget where the opportunity is — and measure what comes back with clear, commercial reporting.',
		capabilities: [
			'Paid Search',
			'Shopping Ads',
			'Performance Max',
			'Conversion Optimisation',
			'Bid Strategy',
			'Tracking & Measurement',
		],
		cta: 'Explore Google Ads',
		body: [
			{ type: 'p', text: 'Search is the moment intent becomes action. The question is whether you show up for it — and whether, when you do, the experience converts.' },
			{ type: 'h2', text: 'Budget where the opportunity is' },
			{ type: 'p', text: 'Not every keyword deserves your money. We build keyword strategy around commercial intent and margin, cut waste from broad and brand overlap, and concentrate spend where return is real.' },
			{ type: 'quote', text: 'Meet intent with precision. Measure what comes back.' },
			{ type: 'h2', text: 'Measurement you can trust' },
			{ type: 'p', text: 'Server-side tracking, conversion value modelling, clean attribution. So the numbers driving decisions reflect reality — not platform self-reporting.' },
			{ type: 'p', text: 'Bid strategies tuned to your economics, not a default target. We test, we watch the edge cases, and we keep the spend honest.' },
		],
	},
];

export const getDiscipline = (slug: string) => disciplines.find(d => d.slug === slug);
