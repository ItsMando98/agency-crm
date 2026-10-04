import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
	AnimatePresence,
	motion,
	Reorder,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from 'framer-motion';
import { Counter, Magnetic } from '@/components/motion/primitives';

function SpringToggle() {
	const [on, setOn] = useState(true);
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label="Spring toggle demo"
			className={on ? 'lab-toggle on' : 'lab-toggle'}
			onClick={() => setOn(current => !current)}
		>
			<motion.span layout className="lab-knob" transition={{ type: 'spring', stiffness: 520, damping: 30 }} />
			<AnimatePresence mode="wait" initial={false}>
				<motion.span
					key={on ? 'on' : 'off'}
					className="lab-toggle-label"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					transition={{ duration: 0.16 }}
				>
					{on ? 'ON' : 'OFF'}
				</motion.span>
			</AnimatePresence>
		</button>
	);
}

function MagneticButton() {
	const [ripple, setRipple] = useState(0);
	return (
		<Magnetic strength={0.4}>
			<button type="button" className="lab-magnet" onClick={() => setRipple(current => current + 1)}>
				{ripple > 0 && (
					<motion.span
						key={ripple}
						className="lab-ripple"
						initial={{ scale: 0, opacity: 0.6 }}
						animate={{ scale: 5, opacity: 0 }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
					/>
				)}
				<span>Pull me in</span>
			</button>
		</Magnetic>
	);
}

function TiltCard() {
	const reduced = useReducedMotion();
	const x = useMotionValue(0.5);
	const y = useMotionValue(0.5);
	const springX = useSpring(x, { stiffness: 180, damping: 18 });
	const springY = useSpring(y, { stiffness: 180, damping: 18 });
	const rotateY = useTransform(springX, [0, 1], [-14, 14]);
	const rotateX = useTransform(springY, [0, 1], [12, -12]);
	const glareX = useTransform(springX, [0, 1], [0, 100]);
	const glareY = useTransform(springY, [0, 1], [0, 100]);
	const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 55%)`;

	function handleMove(event: React.PointerEvent<HTMLDivElement>) {
		if (reduced) return;
		const rect = event.currentTarget.getBoundingClientRect();
		x.set((event.clientX - rect.left) / rect.width);
		y.set((event.clientY - rect.top) / rect.height);
	}

	function reset() {
		x.set(0.5);
		y.set(0.5);
	}

	return (
		<div className="lab-tilt-wrap" onPointerMove={handleMove} onPointerLeave={reset}>
			<motion.div className="lab-tilt" style={{ rotateX, rotateY, transformPerspective: 700 }}>
				<motion.div className="lab-tilt-glare" style={{ background: glare }} />
				<span>04</span>
				<strong>Depth</strong>
			</motion.div>
		</div>
	);
}

function MenuMorph() {
	const [open, setOpen] = useState(false);
	const transition = { type: 'spring' as const, stiffness: 420, damping: 28 };
	return (
		<button type="button" className="lab-menu" aria-label="Menu morph demo" aria-pressed={open} onClick={() => setOpen(current => !current)}>
			<svg viewBox="0 0 40 40" width="56" height="56" aria-hidden="true">
				<motion.line x1="8" x2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" animate={{ y1: open ? 20 : 12, y2: open ? 20 : 12, rotate: open ? 45 : 0 }} style={{ transformOrigin: '20px 20px' }} transition={transition} />
				<motion.line x1="8" x2="32" y1="20" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }} style={{ transformOrigin: '20px 20px' }} transition={{ duration: 0.18 }} />
				<motion.line x1="8" x2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" animate={{ y1: open ? 20 : 28, y2: open ? 20 : 28, rotate: open ? -45 : 0 }} style={{ transformOrigin: '20px 20px' }} transition={transition} />
			</svg>
		</button>
	);
}

function ProgressRing() {
	const [run, setRun] = useState(0);
	return (
		<div className="lab-ring">
			<svg viewBox="0 0 120 120" aria-hidden="true">
				<circle cx="60" cy="60" r="48" className="track" />
				<motion.circle
					key={run}
					cx="60"
					cy="60"
					r="48"
					className="bar"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 0.82 }}
					transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
				/>
			</svg>
			<strong>
				<Counter key={run} to={82} suffix="%" duration={1.6} />
			</strong>
			<button type="button" onClick={() => setRun(current => current + 1)}>
				Replay
			</button>
		</div>
	);
}

function ReorderList() {
	const [items, setItems] = useState(['Brief', 'Boards', 'Animate', 'Ship']);
	return (
		<Reorder.Group axis="y" values={items} onReorder={setItems} className="lab-reorder">
			{items.map(item => (
				<Reorder.Item key={item} value={item} whileDrag={{ scale: 1.04, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
					<i />
					{item}
				</Reorder.Item>
			))}
		</Reorder.Group>
	);
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#';

function ScrambleText({ text }: { text: string }) {
	const reduced = useReducedMotion();
	const [display, setDisplay] = useState(text);
	const frame = useRef(0);

	useEffect(() => () => cancelAnimationFrame(frame.current), []);

	function scramble() {
		if (reduced) return;
		cancelAnimationFrame(frame.current);
		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min(1, (now - start) / 800);
			const resolved = Math.floor(progress * text.length);
			setDisplay(
				text
					.split('')
					.map((char, index) => (index < resolved || char === ' ' ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
					.join(''),
			);
			if (progress < 1) frame.current = requestAnimationFrame(tick);
		};
		frame.current = requestAnimationFrame(tick);
	}

	return (
		<button type="button" className="lab-scramble" onPointerEnter={scramble} onFocus={scramble} aria-label={text}>
			<span aria-hidden="true">{display}</span>
		</button>
	);
}

type Demo = { title: string; note: string; tag: string; wide?: boolean; node: ReactNode };

const DEMOS: Demo[] = [
	{ title: 'Spring toggle', note: 'A spring, not a tween. It overshoots a hair and settles, so it feels physical.', tag: 'spring 520 / 30', node: <SpringToggle /> },
	{ title: 'Magnetic pull', note: 'The control leans toward the pointer. Click for a ripple from the touch point.', tag: 'strength 0.4', node: <MagneticButton /> },
	{ title: 'Depth tilt', note: 'A card that reads the pointer and tilts in 3D with a moving highlight.', tag: 'perspective 700', node: <TiltCard /> },
	{ title: 'Menu morph', note: 'Three lines become a cross. One icon, two states, no swapping assets.', tag: 'spring 420 / 28', node: <MenuMorph /> },
	{ title: 'Progress ring', note: 'A stroke that draws on an ease-out curve while the number counts to match.', tag: 'ease 0.16, 1, 0.3, 1', node: <ProgressRing /> },
	{ title: 'Drag to reorder', note: 'Grab a step and move it. Neighbours make room as you go.', tag: 'layout animation', node: <ReorderList /> },
	{ title: 'Text scramble', note: 'Hover the word. Characters resolve left to right, like a decoder locking on.', tag: '800 ms', wide: true, node: <ScrambleText text="MOTION WITH A REASON" /> },
];

export function UiMotionLab() {
	return (
		<div className="lab-grid">
			{DEMOS.map(demo => (
				<article key={demo.title} className={demo.wide ? 'lab-card wide' : 'lab-card'}>
					<div className="lab-demo">{demo.node}</div>
					<div className="lab-meta">
						<h3>{demo.title}</h3>
						<p>{demo.note}</p>
						<span>{demo.tag}</span>
					</div>
				</article>
			))}
		</div>
	);
}
