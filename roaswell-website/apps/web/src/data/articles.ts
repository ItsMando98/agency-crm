export type Article = {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	date: string;
	readTime: string;
	body: { type: 'p' | 'h2' | 'quote'; text: string }[];
};

export const articles: Article[] = [
	{
		slug: 'why-three-disciplines',
		title: 'Why these three disciplines belong together',
		excerpt:
			'Search, content, and paid media are usually sold as separate practices. Here is why treating them as one growth system changes the outcome.',
		category: 'Strategy',
		date: '2026-09-12T09:00:00.000Z',
		readTime: '4 min read',
		body: [
			{ type: 'p', text: 'Most agencies organise around channels because channels are easy to sell. A search team. A social team. A content team. Each optimises its own corner, and the gaps between them are where growth leaks out.' },
			{ type: 'h2', text: 'Intent, demand, and acceleration' },
			{ type: 'p', text: 'Search captures intent that already exists. Content builds the demand that creates it. Paid media accelerates what works — pushing the proven into more moments, faster. Pull any one out and the system loses leverage.' },
			{ type: 'quote', text: 'A channel in isolation is a tactic. Channels that feed each other are a system.' },
			{ type: 'p', text: 'When the same thinking shapes the keyword strategy, the editorial calendar, and the paid creative, the work compounds. Content ranks because it was built to. Paid converts because the message already earned trust organically. Search captures demand the other two created.' },
			{ type: 'h2', text: 'What changes in practice' },
			{ type: 'p', text: 'Fewer handoffs. One measurement framework. A creative idea that can travel from an organic post to a paid asset to a landing page without being rebuilt three times. That is the point of keeping it small and senior-led.' },
		],
	},
	{
		slug: 'creative-is-the-targeting',
		title: 'Creative is the targeting',
		excerpt:
			'On modern paid social platforms, what you show matters more than who you show it to. A note on building a testing system that holds.',
		category: 'Paid Media',
		date: '2026-08-28T09:00:00.000Z',
		readTime: '5 min read',
		body: [
			{ type: 'p', text: 'The old playbook was audience-first: build the perfect persona, target it precisely, and trust the algorithm to find more like it. That world is mostly gone. Audiences are broader, signals are noisier, and the creative itself does the filtering.' },
			{ type: 'h2', text: 'The creative decides who stays' },
			{ type: 'p', text: 'A scroll-stopping hook speaks to the right person and repels the wrong one. That is targeting — just done by the message instead of the audience picker. Which means the creative pipeline is now the lever.' },
			{ type: 'quote', text: 'If your testing system does not get sharper every cycle, your creative is decaying.' },
			{ type: 'h2', text: 'Build a system, not a batch' },
			{ type: 'p', text: 'Hypotheses before variants. Clear winners before scale. A cadence that produces learning, not just assets. The brands that win on paid social are the ones whose creative gets measurably better month over month — not the ones with the biggest budget.' },
		],
	},
	{
		slug: 'measuring-what-comes-back',
		title: 'Measuring what comes back',
		excerpt:
			'Platform dashboards will always tell you the spend worked. Here is how we keep the numbers honest.',
		category: 'Measurement',
		date: '2026-08-05T09:00:00.000Z',
		readTime: '4 min read',
		body: [
			{ type: 'p', text: 'Every ad platform reports its own success. They are not lying, exactly — but they are measuring from their own vantage point, and that vantage point is generous to the platform.' },
			{ type: 'h2', text: 'Attribution is a question, not a setting' },
			{ type: 'p', text: 'The question is not "did this campaign drive conversions" but "what would have happened without it." Incrementality, blended CAC, and conversion value modelling answer that. Last-click dashboards do not.' },
			{ type: 'quote', text: 'If the number driving the decision comes from the platform spending the money, treat it as a claim, not a fact.' },
			{ type: 'p', text: 'Server-side tracking, a clean data layer, and a reporting view tied to commercial outcomes — not platform self-reporting — is where decisions should be made. It is less flattering, and far more useful.' },
		],
	},
];

export const getArticle = (slug: string) => articles.find(a => a.slug === slug);
