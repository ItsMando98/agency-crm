import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import {
	motion,
	useMotionTemplate,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from 'framer-motion';
import { EASE_OUT, Magnetic, MaskedLines } from '@/components/motion/primitives';

const CURVE = 'M-20 740 C 160 716 260 700 380 646 S 590 566 710 506 S 860 432 980 372';
const BAR_HEIGHTS = [14, 18, 17, 24, 29, 27, 35, 41, 38, 49, 55, 53, 63, 70, 74, 84];

const HUD = [
	{ index: '01', label: 'Intent captured', path: 'M0 30 C 14 28 20 24 32 22 S 52 14 64 8 S 80 4 90 2' },
	{ index: '02', label: 'Demand built', path: 'M0 32 C 10 30 24 28 36 20 S 56 18 66 10 S 82 6 90 3' },
	{ index: '03', label: 'Return accelerated', path: 'M0 34 C 18 33 30 30 42 24 S 60 10 72 6 S 84 2 90 1' },
];

function HudCard({ index, label, path, order }: { index: string; label: string; path: string; order: number }) {
	return (
		<motion.div
			className="hud-card"
			initial={{ opacity: 0, x: 40 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 1.2, delay: 1.3 + order * 0.18, ease: EASE_OUT }}
		>
			<span className="hud-index">{index}</span>
			<span className="hud-label">{label}</span>
			<svg viewBox="0 0 90 36" aria-hidden="true">
				<motion.path
					d={path}
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1.8, delay: 1.6 + order * 0.18, ease: EASE_OUT }}
				/>
			</svg>
		</motion.div>
	);
}

export function Hero() {
	const ref = useRef<HTMLElement>(null);
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

	const titleY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -180]);
	const titleScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 0.88]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
	const curveY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 160]);
	const barsY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 280]);
	const hudY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -260]);

	const pointerX = useSpring(60, { stiffness: 60, damping: 20 });
	const pointerY = useSpring(40, { stiffness: 60, damping: 20 });
	const glow = useMotionTemplate`radial-gradient(640px circle at ${pointerX}% ${pointerY}%, rgba(255, 52, 72, 0.26), transparent 62%)`;

	function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
		if (reduced || event.pointerType !== 'mouse') return;
		const rect = event.currentTarget.getBoundingClientRect();
		pointerX.set(((event.clientX - rect.left) / rect.width) * 100);
		pointerY.set(((event.clientY - rect.top) / rect.height) * 100);
	}

	return (
		<section ref={ref} className="hero" aria-labelledby="hero-title" onPointerMove={handlePointerMove}>
			<div className="hero-stage" aria-hidden="true">
				<div className="hero-grid" />
				<motion.div className="hero-glow" style={{ background: glow }} />
				<motion.div className="hero-bars" style={{ y: barsY }}>
					{BAR_HEIGHTS.map((height, index) => (
						<motion.i
							key={index}
							style={{ height: `${height}%` }}
							initial={{ scaleY: 0 }}
							animate={{ scaleY: 1 }}
							transition={{ duration: 1.4, delay: 0.5 + index * 0.05, ease: EASE_OUT }}
						/>
					))}
				</motion.div>
				<motion.svg className="hero-curve" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ y: curveY }}>
					<defs>
						<linearGradient id="curve-gradient" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0" stopColor="#ff3448" stopOpacity="0" />
							<stop offset="0.35" stopColor="#ff3448" stopOpacity="0.9" />
							<stop offset="1" stopColor="#ffffff" />
						</linearGradient>
					</defs>
					<motion.path
						d={CURVE}
						className="curve-glow"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 3.2, delay: 0.5, ease: EASE_OUT }}
					/>
					<motion.path
						d={CURVE}
						className="curve-line"
						stroke="url(#curve-gradient)"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 3.2, delay: 0.5, ease: EASE_OUT }}
					/>
					<motion.g
						initial={{ opacity: 0, scale: 0.4 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 3.4, ease: EASE_OUT }}
						style={{ transformOrigin: '980px 372px' }}
					>
						<circle cx="980" cy="372" r="7" fill="#fff" />
						<circle cx="980" cy="372" r="7" className="curve-pulse" />
					</motion.g>
				</motion.svg>
			</div>

			<motion.div className="hero-content" style={{ opacity: contentOpacity }}>
				<motion.div
					className="hero-top"
					initial={{ opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.2, ease: EASE_OUT }}
				>
					<span className="eyebrow">
						<i /> INDEPENDENT DIGITAL GROWTH STUDIO
					</span>
					<span className="hero-note">Built for billion-dollar ambition.</span>
				</motion.div>

				<motion.h1 id="hero-title" style={{ y: titleY, scale: titleScale }}>
					<MaskedLines
						trigger="mount"
						delay={0.25}
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
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1.1, delay: 1.1, ease: EASE_OUT }}
				>
					<p>
						Search, paid media and motion engineered as one growth system.
						<br />
						Senior-led. Measured to the dollar. Built to scale.
					</p>
					<Magnetic>
						<Link className="button primary" to="/contact">
							Let’s make it count <ArrowUpRight size={19} />
						</Link>
					</Magnetic>
					<Link className="button ghost" to="/work">
						See how we think
					</Link>
				</motion.div>
			</motion.div>

			<motion.div className="hero-hud" style={{ y: hudY }} aria-hidden="true">
				{HUD.map((item, order) => (
					<HudCard key={item.index} {...item} order={order} />
				))}
			</motion.div>

			<div className="hero-foot">
				<span>SEO & CONTENT</span>
				<span>META ADS</span>
				<span>GOOGLE ADS</span>
				<span>MOTION GRAPHICS</span>
				<span className="scroll-cue" aria-hidden="true">
					SCROLL <i />
				</span>
			</div>
		</section>
	);
}
