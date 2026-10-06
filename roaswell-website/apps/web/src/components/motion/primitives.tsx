import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
	animate,
	motion,
	useInView,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
	type MotionValue,
} from 'framer-motion';
import { useLocale } from '@/i18n/context';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
	children: ReactNode;
	delay?: number;
	y?: number;
	className?: string;
	as?: 'div' | 'p' | 'span' | 'li' | 'h2' | 'h3';
};

export function Reveal({ children, delay = 0, y = 40, className, as = 'div' }: RevealProps) {
	const reduced = useReducedMotion();
	const Tag = motion[as];
	return (
		<Tag
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '0px 0px -12% 0px' }}
			transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : delay, ease: EASE_OUT }}
		>
			{children}
		</Tag>
	);
}

type MaskedLinesProps = {
	lines: ReactNode[];
	className?: string;
	lineClassName?: string;
	delay?: number;
	stagger?: number;
	trigger?: 'mount' | 'view';
};

export function MaskedLines({
	lines,
	className,
	lineClassName,
	delay = 0,
	stagger = 0.12,
	trigger = 'view',
}: MaskedLinesProps) {
	const reduced = useReducedMotion();
	const animateProps =
		trigger === 'mount'
			? { animate: 'shown' }
			: { whileInView: 'shown', viewport: { once: true, margin: '0px 0px -10% 0px' } };

	return (
		<span className={className} style={{ display: 'block' }}>
			{lines.map((line, index) => (
				<span key={index} className="mask-line">
					<motion.span
						className={lineClassName}
						style={{ display: 'block' }}
						initial="hidden"
						variants={{
							hidden: { y: '115%', rotate: 3 },
							shown: {
								y: '0%',
								rotate: 0,
								transition: {
									duration: reduced ? 0 : 1.1,
									delay: reduced ? 0 : delay + index * stagger,
									ease: EASE_OUT,
								},
							},
						}}
						{...animateProps}
					>
						{line}
					</motion.span>
				</span>
			))}
		</span>
	);
}

type ScrollWordsProps = {
	text: string;
	className?: string;
};

type WordChunk = { text: string; accent: boolean };

const UNSPACED_LOCALES = new Set(['ja', 'zh', 'zh-hant', 'th']);
const UNSPACED_CHUNK_SIZE = 3;

function splitChunks(text: string, locale: string): WordChunk[] {
	const chunks: WordChunk[] = [];
	const pieces = text.split(/(\*[^*]+\*)/).filter(Boolean);

	for (const piece of pieces) {
		const accent = piece.startsWith('*') && piece.endsWith('*') && piece.length > 2;
		const content = accent ? piece.slice(1, -1) : piece;

		if (UNSPACED_LOCALES.has(locale)) {
			const graphemes = Array.from(new Intl.Segmenter(locale, { granularity: 'grapheme' }).segment(content), part => part.segment);
			for (let index = 0; index < graphemes.length; index += UNSPACED_CHUNK_SIZE) {
				chunks.push({ text: graphemes.slice(index, index + UNSPACED_CHUNK_SIZE).join(''), accent });
			}
			continue;
		}

		for (const word of content.split(/(?<=\s)/)) {
			if (word !== '') chunks.push({ text: word, accent });
		}
	}

	return chunks;
}

function ScrollWord({
	word,
	range,
	progress,
	accent,
}: {
	word: string;
	range: [number, number];
	progress: MotionValue<number>;
	accent: boolean;
}) {
	const opacity = useTransform(progress, range, [0.14, 1]);
	return (
		<motion.span className={accent ? 'scroll-word accent' : 'scroll-word'} style={{ opacity }}>
			{word}
		</motion.span>
	);
}

export function ScrollWords({ text, className }: ScrollWordsProps) {
	const ref = useRef<HTMLParagraphElement>(null);
	const locale = useLocale();
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
	const chunks = splitChunks(text, locale);

	return (
		<p ref={ref} className={className}>
			{chunks.map((chunk, index) => {
				const start = index / chunks.length;
				const end = Math.min(1, start + 2.5 / chunks.length);
				return (
					<ScrollWord
						key={`${chunk.text}-${index}`}
						word={chunk.text}
						range={[start, end]}
						progress={scrollYProgress}
						accent={chunk.accent}
					/>
				);
			})}
		</p>
	);
}

type CounterProps = {
	to: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	duration?: number;
	className?: string;
};

export function Counter({ to, decimals = 0, prefix = '', suffix = '', duration = 2, className }: CounterProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
	const reduced = useReducedMotion();
	const locale = useLocale();
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!inView) return;
		if (reduced) {
			setValue(to);
			return;
		}
		const controls = animate(0, to, {
			duration,
			ease: EASE_OUT,
			onUpdate: latest => setValue(latest),
		});
		return () => controls.stop();
	}, [inView, reduced, to, duration]);

	return (
		<span ref={ref} className={className}>
			{prefix}
			{value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false })}
			{suffix}
		</span>
	);
}

type MagneticProps = {
	children: ReactNode;
	strength?: number;
	className?: string;
};

export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
	const ref = useRef<HTMLDivElement>(null);
	const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
	const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

	function handleMove(event: React.PointerEvent<HTMLDivElement>) {
		if (event.pointerType !== 'mouse' || !ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
		y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
	}

	function handleLeave() {
		x.set(0);
		y.set(0);
	}

	return (
		<motion.div
			ref={ref}
			className={className}
			style={{ x, y, display: 'inline-block' }}
			onPointerMove={handleMove}
			onPointerLeave={handleLeave}
		>
			{children}
		</motion.div>
	);
}

export function useSectionProgress(offset: [string, string] = ['start end', 'end start']) {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: offset as ['start end', 'end start'],
	});
	return { ref, progress: scrollYProgress };
}

export function useSegment(progress: MotionValue<number>, from: number, to: number) {
	return useTransform(progress, [from, to], [0, 1], { clamp: true });
}
