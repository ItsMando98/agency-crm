import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import {
	motion,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
	type MotionValue,
} from 'framer-motion';
import { Link, Lines, useT } from '@/i18n/context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useDisciplineNav } from '@/lib/use-root-data';
import { Magnetic } from '@/components/motion/primitives';
import { clamp } from '@/lib/motion-math';

const WORD = 'ROASWELL';

const FOOTER_LINKS = [
	{ key: 'nav.work', to: '/work' },
	{ key: 'nav.approach', to: '/approach' },
	{ key: 'nav.insights', to: '/insights' },
	{ key: 'nav.about', to: '/about' },
	{ key: 'nav.contact', to: '/contact' },
] as const;

const LEGAL_LINKS = [
	{ key: 'footer.legal', to: '/legal' },
	{ key: 'footer.privacy', to: '/privacy' },
] as const;

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
			<div ref={rowRef} className="wm-row" role="img" aria-label="ROASWELL" style={size ? { fontSize: `${size}px` } : undefined}>
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

function BackToTop() {
	const t = useT();
	const reduced = useReducedMotion();
	const { scrollYProgress } = useScroll();
	const draw = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

	return (
		<button
			type="button"
			className="back-to-top"
			aria-label={t('footer.backToTop')}
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
	const t = useT();
	const disciplines = useDisciplineNav();
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });

	return (
		<footer ref={ref} className="site-footer">

			<div className="footer-inner">
				<div className="footer-cta">
					<span className="eyebrow">
						<i /> {t('footer.eyebrow')}
					</span>
					<p className="footer-tagline">
						<Lines text={t('footer.tagline')} /> <em>{t('footer.taglineAccent')}</em>
					</p>
					<p className="footer-lede">{t('footer.lede')}</p>
					<div className="footer-actions">
						<Magnetic>
							<Link className="button primary" to="/contact">
								{t('cta.talkShort')} <ArrowUpRight size={19} />
							</Link>
						</Magnetic>
						<a className="footer-email" href="mailto:hello@roaswell.com">
							hello@roaswell.com
						</a>
					</div>
				</div>

				<nav className="footer-services" aria-label={t('footer.services')}>
					<span className="eyebrow">
						<i /> {t('footer.services')}
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

			<nav className="footer-links" aria-label={t('footer.navigation')}>
				{FOOTER_LINKS.map(link => (
					<Link key={link.to} to={link.to}>
						{t(link.key)}
					</Link>
				))}
				<a href="https://client.roaswell.com" target="_blank" rel="noopener noreferrer">
					{t('footer.portal')} <ArrowUpRight size={14} />
				</a>
			</nav>

			<LanguageSwitcher variant="list" />

			<FooterWordmark progress={scrollYProgress} />

			<div className="footer-bottom">
				<span>© 2026 ROASWELL</span>
				<span className="footer-note">{t('footer.note')}</span>
				<nav className="footer-legal" aria-label={t('footer.legalNavigation')}>
					{LEGAL_LINKS.map(link => (
						<Link key={link.to} to={link.to}>
							{t(link.key)}
						</Link>
					))}
				</nav>
				<BackToTop />
			</div>
		</footer>
	);
}
