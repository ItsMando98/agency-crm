import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import {
	AnimatePresence,
	motion,
	useMotionValueEvent,
	useScroll,
	useTransform,
	type MotionValue,
} from 'framer-motion';
import { disciplines } from '@/data/expertise';
import { EASE_OUT } from '@/components/motion/primitives';

const RED = '#ff3448';
const PAPER = '#f4f1ea';
const SCENE_COUNT = disciplines.length + 1;
const RAIL_LABELS = ['SEO', 'META', 'GOOGLE', 'MOTION', 'SYSTEM'];
const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'];

type SceneProps = { progress: MotionValue<number> };

const BAR_TARGETS = [0.2, 0.26, 0.24, 0.34, 0.42, 0.4, 0.52, 0.6, 0.66, 0.78, 0.88, 1];

function SeoBar({ index, progress }: { index: number } & SceneProps) {
	const delay = index * 0.035;
	const scaleY = useTransform(progress, [delay, delay + 0.55], [0.04, BAR_TARGETS[index]], { clamp: true });
	return (
		<motion.rect
			x={60 + index * 41}
			y={150}
			width={26}
			height={260}
			rx={3}
			fill={index === BAR_TARGETS.length - 1 ? RED : PAPER}
			fillOpacity={index === BAR_TARGETS.length - 1 ? 1 : 0.16 + index * 0.025}
			style={{ scaleY, transformBox: 'fill-box', transformOrigin: 'bottom' }}
		/>
	);
}

function SeoScene({ progress }: SceneProps) {
	const trend = useTransform(progress, [0.05, 1], [0, 1], { clamp: true });
	const rank = useTransform(progress, value => `#${Math.max(1, Math.round(9 - value * 8))}`);
	return (
		<svg viewBox="0 0 600 480" className="scene-svg" role="img" aria-label="Rankings and organic traffic climbing together">
			<rect x="60" y="30" width="480" height="52" rx="26" fill="none" stroke={PAPER} strokeOpacity="0.3" />
			<circle cx="92" cy="56" r="9" fill="none" stroke={PAPER} strokeWidth="2" />
			<line x1="99" y1="63" x2="108" y2="72" stroke={PAPER} strokeWidth="2" />
			<text x="124" y="62" className="svg-label" fill={PAPER}>best way to scale revenue</text>
			<motion.text x="500" y="63" textAnchor="end" className="svg-rank" fill={RED}>{rank}</motion.text>
			<line x1="48" y1="410" x2="552" y2="410" stroke={PAPER} strokeOpacity="0.35" />
			{BAR_TARGETS.map((_, index) => (
				<SeoBar key={index} index={index} progress={progress} />
			))}
			<motion.path
				d="M72 396 C 130 392 170 384 220 360 S 300 318 350 276 S 440 190 520 128"
				fill="none"
				stroke={RED}
				strokeWidth="4"
				strokeLinecap="round"
				style={{ pathLength: trend, filter: 'drop-shadow(0 0 10px rgba(255,52,72,.8))' }}
			/>
			<text x="60" y="446" className="svg-caption" fill={PAPER} fillOpacity="0.55">RELEVANCE x AUTHORITY x CONSISTENCY</text>
		</svg>
	);
}

const TILE_FILLS = ['#2b2b31', '#33262a', '#252a31', '#2c2b27', '#4a1219', '#262b2a', '#31272f', '#2a2a2a', '#272d33'];

function AdTile({ index, progress }: { index: number } & SceneProps) {
	const isWinner = index === 4;
	const column = index % 3;
	const row = Math.floor(index / 3);
	const opacity = useTransform(progress, [0.25 + (index % 4) * 0.05, 0.8], [1, isWinner ? 1 : 0.14], { clamp: true });
	const scale = useTransform(progress, [0.3, 0.9], [1, isWinner ? 1.14 : 0.92], { clamp: true });
	const tagOpacity = useTransform(progress, [0.75, 0.95], [0, 1], { clamp: true });
	const x = 44 + column * 174;
	const y = 36 + row * 134;
	return (
		<motion.g style={{ opacity, scale, transformOrigin: `${x + 80}px ${y + 60}px` }}>
			<rect x={x} y={y} width={160} height={120} rx={10} fill={TILE_FILLS[index]} stroke={isWinner ? RED : PAPER} strokeOpacity={isWinner ? 1 : 0.18} strokeWidth={isWinner ? 2 : 1} />
			<rect x={x + 14} y={y + 14} width={64} height={64} rx={6} fill={isWinner ? RED : PAPER} fillOpacity={isWinner ? 0.9 : 0.1 + (index % 3) * 0.03} />
			<rect x={x + 90} y={y + 18} width={54} height={7} rx={3.5} fill={PAPER} fillOpacity="0.35" />
			<rect x={x + 90} y={y + 34} width={38} height={7} rx={3.5} fill={PAPER} fillOpacity="0.2" />
			<rect x={x + 14} y={y + 92} width={90} height={9} rx={4.5} fill={PAPER} fillOpacity="0.28" />
			{isWinner && (
				<motion.g style={{ opacity: tagOpacity }}>
					<rect x={x + 88} y={y - 13} width={68} height={26} rx={13} fill={RED} />
					<text x={x + 122} y={y + 4} textAnchor="middle" className="svg-tag" fill="#fff">WINNER</text>
				</motion.g>
			)}
		</motion.g>
	);
}

function MetaScene({ progress }: SceneProps) {
	const ring = useTransform(progress, [0.5, 1], [0, 1], { clamp: true });
	const ringScale = useTransform(progress, [0.5, 1], [0.8, 1.9], { clamp: true });
	const ringOpacity = useTransform(progress, [0.5, 0.75, 1], [0, 0.7, 0], { clamp: true });
	const stepTwo = useTransform(progress, [0.25, 0.4], [0.3, 1], { clamp: true });
	const stepThree = useTransform(progress, [0.7, 0.85], [0.3, 1], { clamp: true });
	return (
		<svg viewBox="0 0 600 480" className="scene-svg" role="img" aria-label="Nine ad variants narrowing to one winner">
			<motion.circle
				cx="300"
				cy="238"
				r="90"
				fill="none"
				stroke={RED}
				strokeWidth="2"
				style={{ scale: ringScale, opacity: ringOpacity, transformOrigin: '300px 238px', pathLength: ring }}
			/>
			{TILE_FILLS.map((_, index) => (
				<AdTile key={index} index={index} progress={progress} />
			))}
			<text x="60" y="456" className="svg-caption" fill={PAPER} fillOpacity="0.9">HYPOTHESIS</text>
			<motion.text x="250" y="456" className="svg-caption" fill={PAPER} style={{ opacity: stepTwo }}>VARIANTS</motion.text>
			<motion.text x="420" y="456" className="svg-caption" fill={RED} style={{ opacity: stepThree }}>CLEAR WINNER</motion.text>
		</svg>
	);
}

const DOTS = Array.from({ length: 18 }, (_, index) => {
	const angle = (index * 137.5 * Math.PI) / 180;
	const startRadius = 190 + (index % 4) * 26;
	const endRadius = 6 + (index % 5) * 9;
	const round = (value: number) => Math.round(value * 10) / 10;
	return {
		startX: round(300 + Math.cos(angle) * startRadius),
		startY: round(238 + Math.sin(angle) * startRadius * 0.9),
		endX: round(300 + Math.cos(angle) * endRadius),
		endY: round(238 + Math.sin(angle) * endRadius),
		delay: (index % 6) * 0.05,
	};
});

function IntentDot({ dot, progress }: { dot: (typeof DOTS)[number] } & SceneProps) {
	const cx = useTransform(progress, [dot.delay, 0.85], [dot.startX, dot.endX], { clamp: true });
	const cy = useTransform(progress, [dot.delay, 0.85], [dot.startY, dot.endY], { clamp: true });
	const fill = useTransform(progress, [0.45, 0.85], ['#7d7b85', RED]);
	return <motion.circle cx={cx} cy={cy} r={5} fill={fill} />;
}

function GoogleScene({ progress }: SceneProps) {
	const ringDraw = useTransform(progress, [0, 0.4], [0, 1], { clamp: true });
	const coreRadius = useTransform(progress, [0.3, 1], [6, 34], { clamp: true });
	const coreOpacity = useTransform(progress, [0.3, 0.6], [0, 1], { clamp: true });
	const label = useTransform(progress, (value): string => (value > 0.8 ? 'INTENT CAPTURED' : 'INTENT IN MOTION'));
	return (
		<svg viewBox="0 0 600 480" className="scene-svg" role="img" aria-label="Scattered search intent converging on a single target">
			{[70, 130, 190].map(radius => (
				<motion.circle key={radius} cx="300" cy="238" r={radius} fill="none" stroke={PAPER} strokeOpacity="0.28" strokeWidth="1.5" style={{ pathLength: ringDraw }} />
			))}
			<line x1="300" y1="20" x2="300" y2="456" stroke={PAPER} strokeOpacity="0.1" />
			<line x1="60" y1="238" x2="540" y2="238" stroke={PAPER} strokeOpacity="0.1" />
			<motion.circle cx="300" cy="238" r={coreRadius} fill={RED} style={{ opacity: coreOpacity, filter: 'drop-shadow(0 0 18px rgba(255,52,72,.9))' }} />
			{DOTS.map((dot, index) => (
				<IntentDot key={index} dot={dot} progress={progress} />
			))}
			<motion.text x="300" y="462" textAnchor="middle" className="svg-caption" fill={PAPER}>{label}</motion.text>
		</svg>
	);
}

const TRACKS = [
	{ y: 322, from: 0.02, to: 0.55, fill: RED },
	{ y: 346, from: 0.18, to: 0.8, fill: PAPER },
	{ y: 370, from: 0.1, to: 0.95, fill: PAPER },
];
const KEYFRAMES = [0.12, 0.3, 0.5, 0.7, 0.9];

function TimelineBar({ track, progress }: { track: (typeof TRACKS)[number] } & SceneProps) {
	const scaleX = useTransform(progress, [track.from, track.to], [0, 1], { clamp: true });
	return (
		<motion.rect
			x={60}
			y={track.y}
			width={400}
			height={12}
			rx={6}
			fill={track.fill}
			fillOpacity={track.fill === RED ? 1 : 0.28}
			style={{ scaleX, transformBox: 'fill-box', transformOrigin: 'left' }}
		/>
	);
}

function Keyframe({ at, progress }: { at: number } & SceneProps) {
	const fill = useTransform(progress, [at - 0.02, at + 0.02], ['#26262b', RED]);
	return <motion.rect x={at * 400 + 56} y={314} width={9} height={9} rx={1.5} fill={fill} style={{ rotate: 45, transformOrigin: `${at * 400 + 60.5}px 318.5px` }} />;
}

function MotionScene({ progress }: SceneProps) {
	const playhead = useTransform(progress, [0, 1], [60, 460]);
	const timecode = useTransform(progress, (value): string => `00:0${Math.min(9, Math.floor(value * 10))}:${String(Math.floor((value * 240) % 24)).padStart(2, '0')}`);
	const ballX = useTransform(progress, [0, 0.5, 1], [120, 300, 480]);
	const ballY = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [210, 90, 210, 90, 210]);
	const ballScaleX = useTransform(progress, [0, 0.22, 0.25, 0.28, 0.5], [1, 0.9, 1.3, 0.9, 1]);
	const square = useTransform(progress, [0, 1], [0, 270]);
	const squareScale = useTransform(progress, [0, 0.5, 1], [0.6, 1.25, 0.6]);
	const trailDraw = useTransform(progress, [0, 1], [0, 1]);
	return (
		<svg viewBox="0 0 600 480" className="scene-svg" role="img" aria-label="A motion timeline scrubbing while an animated shape moves across the preview">
			<rect x="60" y="30" width="480" height="244" rx="14" fill="#0b0b0e" stroke={PAPER} strokeOpacity="0.2" />
			<motion.path
				d="M120 210 Q 210 20 300 210 T 480 210"
				fill="none"
				stroke={RED}
				strokeOpacity="0.55"
				strokeWidth="2"
				strokeDasharray="3 8"
				style={{ pathLength: trailDraw }}
			/>
			<motion.rect x={430} y={150} width={56} height={56} rx={8} fill="none" stroke={PAPER} strokeWidth="2.5" style={{ rotate: square, scale: squareScale, transformOrigin: '458px 178px' }} />
			<motion.circle cx={ballX} cy={ballY} r={26} fill={RED} style={{ scaleX: ballScaleX, filter: 'drop-shadow(0 0 16px rgba(255,52,72,.8))' }} />
			<motion.text x="76" y="56" className="svg-caption" fill={PAPER} fillOpacity="0.6">{timecode}</motion.text>
			<text x="524" y="56" textAnchor="end" className="svg-caption" fill={RED}>REC</text>
			<line x1="60" y1="304" x2="460" y2="304" stroke={PAPER} strokeOpacity="0.25" />
			{TRACKS.map(track => (
				<TimelineBar key={track.y} track={track} progress={progress} />
			))}
			{KEYFRAMES.map(at => (
				<Keyframe key={at} at={at} progress={progress} />
			))}
			<motion.line x1={playhead} x2={playhead} y1="296" y2="394" stroke="#fff" strokeWidth="2" />
			<motion.circle cx={playhead} cy="294" r="6" fill="#fff" />
			<text x="60" y="440" className="svg-caption" fill={PAPER} fillOpacity="0.55">KEYFRAMES x EASING x STORY</text>
		</svg>
	);
}

const NODES = [
	{ label: 'SEO', x: 300, y: 72 },
	{ label: 'META', x: 508, y: 250 },
	{ label: 'GOOGLE', x: 300, y: 428 },
	{ label: 'MOTION', x: 92, y: 250 },
];

function SystemNode({ node, index, progress }: { node: (typeof NODES)[number]; index: number } & SceneProps) {
	const scale = useTransform(progress, [index * 0.12, index * 0.12 + 0.3], [0, 1], { clamp: true });
	return (
		<motion.g style={{ scale, transformOrigin: `${node.x}px ${node.y}px` }}>
			<circle cx={node.x} cy={node.y} r="44" fill="#16161a" stroke={RED} strokeWidth="2" />
			<text x={node.x} y={node.y + 5} textAnchor="middle" className="svg-node" fill={PAPER}>{node.label}</text>
		</motion.g>
	);
}

function SystemScene({ progress }: SceneProps) {
	const draw = useTransform(progress, [0.25, 0.8], [0, 1], { clamp: true });
	const rotate = useTransform(progress, [0, 1], [0, 220]);
	const coreScale = useTransform(progress, [0.4, 1], [0.5, 1], { clamp: true });
	const coreOpacity = useTransform(progress, [0.4, 0.7], [0, 1], { clamp: true });
	return (
		<svg viewBox="0 0 600 480" className="scene-svg" role="img" aria-label="SEO, Meta, Google and Motion feeding a single compounding system">
			<motion.circle
				cx="300"
				cy="250"
				r="124"
				fill="none"
				stroke={PAPER}
				strokeOpacity="0.25"
				strokeDasharray="4 12"
				style={{ rotate, transformOrigin: '300px 250px' }}
			/>
			<motion.path d="M300 116 L 464 250 L 300 384 L 136 250 Z" stroke={RED} strokeWidth="2" fill="none" strokeLinejoin="round" style={{ pathLength: draw }} />
			<motion.g style={{ scale: coreScale, opacity: coreOpacity, transformOrigin: '300px 250px' }}>
				<circle cx="300" cy="250" r="56" fill={RED} style={{ filter: 'drop-shadow(0 0 28px rgba(255,52,72,.8))' }} />
				<text x="300" y="260" textAnchor="middle" className="svg-core" fill="#fff">ROAS</text>
			</motion.g>
			{NODES.map((node, index) => (
				<SystemNode key={node.label} node={node} index={index} progress={progress} />
			))}
		</svg>
	);
}

function Scene({ index, progress, children }: { index: number; children: (local: MotionValue<number>) => React.ReactNode } & SceneProps) {
	const start = index / SCENE_COUNT;
	const end = (index + 1) / SCENE_COUNT;
	const isFirst = index === 0;
	const isLast = index === SCENE_COUNT - 1;
	const opacity = useTransform(
		progress,
		[start - 0.03, start + 0.02, end - 0.02, end + 0.03],
		[isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0],
	);
	const y = useTransform(progress, [start - 0.03, start + 0.03], [isFirst ? 0 : 40, 0], { clamp: true });
	const local = useTransform(progress, [start, end], [0, 1], { clamp: true });
	return (
		<motion.div className="scene" style={{ opacity, y }}>
			{children(local)}
		</motion.div>
	);
}

type Copy = { number: string; name: string; headline: string; accent: string; summary: string; chips: string[]; to: string; cta: string };

const COPY: Copy[] = [
	...disciplines.map(discipline => ({
		number: discipline.number,
		name: discipline.name,
		headline: discipline.headline,
		accent: discipline.headlineAccent,
		summary: discipline.summary,
		chips: discipline.capabilities.slice(0, 4),
		to: `/expertise/${discipline.slug}`,
		cta: discipline.cta,
	})),
	{
		number: '05',
		name: 'One system',
		headline: 'Four engines.',
		accent: 'One result.',
		summary:
			'Each channel feeds the next. One strategy, one measurement framework and one senior team accountable for the number that actually matters: return.',
		chips: ['Shared data layer', 'One creative idea', 'Blended CAC', 'Incrementality'],
		to: '/contact',
		cta: 'Build yours with us',
	},
];

export function GrowthSystem() {
	const ref = useRef<HTMLElement>(null);
	const [active, setActive] = useState(0);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
	const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

	useMotionValueEvent(scrollYProgress, 'change', value => {
		setActive(Math.min(SCENE_COUNT - 1, Math.max(0, Math.floor(value * SCENE_COUNT))));
	});

	const copy = COPY[active];

	return (
		<section ref={ref} className="system" id="services" aria-labelledby="system-title">
			<div className="system-sticky">
				<div className="system-head">
					<span className="eyebrow">
						<i /> 01 / OUR EXPERTISE
					</span>
					<h2 id="system-title">
						{COUNT_WORDS[disciplines.length]} disciplines. <em>One growth system.</em>
					</h2>
				</div>

				<div className="system-body">
					<div className="system-copy" aria-live="polite">
						<AnimatePresence mode="wait">
							<motion.div
								key={active}
								initial={{ opacity: 0, y: 34 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -24 }}
								transition={{ duration: 0.5, ease: EASE_OUT }}
							>
								<span className="system-number">
									{copy.number} / {copy.name.toUpperCase()}
								</span>
								<h3>
									{copy.headline}
									<span>{copy.accent}</span>
								</h3>
								<p>{copy.summary}</p>
								<ul className="capability-list">
									{copy.chips.map(chip => (
										<li key={chip}>{chip}</li>
									))}
								</ul>
								<Link to={copy.to} className="discipline-cta">
									{copy.cta} <ArrowUpRight size={18} />
								</Link>
							</motion.div>
						</AnimatePresence>
					</div>

					<div className="system-visual">
						<div className="system-visual-frame">
							<Scene index={0} progress={scrollYProgress}>{local => <SeoScene progress={local} />}</Scene>
							<Scene index={1} progress={scrollYProgress}>{local => <MetaScene progress={local} />}</Scene>
							<Scene index={2} progress={scrollYProgress}>{local => <GoogleScene progress={local} />}</Scene>
							<Scene index={3} progress={scrollYProgress}>{local => <MotionScene progress={local} />}</Scene>
							<Scene index={4} progress={scrollYProgress}>{local => <SystemScene progress={local} />}</Scene>
						</div>
					</div>
				</div>

				<div className="system-rail" aria-hidden="true">
					<div className="rail-track">
						<motion.i style={{ width: fill }} />
					</div>
					<div className="rail-labels">
						{RAIL_LABELS.map((label, index) => (
							<span key={label} className={index === active ? 'on' : ''}>
								{label}
							</span>
						))}
					</div>
				</div>
			</div>

			<ul className="sr-only">
				{disciplines.map(discipline => (
					<li key={discipline.slug}>
						<Link to={`/expertise/${discipline.slug}`}>{discipline.name}</Link>: {discipline.summary}
					</li>
				))}
			</ul>
		</section>
	);
}
