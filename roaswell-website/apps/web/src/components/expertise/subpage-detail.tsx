import { useRef } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import type { Discipline, SampleKind, SubPage } from '@/data/expertise';
import { Link, useLocale, useT } from '@/i18n/context';
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
	const t = useT();
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.65', 'end 0.75'] });
	const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

	return (
		<section className="approach section">
			<div className="approach-intro">
				<span className="eyebrow">
					<i /> {t('subpage.process.eyebrow')}
				</span>
				<h2>
					{t('subpage.process.title')}
					<br />
					<em>{t('subpage.process.titleAccent')}</em>
				</h2>
				<p>{t('subpage.process.lede')}</p>
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

type DisciplineNavItem = { slug: string; number: string; name: string };

type SubpageDetailProps = {
	discipline: Discipline;
	subpage: SubPage;
	disciplineNav: DisciplineNavItem[];
};

export function SubpageDetail({ discipline, subpage, disciplineNav }: SubpageDetailProps) {
	const t = useT();
	const locale = useLocale();
	const siblings = discipline.subpages.filter(item => item.slug !== subpage.slug);

	return (
		<>
			<section className="detail-hero">
				<div className="hero-top">
					<span className="eyebrow">
						<i /> {subpage.eyebrow}
					</span>
					<Link to={`/expertise/${discipline.slug}`} className="back-link">
						{t('subpage.back', { name: discipline.name })}
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
						<i /> {t('subpage.sample.eyebrow')}
					</span>
					<h2 id="sample-title">{subpage.sample.title}</h2>
					<p>{subpage.sample.note}</p>
				</div>
				{SAMPLES[subpage.sample.kind]()}
				<p className="sample-disclaimer">{t('subpage.sample.disclaimer')}</p>
			</section>

			<section className="section deliverables">
				<div className="section-heading">
					<span className="eyebrow">
						<i /> {t('subpage.deliverables.eyebrow')}
					</span>
					<h2>
						{t('subpage.deliverables.title')}
						<br />
						{t('subpage.deliverables.titleAccent')}
					</h2>
					<p>{t('subpage.deliverables.lede')}</p>
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
						<i /> {t('subpage.connects.eyebrow')}
					</span>
					<h2>
						{t('subpage.connects.title')}
						<br />
						{t('subpage.connects.titleAccent')}
					</h2>
					<p>{t('subpage.connects.lede')}</p>
				</div>
				<div className="related-grid">
					{subpage.connects.map(item => {
						const target = disciplineNav.find(entry => entry.slug === item.discipline);
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
						<i /> {t('subpage.faq.eyebrow')}
					</span>
					<h2>
						{t('subpage.faq.title')}
						<br />
						{t('subpage.faq.titleAccent')}
					</h2>
					<p>{t('subpage.faq.lede')}</p>
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
						<i /> {t('subpage.more', { name: discipline.name.toLocaleUpperCase(locale) })}
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
