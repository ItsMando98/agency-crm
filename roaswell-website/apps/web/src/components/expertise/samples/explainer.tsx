import { MotionPlayer } from '@/components/motion/player';
import {
	clamp,
	easeInOutCubic,
	easeOutBack,
	easeOutCubic,
	easeOutExpo,
	lerp,
	round,
	seeded,
	seg,
} from '@/lib/motion-math';

const RED = '#ff3448';
const PAPER = '#f4f1ea';
const MUTED = '#8f8c84';
const DURATION = 14;
const DOT_COUNT = 48;
const BASELINE = 296;
const FUNNEL_TOP = 74;
const FUNNEL_BOTTOM = 262;

const SCENES = [
	{ name: 'Scatter', from: 0, to: 3.4, caption: 'Attention is scattered.' },
	{ name: 'Path', from: 3.4, to: 7.6, caption: 'A clear path turns interest into intent.' },
	{ name: 'Convert', from: 7.6, to: 11.2, caption: 'Intent becomes action. Action compounds.' },
	{ name: 'Close', from: 11.2, to: 14, caption: 'Make growth visible.' },
];

const DOTS = Array.from({ length: DOT_COUNT }, (_, index) => {
	const survivor = index % 4 === 0;
	const rank = Math.floor(index / 4);
	return {
		x: 50 + seeded(index, 1) * 540,
		y: 46 + seeded(index, 2) * 190,
		phase: seeded(index, 3) * 6.28,
		entry: 140 + seeded(index, 4) * 360,
		start: 3.7 + (index / DOT_COUNT) * 2.6,
		survivor,
		rank,
		exit: 320 + (seeded(index, 5) - 0.5) * 36,
		barX: 138 + rank * 33.5,
		barHeight: 36 + rank * 12 + seeded(index, 6) * 14,
		side: seeded(index, 7) > 0.5 ? 1 : -1,
	};
});

function mix(from: [number, number, number], to: [number, number, number], progress: number) {
	const channel = (index: number) => Math.round(lerp(from[index], to[index], clamp(progress)));
	return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function funnelHalfWidth(y: number) {
	return lerp(190, 30, clamp((y - FUNNEL_TOP) / (FUNNEL_BOTTOM - FUNNEL_TOP)));
}

export function ExplainerSample() {
	return (
		<MotionPlayer
			title="Concept explainer showing scattered attention flowing through a funnel and becoming customers"
			duration={DURATION}
			poster={5.6}
			aspect="16 / 9"
			chapters={SCENES.map(scene => ({ at: scene.from, label: scene.name }))}
		>
			{time => {
				const scene = SCENES.reduce((active, item, index) => (time >= item.from ? index : active), 0);
				const funnelDraw = seg(time, 3.2, 4.4, easeInOutCubic);
				const funnelFade = 1 - seg(time, 7.7, 8.6);
				const closeIn = seg(time, 11.4, 12.4, easeOutExpo);
				const sceneFade = 1 - seg(time, 11, 11.6);
				let entered = 0;
				let converted = 0;

				const dots = DOTS.map((dot, index) => {
					const driftX = dot.x + Math.sin(time * 0.8 + dot.phase) * 14;
					const driftY = dot.y + Math.cos(time * 0.7 + dot.phase) * 10;
					const progress = clamp((time - dot.start) / 1.7);
					if (progress > 0) entered += 1;
					if (dot.survivor && progress >= 1) converted += 1;

					let x = driftX;
					let y = driftY;
					let opacity = 1;
					let fill = mix([143, 140, 132], [244, 241, 234], seg(time, 2.2, 3.4));
					let radius = 4.6;

					if (progress > 0) {
						const toEntry = easeInOutCubic(clamp(progress / 0.38));
						const lane = easeInOutCubic(clamp((progress - 0.38) / 0.62));
						const entryY = FUNNEL_TOP - 8;
						const entryX = dot.entry;
						const laneY = lerp(entryY, dot.survivor ? 308 : 232, lane);
						const spread = (entryX - 320) / 190;
						const laneX = dot.survivor
							? lerp(entryX, dot.exit, lane)
							: 320 + spread * funnelHalfWidth(laneY) * 0.9 + dot.side * lane * 26;
						x = progress < 0.38 ? lerp(driftX, entryX, toEntry) : laneX;
						y = progress < 0.38 ? lerp(driftY, entryY, toEntry) : laneY;
						if (!dot.survivor) opacity = 1 - seg(progress, 0.55, 0.9);
						if (dot.survivor) fill = mix([244, 241, 234], [255, 52, 72], seg(progress, 0.6, 1));
					}

					if (dot.survivor && time > 7.9) {
						const grow = seg(time, 8 + dot.rank * 0.12, 9.7 + dot.rank * 0.12, easeOutCubic);
						const move = seg(time, 7.8 + dot.rank * 0.05, 8.8 + dot.rank * 0.05, easeInOutCubic);
						x = lerp(dot.exit, dot.barX, move);
						y = BASELINE - dot.barHeight * grow - (1 - move) * 0;
						if (move < 1) y = lerp(308, y, move);
						fill = RED;
						radius = 5.5;
					}

					const hidden = !dot.survivor && time > 8.8;
					return (
						<circle
							key={index}
							cx={round(x)}
							cy={round(y)}
							r={radius}
							fill={fill}
							opacity={hidden ? 0 : round(opacity * sceneFade)}
						/>
					);
				});

				return (
					<svg viewBox="0 0 640 360" className="sample-svg">
						<defs>
							<linearGradient id="funnel-fill" x1="0" x2="0" y1="0" y2="1">
								<stop offset="0" stopColor={RED} stopOpacity="0.16" />
								<stop offset="1" stopColor={RED} stopOpacity="0.02" />
							</linearGradient>
						</defs>
						<rect width="640" height="360" fill="#0d0d11" />
						{Array.from({ length: 9 }, (_, index) => (
							<line key={index} x1={index * 80} y1="0" x2={index * 80} y2="360" stroke="#fff" opacity="0.035" />
						))}

						<g opacity={round(funnelFade * sceneFade)}>
							<path
								d={`M${320 - 190} ${FUNNEL_TOP} L${320 + 190} ${FUNNEL_TOP} L${320 + 30} ${FUNNEL_BOTTOM} L${320 - 30} ${FUNNEL_BOTTOM} Z`}
								fill="url(#funnel-fill)"
								opacity={round(funnelDraw)}
							/>
							<path
								d={`M${320 - 190} ${FUNNEL_TOP} L${320 - 30} ${FUNNEL_BOTTOM} M${320 + 190} ${FUNNEL_TOP} L${320 + 30} ${FUNNEL_BOTTOM}`}
								fill="none"
								stroke={PAPER}
								strokeOpacity="0.55"
								strokeWidth="2"
								pathLength="1"
								strokeDasharray="1"
								strokeDashoffset={round(1 - funnelDraw)}
							/>
							<text x="320" y="46" textAnchor="middle" className="svg-caption" fill={PAPER} opacity={round(funnelDraw * 0.7)}>ATTENTION</text>
						</g>

						<g opacity={round(seg(time, 7.9, 8.8) * sceneFade)}>
							<line x1="110" y1={BASELINE} x2="530" y2={BASELINE} stroke={PAPER} strokeOpacity="0.4" />
							<text x="110" y="318" className="svg-caption" fill={PAPER} opacity="0.55">CUSTOMERS OVER TIME</text>
						</g>
						{DOTS.filter(dot => dot.survivor).map(dot => {
							const grow = seg(time, 8 + dot.rank * 0.12, 9.7 + dot.rank * 0.12, easeOutCubic);
							return (
								<rect
									key={dot.rank}
									x={round(dot.barX - 7)}
									y={round(BASELINE - dot.barHeight * grow)}
									width="14"
									height={round(dot.barHeight * grow)}
									rx="3"
									fill={RED}
									opacity={round(0.32 * sceneFade)}
								/>
							);
						})}

						{dots}

						<g opacity={round(seg(time, 4.2, 5) * (1 - seg(time, 8, 8.6)) * sceneFade)}>
							<text x="574" y="48" textAnchor="end" className="svg-caption" fill={MUTED}>IN</text>
							<text x="620" y="48" textAnchor="end" className="ad-display" fontSize="30" fill={PAPER}>{String(entered).padStart(2, '0')}</text>
							<text x="574" y="82" textAnchor="end" className="svg-caption" fill={MUTED}>OUT</text>
							<text x="620" y="82" textAnchor="end" className="ad-display" fontSize="30" fill={RED}>{String(converted).padStart(2, '0')}</text>
						</g>

						<g opacity={round(closeIn)} transform={`translate(0 ${round((1 - closeIn) * 24)})`}>
							<text x="320" y="164" textAnchor="middle" className="ad-display" fontSize="64" fill={PAPER}>MAKE GROWTH</text>
							<text x="320" y="228" textAnchor="middle" className="ad-display" fontSize="64" fill={RED}>VISIBLE.</text>
							<rect x="244" y="244" width={round(152 * seg(time, 12.2, 12.9, easeOutBack))} height="3" fill={PAPER} />
							<text x="320" y="282" textAnchor="middle" className="svg-caption" fill={PAPER} opacity="0.6">ROASWELL</text>
						</g>

						<text x="24" y="30" className="svg-caption" fill={PAPER} opacity="0.55">
							0{scene + 1} / {SCENES[scene].name.toUpperCase()}
						</text>
						<text
							x="320"
							y="344"
							textAnchor="middle"
							className="svg-label"
							fill="#fff"
							stroke="#0d0d11"
							strokeWidth="5"
							paintOrder="stroke"
							opacity={round(seg(time, SCENES[scene].from + 0.15, SCENES[scene].from + 0.55))}
						>
							{SCENES[scene].caption}
						</text>
					</svg>
				);
			}}
		</MotionPlayer>
	);
}
