export type SampleKind = 'paid-social' | 'explainer' | 'product' | 'brand-film' | 'ui-motion';

export type SubPage = {
	slug: string;
	name: string;
	eyebrow: string;
	headline: string;
	headlineAccent: string;
	summary: string;
	sample: { kind: SampleKind; title: string; note: string };
	deliverables: { title: string; text: string }[];
	steps: { title: string; text: string }[];
	connects: { discipline: string; text: string }[];
	faqs: { question: string; answer: string }[];
};

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
	subpages: SubPage[];
};

const motionSubpages: SubPage[] = [
	{
		slug: 'paid-social-motion',
		name: 'Paid Social Motion Ads',
		eyebrow: '04.1 / PAID SOCIAL MOTION ADS',
		headline: 'Win the first',
		headlineAccent: 'second.',
		summary:
			'Short motion built for the feed: a hook that stops the thumb, a claim that lands, and a variant system that shows which idea earns the next budget.',
		sample: {
			kind: 'paid-social',
			title: 'NOVA Sparkling: a 10 second ad, taken apart',
			note: 'A concept ad for an invented drink brand. Scrub it, then read the four beats beside it: hook, claim, proof, call.',
		},
		deliverables: [
			{ title: 'Hook-first storyboards', text: 'Three to five opening ideas for every concept, each written to win the first second on its own.' },
			{ title: 'Master animation and cutdowns', text: 'One hero piece plus 6, 15 and 30 second versions cut for the placements you actually buy.' },
			{ title: 'Every format', text: '9:16, 4:5 and 1:1 builds, safe-zone checked for Stories, Reels and the feed.' },
			{ title: 'Variant kits', text: 'Swappable hooks, claims and end cards built into the file so testing never means starting over.' },
			{ title: 'Captions and sound', text: 'Burned-in captions for sound-off viewing and a sound design pass for sound-on.' },
			{ title: 'Learning review', text: 'A written read on what each variant taught us, and what the next batch should change.' },
		],
		steps: [
			{ title: 'Read the account', text: 'We start from performance data: what is fatiguing, which angles still pull, where the drop-off happens.' },
			{ title: 'Write the hypotheses', text: 'Each concept states the claim it tests and the number it should move, before anything is animated.' },
			{ title: 'Build the system', text: 'Master animation first, then variants generated from the same source so the look stays consistent.' },
			{ title: 'Launch and learn', text: 'Variants run against each other. Winners get scaled, losers get retired, and the notes feed the next round.' },
		],
		connects: [
			{ discipline: 'meta-ads', text: 'The creative testing system that decides which variants get budget and when to retire them.' },
			{ discipline: 'google-ads', text: 'Short cutdowns double as video assets for YouTube and Performance Max.' },
		],
		faqs: [
			{ question: 'Do we need to supply footage?', answer: 'No. We can work from brand assets, product renders, screen captures, or build the whole piece from illustration and type. If you do have footage, we will use it.' },
			{ question: 'How many variants should we start with?', answer: 'Enough to learn something, not so many that each one starves. We usually propose a small matrix of hooks against claims and agree the size per batch.' },
			{ question: 'Can you also run the media?', answer: 'Yes, through our Meta Ads and Google Ads work. You can also take the finished files and run them yourselves.' },
			{ question: 'What about music and voiceover?', answer: 'We use licensed or original audio and agree the rights up front, including where and for how long the ad can run.' },
			{ question: 'How do you judge a motion ad?', answer: 'By the commercial metric it was briefed against, not by how it looks. Every concept is tied to a number before it is built.' },
		],
	},
	{
		slug: 'explainer-videos',
		name: 'Explainer Videos',
		eyebrow: '04.2 / EXPLAINER VIDEOS',
		headline: 'Make the complex',
		headlineAccent: 'obvious.',
		summary:
			'A short animated explanation that turns a hard product or idea into something a buyer can repeat to their boss.',
		sample: {
			kind: 'explainer',
			title: 'From scattered attention to a customer, in 14 seconds',
			note: 'A concept explainer about how a funnel works. Dots are people. Watch how many enter, how many convert, and how the story is carried by motion alone.',
		},
		deliverables: [
			{ title: 'Script and narrative', text: 'A tight script built around the one thing the viewer must believe by the end.' },
			{ title: 'Style frames and storyboard', text: 'The look and every scene agreed on paper before animation begins.' },
			{ title: 'Custom illustration and animation', text: 'Original visuals built for your product, not stock icons moved around.' },
			{ title: 'Voiceover direction and sound', text: 'Casting guidance, direction and a mixed track, or a music-only version.' },
			{ title: 'Captioned cutdowns', text: 'Short versions for social and paid with captions already baked in.' },
			{ title: 'Landing page ready', text: 'Compressed files, a poster frame and a transcript so the video helps the page instead of slowing it.' },
		],
		steps: [
			{ title: 'Define the belief', text: 'Who is watching, what do they doubt, and what should they believe when it ends?' },
			{ title: 'Write and board', text: 'Script and storyboard together, so every line has a picture that earns its place.' },
			{ title: 'Design and animate', text: 'Style frames first, then animation in modular scenes that are easy to update.' },
			{ title: 'Finish and deploy', text: 'Sound, captions, cutdowns and placement on the pages and campaigns that need it.' },
		],
		connects: [
			{ discipline: 'seo-content', text: 'Embedded on pages built to rank, with transcripts that add to the content instead of hiding it.' },
			{ discipline: 'google-ads', text: 'A clear explanation on the landing page is what turns paid clicks into enquiries.' },
		],
		faqs: [
			{ question: 'How long should an explainer be?', answer: 'As short as the idea allows. Most land between 45 and 90 seconds, with 15 and 30 second cutdowns for social.' },
			{ question: 'Do you write the script?', answer: 'Yes. We can also work from your script or a rough brief and shape it for the screen.' },
			{ question: 'What if the product changes?', answer: 'We build in modular scenes so a feature can be swapped or updated without redoing the whole film.' },
			{ question: 'How many revision rounds are included?', answer: 'We agree the rounds per project up front and put them at the stages where changes are cheap: script, boards, then animation.' },
			{ question: 'Where do explainers work best?', answer: 'Landing pages, sales decks, onboarding, email, and paid placements that need a quick, clear pitch.' },
		],
	},
	{
		slug: 'product-animation',
		name: 'Product Animation',
		eyebrow: '04.3 / PRODUCT ANIMATION',
		headline: 'Show it',
		headlineAccent: 'working.',
		summary:
			'Exploded views, feature walkthroughs and launch reveals that let buyers see how something works before they can touch it.',
		sample: {
			kind: 'product',
			title: 'HALO: an exploded view, five parts in ten seconds',
			note: 'A concept smart speaker, invented for this page. Drag the timeline to take it apart and put it back together.',
		},
		deliverables: [
			{ title: 'Hero loop', text: 'A clean looping animation for the top of a product or landing page.' },
			{ title: 'Exploded and cutaway views', text: 'The inside story: parts, layers and how they fit together.' },
			{ title: 'Feature call-out sequences', text: 'One short piece per feature, each making a single point clearly.' },
			{ title: 'Launch reveal', text: 'A cinematic piece for the moment the product goes public.' },
			{ title: 'Web-ready exports', text: 'Compressed video and, where it helps, lightweight vector animation for fast pages.' },
			{ title: 'Social cutdowns and stills', text: 'Vertical and square versions plus key frames for decks, email and press.' },
		],
		steps: [
			{ title: 'Gather the source', text: 'CAD, renders, screen recordings or sketches, whatever shows the product best.' },
			{ title: 'Choreograph', text: 'Plan the camera, the order parts appear and the one thing each shot must explain.' },
			{ title: 'Light and material', text: 'Surfaces, glow and shadow tuned so it feels like the real object or interface.' },
			{ title: 'Render and deliver', text: 'Final files for every place the product appears, with a lightweight option for the web.' },
		],
		connects: [
			{ discipline: 'meta-ads', text: 'The same animation cut for the feed makes a product ad that explains instead of just announcing.' },
			{ discipline: 'seo-content', text: 'Product pages with a clear demonstration hold attention longer and give search something to rank.' },
		],
		faqs: [
			{ question: 'Do you need 3D files?', answer: 'They help, but we can also work from photography, drawings or a description. For software products we animate from your interface.' },
			{ question: 'Can you animate software, not just physical products?', answer: 'Yes. UI walkthroughs, data flows and feature explainers follow the same craft as hardware.' },
			{ question: 'Will it slow our site down?', answer: 'We deliver compressed files and, where it makes sense, vector animation that stays light. We agree a size budget up front.' },
			{ question: 'Can we reuse the animation later?', answer: 'Yes. We deliver layered source and agree usage so future launches can build on the same assets.' },
			{ question: 'How polished is polished?', answer: 'The goal is clarity first, then beauty. If a shot looks great but does not explain, it gets cut.' },
		],
	},
	{
		slug: 'brand-films',
		name: 'Brand Films',
		eyebrow: '04.4 / BRAND FILMS',
		headline: 'Say it once.',
		headlineAccent: 'Make it last.',
		summary:
			'Cinematic, type-led films that carry a brand’s point of view, built to anchor a launch, a campaign or a homepage.',
		sample: {
			kind: 'brand-film',
			title: 'ROASWELL: a 16 second title film in three chapters',
			note: 'A concept film for our own studio, shot entirely in motion design. Use the chapter markers to jump between Signal, Intent and Return.',
		},
		deliverables: [
			{ title: 'Concept and treatment', text: 'The idea, the tone and the visual language, written and boarded before production.' },
			{ title: 'Manifesto script', text: 'Words that sound like the brand and are short enough to be remembered.' },
			{ title: 'Motion-led direction', text: 'Typographic, illustrative or mixed-media, chosen to fit the story and the budget.' },
			{ title: 'Sound and music direction', text: 'A score and sound design that does half the emotional work.' },
			{ title: 'Master film and cutdowns', text: 'The full piece plus 30, 15 and 6 second versions for every channel.' },
			{ title: 'Brand motion toolkit', text: 'Transitions, easing and title styles so the look continues in everything that follows.' },
		],
		steps: [
			{ title: 'Find the point of view', text: 'What does the brand believe that its category does not? That is the film.' },
			{ title: 'Write the treatment', text: 'Chapters, rhythm, key frames and sound, agreed before a frame is animated.' },
			{ title: 'Make it', text: 'Design, animation and sound built together so the cut breathes.' },
			{ title: 'Release and extend', text: 'Launch the master, then keep the idea alive with cutdowns and the motion toolkit.' },
		],
		connects: [
			{ discipline: 'meta-ads', text: 'Cutdowns become the awareness layer of a full-funnel paid social plan.' },
			{ discipline: 'google-ads', text: 'Brand search and video campaigns have something worth clicking through to.' },
			{ discipline: 'seo-content', text: 'A film at the heart of a content hub gives writers and links something to point at.' },
		],
		faqs: [
			{ question: 'Do you shoot live action?', answer: 'We direct motion-led films. If a project needs live action, we plan it with a production partner and keep the motion direction in-house.' },
			{ question: 'How long is a brand film?', answer: 'The idea decides. Most are between 30 seconds and two minutes, with shorter versions cut from the master.' },
			{ question: 'Who owns the film?', answer: 'You do. We agree usage rights and deliver layered source files as part of the project.' },
			{ question: 'Can the film live on our homepage?', answer: 'Yes. We deliver a lightweight loop and a poster frame, with the full film one click away.' },
			{ question: 'Is this only for big brands?', answer: 'No. A tightly written type-led film can cost a fraction of a live shoot and still feel like a point of view.' },
		],
	},
	{
		slug: 'web-ui-motion',
		name: 'Web & UI Motion',
		eyebrow: '04.5 / WEB & UI MOTION',
		headline: 'Interfaces that',
		headlineAccent: 'feel alive.',
		summary:
			'Scroll stories, micro-interactions and page transitions that make a site easier to understand and harder to forget, without costing speed or accessibility.',
		sample: {
			kind: 'ui-motion',
			title: 'The motion lab: seven interactions you can touch',
			note: 'Real, working interface motion, not a video. Toggle, hover, drag and click. Everything here respects reduced-motion settings.',
		},
		deliverables: [
			{ title: 'Motion principles', text: 'Easing, timing and spring tokens so every interaction feels like it belongs to one product.' },
			{ title: 'Scroll and page transitions', text: 'Story-led scroll sequences and route transitions that guide attention, like the ones on this site.' },
			{ title: 'Micro-interaction library', text: 'Buttons, toggles, menus, cards and forms that respond with purpose.' },
			{ title: 'Production code or exports', text: 'Clean CSS and JavaScript, or Lottie and video exports, ready for your stack.' },
			{ title: 'Accessibility variants', text: 'Reduced-motion alternatives and focus behaviour designed in, not patched on.' },
			{ title: 'Performance budget', text: 'Motion measured against load time and interaction latency before it ships.' },
		],
		steps: [
			{ title: 'Audit', text: 'Find where motion would clarify something and where it would just add noise.' },
			{ title: 'Set the principles', text: 'Define the easing and timing vocabulary so decisions stop being case by case.' },
			{ title: 'Prototype in the browser', text: 'Build in the real medium so what you approve is what ships.' },
			{ title: 'Ship and measure', text: 'Release with a performance budget and watch what users actually do.' },
		],
		connects: [
			{ discipline: 'seo-content', text: 'Fast, accessible motion supports Core Web Vitals instead of fighting them.' },
			{ discipline: 'google-ads', text: 'Landing pages with clear, quick interactions turn paid clicks into action.' },
		],
		faqs: [
			{ question: 'Will animation slow our site?', answer: 'Not if it is built properly. We set a performance budget, animate with the cheapest properties and test on real devices.' },
			{ question: 'Do you write the code?', answer: 'Yes. We can ship production-ready code, or hand over specs and exports for your team to implement.' },
			{ question: 'What about accessibility?', answer: 'Every motion has a reduced-motion alternative, and keyboard and screen-reader behaviour is designed alongside the animation.' },
			{ question: 'Does it work with our CMS or framework?', answer: 'We work with most modern stacks. Tell us what you run and we will confirm the best approach.' },
			{ question: 'Can I see it working?', answer: 'You are looking at it. The scroll sequences, counters and reveals across this site are built with the same approach.' },
		],
	},
];

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
		subpages: [],
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
		subpages: [],
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
		subpages: [],
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
	{
		slug: 'motion-graphics',
		number: '04',
		name: 'Motion Graphics',
		eyebrow: '04 / MOTION GRAPHICS',
		headline: 'Stop the scroll.',
		headlineAccent: 'Be unmissable.',
		summary:
			'Motion is the fastest way to earn attention and the clearest way to explain a big idea. We design ads, product animations and brand films that are built to be tested, not just admired.',
		capabilities: [
			'Paid Social Creative',
			'Explainer Videos',
			'Product Animation',
			'Brand Films',
			'Web & UI Motion',
			'Creative Testing Assets',
		],
		cta: 'Explore Motion Graphics',
		subpages: motionSubpages,
		body: [
			{ type: 'p', text: 'Static creative asks for attention. Motion takes it. In the first second of a feed, movement decides whether a message gets a chance, and the rest of the idea only matters if it survives that second.' },
			{ type: 'h2', text: 'Built for the feed, not the showreel' },
			{ type: 'p', text: 'Every piece starts with a hypothesis: the hook, the claim, the reason to keep watching. We storyboard against the metric it needs to move, then build variants so the testing system has real material to learn from.' },
			{ type: 'quote', text: 'Great motion is not decoration. It is the argument, made visible.' },
			{ type: 'h2', text: 'One idea, every surface' },
			{ type: 'p', text: 'The same concept travels from a six-second paid cut to a product explainer, a landing page animation and a launch film. One design language, one set of assets, no rebuilding the idea three times.' },
			{ type: 'p', text: 'Because motion sits inside the same studio as search and paid media, creative is briefed by performance data and judged by commercial results, not by how it looks on a reel.' },
		],
	},
];

export const getDiscipline = (slug: string) => disciplines.find(d => d.slug === slug);

export const getSubpage = (disciplineSlug: string, subpageSlug: string) => {
	const discipline = getDiscipline(disciplineSlug);
	const subpage = discipline?.subpages.find(item => item.slug === subpageSlug);
	return discipline && subpage ? { discipline, subpage } : undefined;
};
