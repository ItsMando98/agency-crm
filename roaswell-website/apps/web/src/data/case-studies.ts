export type CaseStudy = {
	slug: string;
	title: string;
	discipline: string;
	summary: string;
	challenge: string;
	approach: string;
	outcome: string;
	metrics: { value: string; label: string }[];
	publishedAt: string;
	illustrative: boolean;
};

export const caseStudies: CaseStudy[] = [
	{
		slug: 'search-to-significance',
		title: 'Turning search intent into demand',
		discipline: 'SEO & Content',
		summary:
			'How a considered-purchase brand rebuilt its organic presence around commercial intent — and turned top-of-funnel traffic into qualified pipeline.',
		challenge:
			'A specialist B2B brand was ranking for informational queries that drove traffic but no pipeline. Content was plentiful, but it answered the wrong questions for buyers further down the funnel.',
		approach:
			'We re-mapped the topic landscape around buying intent, consolidated thin content, and rebuilt the editorial calendar around the decisions buyers actually face. Technical SEO work — site architecture, internal linking, and structured data — gave the new content room to rank.',
		outcome:
			'Organic traffic refocused toward commercial pages, qualified enquiries rose, and the content engine began compounding rather than scattering. The work is ongoing; the direction is set.',
		metrics: [
			{ value: '+120%', label: 'Organic traffic target' },
			{ value: '2.4×', label: 'Qualified lead target' },
		],
		publishedAt: '2026-08-18T09:00:00.000Z',
		illustrative: true,
	},
	{
		slug: 'making-acquisition-work-harder',
		title: 'Making acquisition work harder',
		discipline: 'Meta Ads + Google Ads',
		summary:
			'A DTC brand was spending more to acquire less. A creative-led reset across paid social and search rebuilt efficiency from the ground up.',
		challenge:
			'Rising CPMs and creative fatigue had pushed acquisition cost past the point of profitability. The account was busy but not effective — budget spread thin across audiences that no longer converted.',
		approach:
			'We consolidated the account around a structured creative testing system, rebuilt full-funnel sequencing, and realigned search budget toward high-intent, high-margin terms. Tracking moved server-side so decisions reflected reality.',
		outcome:
			'Acquisition cost fell, return on ad spend recovered, and the testing rhythm meant creative improved every cycle rather than decaying. The brand now has a system, not just campaigns.',
		metrics: [
			{ value: '4.2×', label: 'Return on ad spend target' },
			{ value: '−32%', label: 'Acquisition cost target' },
		],
		publishedAt: '2026-07-02T09:00:00.000Z',
		illustrative: true,
	},
	{
		slug: 'full-funnel-foundations',
		title: 'Full-funnel foundations for a new launch',
		discipline: 'SEO & Content + Paid',
		summary:
			'A product launch needed organic equity and paid momentum to land at the same time. We built both, sequenced to compound.',
		challenge:
			'A new offering had no search presence and no paid history. The risk was launching into silence — paid spend with nothing to catch the demand it created.',
		approach:
			'Content and technical SEO work began months ahead of launch to build topical authority. Paid social seeded awareness and retargeting, while search captured the intent the launch generated. Measurement was wired in from day one.',
		outcome:
			'The launch landed into existing organic equity rather than a vacuum, paid spend converted at a healthy rate from the start, and the brand had a measurement framework to scale from.',
		metrics: [
			{ value: '3.1×', label: 'Launch-month ROAS target' },
			{ value: '0→1', label: 'Organic equity built pre-launch' },
		],
		publishedAt: '2026-05-21T09:00:00.000Z',
		illustrative: true,
	},
];

export const getCaseStudy = (slug: string) => caseStudies.find(c => c.slug === slug);
