import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EASE_OUT, Magnetic, MaskedLines } from '@/components/motion/primitives';
import { HeroCanvas } from './hero-canvas';
import { NODES, curveX, curveY, timeForReveal } from './hero-curve';

const DISCIPLINES = ['SEO & CONTENT', 'META ADS', 'GOOGLE ADS', 'MOTION GRAPHICS'];

export function Hero() {
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
						style={{ left: `${curveX(node.u) * 100}%`, top: `${curveY(node.u) * 100}%` }}
					>
						<motion.div
							className="hero-node"
							initial={{ opacity: 0, x: 14 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: reduced ? 0 : timeForReveal(node.u), ease: EASE_OUT }}
						>
							<span className="hn-index">{node.index}</span>
							{node.label}
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
					<i /> INDEPENDENT DIGITAL GROWTH STUDIO
				</motion.span>

				<motion.h1 id="hero-title" style={{ y: titleY, scale: titleScale }}>
					<MaskedLines
						trigger="mount"
						delay={0.3}
						lines={[
							'MARKETING',
							<>
								DONE{' '}
								<span className="well">
									WELL<span className="period">.</span>
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
						Search, paid media and motion, engineered as one growth system.
						<br />
						Senior-led. Measured to the dollar. Built to scale.
					</p>
					<div className="hero-actions">
						<Magnetic>
							<Link className="hero-cta" to="/contact">
								<span>Let’s make it count</span>
								<span className="hero-cta-icon">
									<ArrowUpRight size={22} />
								</span>
							</Link>
						</Magnetic>
						<Link className="hero-ghost" to="/work">
							<span>See how we think</span>
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
				{DISCIPLINES.map(label => (
					<span key={label}>{label}</span>
				))}
				<span className="scroll-cue" aria-hidden="true">
					SCROLL <i />
				</span>
			</motion.div>
		</section>
	);
}
