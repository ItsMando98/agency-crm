import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EASE_OUT, Magnetic, MaskedLines } from '@/components/motion/primitives';
import { LoopVideo } from '@/components/motion/loop-video';

const DISCIPLINES = ['SEO & CONTENT', 'META ADS', 'GOOGLE ADS', 'MOTION GRAPHICS'];

export function Hero() {
	const ref = useRef<HTMLElement>(null);
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

	const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -120]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
	const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.12]);

	return (
		<section ref={ref} className="hero" aria-labelledby="hero-title">
			<div className="hero-media" aria-hidden="true">
				<LoopVideo name="hero-loop" poster="/hero-poster.jpg" className="hero-video" style={{ scale: mediaScale }} eager />
				<div className="hero-shade" />
			</div>

			<motion.div className="hero-content" style={{ opacity: contentOpacity }}>
				<motion.span
					className="eyebrow"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
				>
					<i /> INDEPENDENT DIGITAL GROWTH STUDIO
				</motion.span>

				<motion.h1 id="hero-title" style={{ y: titleY }}>
					<MaskedLines
						trigger="mount"
						delay={0.3}
						lines={[
							'MARKETING',
							<>
								DONE <span className="well">WELL.</span>
							</>,
						]}
					/>
				</motion.h1>

				<motion.div
					className="hero-bottom"
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.1, delay: 1.1, ease: EASE_OUT }}
				>
					<p>Search, paid media and motion, engineered as one growth system. Senior-led and measured to the dollar.</p>
					<div className="hero-actions">
						<Magnetic>
							<Link className="button primary" to="/contact">
								Let’s make it count <ArrowUpRight size={19} />
							</Link>
						</Magnetic>
						<Link className="hero-link" to="/work">
							See how we think
						</Link>
					</div>
				</motion.div>
			</motion.div>

			<motion.div
				className="hero-foot"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 1.5 }}
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
