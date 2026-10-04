import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, Plus } from 'lucide-react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { getDiscipline, type Discipline, type SampleKind, type SubPage } from '@/data/expertise';
import { Reveal } from '@/components/motion/primitives';
import { PaidSocialAd } from '@/components/expertise/samples/paid-social-ad';
import { ExplainerSample } from '@/components/expertise/samples/explainer';
import { ProductSample } from '@/components/expertise/samples/product';
import { BrandFilmSample } from '@/components/expertise/samples/brand-film';
import { UiMotionLab } from '@/components/expertise/samples/ui-lab';

const SAMPLES: Record<SampleKind, () => React.ReactNode> = {
	'paid-social': () => <PaidSocialAd />,
	explainer: () => <ExplainerSample />,
	product: () => <ProductSample />,
	'brand-film': () => <BrandFilmSample />,
	'ui-motion': () => <UiMotionLab />,
};

type StepProps = {
	step: SubPage['steps'][number];
	index: number;
	total: number;
	progress: MotionValue<number>;
};

function ProcessStep({ step, index, total, progress }: StepProps) {
	const threshold = index / total;
	const opacity = useTransform(progress, [threshold - 0.12, threshold + 0.06], [0.22, 1], { clamp: true });
	const lift = useTransform(progress, [threshold - 0.12, threshold + 0.06], [24, 0], { clamp: true });
	const color = useTransform(progress, [threshold - 0.05, threshold + 0.08], ['#4a4a50', '#ff3448']);
	return (
		<motion.article style={{ opacity, y: lift }}>
			<motion.span className="large-index" style={{ color }}>
				0{index + 1}
			</motion.span>
			<div>
				<h3>{step.title}</h3>
				<p>{step.text}</p>
			</div>
		</motion.article>
	);
}

function Process({ steps }: { steps: SubPage['steps'] }) {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.65', 'end 0.75'] });
	const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

	return (
		<section className="approach section">
			<div className="approach-intro">
				<span className="eyebrow">
					<i /> HOW IT RUNS
				</span>
				<h2>
					From brief
					<br />
					<em>to finished.</em>
				</h2>
				<p>Four stages, each with a clear output, so you always know what is being made and why.</p>
			</div>
			<div className="approach-steps" ref={ref}>
				<div className="approach-line" aria-hidden="true">
					<motion.i style={{ scaleY: line }} />
				</div>
				{steps.map((step, index) => (
					<ProcessStep key={step.title} step={step} index={index} total={steps.length} progress={scrollYProgress} />
				))}
			</div>
		</section>
	);
}

type SubpageDetailProps = {
	discipline: Discipline;
	subpage: SubPage;
};

export function SubpageDetail({ discipline, subpage }: SubpageDetailProps) {
	const siblings = discipline.subpages.filter(item => item.slug !== subpage.slug);

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {subpage.eyebrow}
					</span>
					<Link to={`/expertise/${discipline.slug}`} className="back-link">
						← {discipline.name}
					</Link>
				</div>
				<h1>
					{subpage.headline}
					<span>{subpage.headlineAccent}</span>
				</h1>
				<p className="detail-summary">{subpage.summary}</p>
			</section>

			<section className="sample-section section" aria-labelledby="sample-title">
				<div className="sample-head">
					<span className="eyebrow">
						<i /> SEE THE CRAFT
					</span>
					<h2 id="sample-title">{subpage.sample.title}</h2>
					<p>{subpage.sample.note}</p>
				</div>
				{SAMPLES[subpage.sample.kind]()}
				<p className="sample-disclaimer">
					Made by the Roaswell studio to show how we work. Not client work, and not a real brand.
				</p>
			</section>

			<section className="section deliverables">
				<div className="section-heading">
					<span className="eyebrow">
						<i /> WHAT YOU GET
					</span>
					<h2>
						Everything it takes
						<br />
						to ship.
					</h2>
					<p>Defined deliverables, agreed before work starts, so scope never becomes a surprise.</p>
				</div>
				<div className="deliverable-grid">
					{subpage.deliverables.map((item, index) => (
						<Reveal key={item.title} delay={(index % 3) * 0.08} className="deliverable-card">
							<span>0{index + 1}</span>
							<h3>{item.title}</h3>
							<p>{item.text}</p>
						</Reveal>
					))}
				</div>
			</section>

			<Process steps={subpage.steps} />

			<section className="section connects">
				<div className="section-heading">
					<span className="eyebrow">
						<i /> WHERE IT CONNECTS
					</span>
					<h2>
						One studio.
						<br />
						One system.
					</h2>
					<p>Motion works hardest when it is briefed by data and delivered where the budget is.</p>
				</div>
				<div className="related-grid">
					{subpage.connects.map(item => {
						const target = getDiscipline(item.discipline);
						if (!target) return null;
						return (
							<Link key={item.discipline} to={`/expertise/${target.slug}`} className="related-card">
								<span className="discipline-index">{target.number}</span>
								<h3>{target.name}</h3>
								<p>{item.text}</p>
								<ArrowUpRight size={20} />
							</Link>
						);
					})}
				</div>
			</section>

			<section className="section faq-section">
				<div className="section-heading">
					<span className="eyebrow">
						<i /> QUESTIONS
					</span>
					<h2>
						Good questions,
						<br />
						straight answers.
					</h2>
					<p>Not what you need? Ask us directly and a senior person will reply.</p>
				</div>
				<div className="faq-list">
					{subpage.faqs.map(item => (
						<details key={item.question} className="faq-item">
							<summary>
								<span>{item.question}</span>
								<Plus size={20} aria-hidden="true" />
							</summary>
							<p>{item.answer}</p>
						</details>
					))}
				</div>
			</section>

			{siblings.length > 0 && (
				<section className="related-disciplines section">
					<span className="eyebrow">
						<i /> MORE {discipline.name.toUpperCase()}
					</span>
					<div className="related-grid">
						{siblings.map(item => (
							<Link key={item.slug} to={`/expertise/${discipline.slug}/${item.slug}`} className="related-card">
								<span className="discipline-index">{item.eyebrow.split(' / ')[0]}</span>
								<h3>{item.name}</h3>
								<p>
									{item.headline} {item.headlineAccent}
								</p>
								<ArrowUpRight size={20} />
							</Link>
						))}
					</div>
				</section>
			)}
		</>
	);
}
