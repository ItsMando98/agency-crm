import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import {
	motion,
	useInView,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
	type MotionValue,
} from 'framer-motion';
import { disciplines } from '@/data/expertise';
import { Magnetic } from '@/components/motion/primitives';
import { clamp } from '@/lib/motion-math';

const WORD = 'ROASWELL';

const FOOTER_LINKS = [
	{ label: 'Work', to: '/work' },
	{ label: 'Approach', to: '/approach' },
	{ label: 'Insights', to: '/insights' },
	{ label: 'About', to: '/about' },
	{ label: 'Contact', to: '/contact' },
];

type LetterProps = {
	char: string;
	index: number;
	progress: MotionValue<number>;
	pointerX: MotionValue<number>;
};

function WordmarkLetter({ char, index, progress, pointerX }: LetterProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const reduced = useReducedMotion();
	const start = 0.18 + index * 0.07;
	const rise = useTransform(progress, [start, start + 0.3], ['108%', '0%'], { clamp: true });

	const proximity = useTransform(pointerX, x => {
		const element = ref.current;
		if (!element || reduced || x < -500) return 0;
		const rect = element.getBoundingClientRect();
		return clamp(1 - Math.abs(x - (rect.left + rect.width / 2)) / (rect.width * 1.7));
	});
	const lift = useSpring(useTransform(proximity, [0, 1], [0, -22]), { stiffness: 260, damping: 20 });
	const color = useTransform(proximity, [0, 1], ['rgba(244, 241, 234, 0.09)', 'rgba(255, 52, 72, 0.95)']);
	const stroke = useTransform(proximity, [0, 1], ['rgba(244, 241, 234, 0.38)', 'rgba(255, 120, 132, 1)']);
	const glow = useTransform(proximity, [0, 1], ['0 0 0 rgba(255, 52, 72, 0)', '0 0 42px rgba(255, 52, 72, 0.75)']);

	return (
		<motion.span className="wm-lift" style={{ y: lift }}>
			<span className="wm-mask">
				<motion.span style={{ y: rise }} className="wm-rise">
					<motion.span
						ref={ref}
						className="wm-letter"
						style={{ color, WebkitTextStrokeColor: stroke, textShadow: glow }}
					>
						{char}
					</motion.span>
				</motion.span>
			</span>
		</motion.span>
	);
}

function FooterWordmark({ progress }: { progress: MotionValue<number> }) {
	const measureRef = useRef<HTMLSpanElement>(null);
	const rowRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<number | null>(null);
	const pointerX = useMotionValue(-9999);

	useLayoutEffect(() => {
		const row = rowRef.current;
		const measure = measureRef.current;
		if (!row || !measure) return;
		const fit = () => {
			const available = row.clientWidth;
			const natural = measure.getBoundingClientRect().width;
			if (available > 0 && natural > 0) setSize((available / natural) * 100);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(row);
		document.fonts?.ready.then(fit);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			className="footer-wordmark"
			onPointerMove={event => pointerX.set(event.clientX)}
			onPointerLeave={() => pointerX.set(-9999)}
		>
			<div ref={rowRef} className="wm-row" role="img" aria-label="Roaswell" style={size ? { fontSize: `${size}px` } : undefined}>
				<span ref={measureRef} className="wm-measure" aria-hidden="true">
					{WORD.split('').map((char, index) => (
						<span key={`${char}-${index}`} className="wm-mask">
							<span className="wm-rise">
								<span className="wm-letter">{char}</span>
							</span>
						</span>
					))}
				</span>
				{WORD.split('').map((char, index) => (
					<WordmarkLetter key={`${char}-${index}`} char={char} index={index} progress={progress} pointerX={pointerX} />
				))}
			</div>
		</div>
	);
}

function FooterVideo({ progress }: { progress: MotionValue<number> }) {
	const ref = useRef<HTMLVideoElement>(null);
	const wrapRef = useRef<HTMLDivElement>(null);
	const inView = useInView(wrapRef, { margin: '200px 0px 0px 0px' });
	const reduced = useReducedMotion();
	const y = useTransform(progress, [0, 1], ['-8%', '0%']);

	useEffect(() => {
		const video = ref.current;
		if (!video || reduced) return;
		if (inView) {
			video.play().catch(() => undefined);
		} else {
			video.pause();
		}
	}, [inView, reduced]);

	return (
		<div ref={wrapRef} className="footer-media" aria-hidden="true">
			<motion.video
				ref={ref}
				className="footer-video"
				style={{ y }}
				muted
				loop
				playsInline
				preload="none"
				poster="/footer-poster.jpg"
			>
				<source src="/footer-loop.webm" type="video/webm" />
				<source src="/footer-loop.mp4" type="video/mp4" />
			</motion.video>
			<div className="footer-media-fade" />
		</div>
	);
}

function BackToTop() {
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll();
	const draw = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

	return (
		<button
			type="button"
			className="back-to-top"
			aria-label="Back to top"
			onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
		>
			<svg viewBox="0 0 48 48" aria-hidden="true">
				<circle cx="24" cy="24" r="21" className="track" />
				<motion.circle cx="24" cy="24" r="21" className="bar" style={{ pathLength: draw }} />
			</svg>
			<ArrowUp size={18} />
		</button>
	);
}

export function SiteFooter() {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });

	return (
		<footer ref={ref} className="site-footer">
			<FooterVideo progress={scrollYProgress} />

			<div className="footer-inner">
				<div className="footer-cta">
					<span className="eyebrow">
						<i /> START A PROJECT
					</span>
					<p className="footer-tagline">
						Marketing
						<br />
						done <em>well.</em>
					</p>
					<p className="footer-lede">
						Four disciplines, one growth system. Senior-led from the first call to the last report.
					</p>
					<div className="footer-actions">
						<Magnetic>
							<Link className="button primary" to="/contact">
								Let’s talk <ArrowUpRight size={19} />
							</Link>
						</Magnetic>
						<a className="footer-email" href="mailto:hello@roaswell.com">
							hello@roaswell.com
						</a>
					</div>
				</div>

				<nav className="footer-services" aria-label="Services">
					<span className="eyebrow">
						<i /> WHAT WE DO
					</span>
					<ul>
						{disciplines.map(discipline => (
							<li key={discipline.slug}>
								<Link to={`/expertise/${discipline.slug}`}>
									<span className="fs-number">{discipline.number}</span>
									<span className="fs-name">{discipline.name}</span>
									<ArrowUpRight className="fs-arrow" size={28} />
								</Link>
							</li>
						))}
					</ul>
				</nav>
			</div>

			<nav className="footer-links" aria-label="Footer navigation">
				{FOOTER_LINKS.map(link => (
					<Link key={link.to} to={link.to}>
						{link.label}
					</Link>
				))}
				<a href="https://client.roaswell.com" target="_blank" rel="noopener noreferrer">
					Client Portal <ArrowUpRight size={14} />
				</a>
			</nav>

			<FooterWordmark progress={scrollYProgress} />

			<div className="footer-bottom">
				<span>© 2026 ROASWELL</span>
				<span className="footer-note">Independent digital growth studio</span>
				<BackToTop />
			</div>
		</footer>
	);
}
