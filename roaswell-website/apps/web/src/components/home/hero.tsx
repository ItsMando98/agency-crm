import { useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EASE_OUT, Magnetic, MaskedLines } from '@/components/motion/primitives';
import { Link, Lines, useI18n, useT } from '@/i18n/context';
import { usePrimaryCta } from '@/lib/use-root-data';
import { HeroCanvas } from './hero-canvas';
import { NODES, curveX, curveY, timeForReveal } from './hero-curve';

const DISCIPLINE_KEYS = [
	'hero.discipline.seo',
	'hero.discipline.meta',
	'hero.discipline.google',
	'hero.discipline.motion',
] as const;

export function Hero() {
	const t = useT();
	const { direction } = useI18n();
	const cta = usePrimaryCta();
	const ref = useRef<HTMLElement>(null);
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

	const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -140]);
	const titleScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.9]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
	const stageY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120]);

	return (
		<section ref={ref} className="hero" aria-labelledby="hero-title">
			<motion.div className="hero-stage" style={{ y: stageY }} aria-hidden="true">
				<HeroCanvas />
				{NODES.map(node => (
					<div
						key={node.index}
						className="hero-node-wrap"
						style={{ left: `${(direction === 'rtl' ? 1 - curveX(node.u) : curveX(node.u)) * 100}%`, top: `${curveY(node.u) * 100}%` }}
					>
						<motion.div
							className="hero-node"
							initial={{ opacity: 0, x: 14 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: reduced ? 0 : timeForReveal(node.u), ease: EASE_OUT }}
						>
							<span className="hn-index">{node.index}</span>
							{t(node.labelKey)}
						</motion.div>
					</div>
				))}
			</motion.div>

			<motion.div className="hero-content" style={{ opacity: contentOpacity }}>
				<motion.span
					className="eyebrow"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
				>
					<i /> {t('hero.eyebrow')}
				</motion.span>

				<motion.h1 id="hero-title" style={{ y: titleY, scale: titleScale }}>
					<MaskedLines
						trigger="mount"
						delay={0.3}
						lines={[
							t('hero.line1'),
							<>
								{t('hero.line2')}{' '}
								<span className="well">
									{t('hero.line2Accent')}
									<span className="period">.</span>
									<svg viewBox="0 0 600 22" preserveAspectRatio="none" aria-hidden="true">
										<motion.path
											d="M2 15 Q300 -5 598 10"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 1.1, delay: 1.5, ease: EASE_OUT }}
										/>
									</svg>
								</span>
							</>,
						]}
					/>
				</motion.h1>

				<motion.div
					className="hero-bottom"
					initial={{ opacity: 0, y: 28 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.1, delay: 1.1, ease: EASE_OUT }}
				>
					<p>
						<Lines text={t('hero.lede')} />
					</p>
					<div className="hero-actions">
						<Magnetic>
							{cta.external ? (
								<a className="hero-cta" href={cta.href} target="_blank" rel="noopener noreferrer">
									<span>{t(cta.labelKey)}</span>
									<span className="hero-cta-icon">
										<ArrowUpRight size={22} />
									</span>
								</a>
							) : (
								<Link className="hero-cta" to={cta.href}>
									<span>{t(cta.labelKey)}</span>
									<span className="hero-cta-icon">
										<ArrowUpRight size={22} />
									</span>
								</Link>
							)}
						</Magnetic>
						<Link className="hero-ghost" to="/work">
							<span>{t('hero.secondary')}</span>
							<ArrowRight size={20} />
						</Link>
					</div>
				</motion.div>
			</motion.div>

			<motion.div
				className="hero-foot"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 1.6 }}
			>
				{DISCIPLINE_KEYS.map(key => (
					<span key={key}>{t(key)}</span>
				))}
				<span className="scroll-cue" aria-hidden="true">
					{t('hero.scroll')} <i />
				</span>
			</motion.div>
		</section>
	);
}
