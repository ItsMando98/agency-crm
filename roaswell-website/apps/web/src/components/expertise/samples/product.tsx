import { MotionPlayer } from '@/components/motion/player';
import { easeInOutCubic, easeOutCubic, pulse, round, seg } from '@/lib/motion-math';

const RED = '#ff3448';
const PAPER = '#f4f1ea';
const DURATION = 10;

type Part = {
	id: string;
	name: string;
	detail: string;
	assembled: number;
	exploded: number;
	order: number;
};

const PARTS: Part[] = [
	{ id: 'cap', name: 'Light ring', detail: 'Diffused LED halo', assembled: 226, exploded: 52, order: 0 },
	{ id: 'body', name: 'Acoustic mesh', detail: 'Woven shell, 360° sound', assembled: 236, exploded: 120, order: 1 },
	{ id: 'driver', name: 'Driver', detail: 'Full-range cone', assembled: 322, exploded: 296, order: 2 },
	{ id: 'board', name: 'Control board', detail: 'Wi-Fi and Bluetooth', assembled: 350, exploded: 360, order: 3 },
	{ id: 'base', name: 'Weighted base', detail: 'Damped, non-slip', assembled: 356, exploded: 410, order: 4 },
];

const CENTER_X = 250;

function partOffset(time: number, part: Part) {
	const out = seg(time, 1.4 + part.order * 0.12, 3.6 + part.order * 0.12, easeInOutCubic);
	const back = seg(time, 7.2 + (4 - part.order) * 0.1, 9.2 + (4 - part.order) * 0.1, easeInOutCubic);
	return clamp01(out - back);
}

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function partY(time: number, part: Part) {
	return part.assembled + (part.exploded - part.assembled) * partOffset(time, part);
}

type CylinderProps = {
	cy: number;
	rx: number;
	ry: number;
	height: number;
	side: string;
	top: string;
	edge?: string;
};

function Cylinder({ cy, rx, ry, height, side, top, edge = 'rgba(244,241,234,0.22)' }: CylinderProps) {
	const left = CENTER_X - rx;
	const right = CENTER_X + rx;
	const bottom = cy + height;
	return (
		<g>
			<path
				d={`M${left} ${round(cy)} L${left} ${round(bottom)} A${rx} ${ry} 0 0 0 ${right} ${round(bottom)} L${right} ${round(cy)} Z`}
				fill={`url(#${side})`}
				stroke={edge}
				strokeWidth="1"
			/>
			<ellipse cx={CENTER_X} cy={round(cy)} rx={rx} ry={ry} fill={top} stroke={edge} strokeWidth="1" />
		</g>
	);
}

export function ProductSample() {
	return (
		<MotionPlayer
			title="Concept exploded view of an invented smart speaker, parts separating and reassembling"
			duration={DURATION}
			poster={5.2}
			aspect="4 / 3"
			chapters={[
				{ at: 0, label: 'Assembled' },
				{ at: 4.3, label: 'Exploded' },
				{ at: 7.6, label: 'Reassemble' },
			]}
		>
			{time => {
				const lift = Math.max(...PARTS.map(part => partOffset(time, part)));
				const settle = Math.min(...PARTS.map(part => partOffset(time, part)));
				const labelOpacity = seg(settle, 0.9, 1, easeOutCubic);
				const assembledGlow = 1 - lift;
				const activeIndex = Math.floor(Math.max(0, time - 4.1) / 0.55) % PARTS.length;
				const showActive = time > 4.1 && time < 7.2;
				const sweepX = -220 + ((time * 0.32) % 1) * 760;
				const ringPulse = 0.55 + Math.sin(time * 3.2) * 0.25;
				const groupShift = -64 * (1 - lift);
				const get = (id: string) => PARTS.find(part => part.id === id) as Part;

				return (
					<svg viewBox="0 0 640 480" className="sample-svg">
						<defs>
							<radialGradient id="halo-bg" cx="50%" cy="48%" r="55%">
								<stop offset="0" stopColor={RED} stopOpacity="0.22" />
								<stop offset="1" stopColor={RED} stopOpacity="0" />
							</radialGradient>
							<linearGradient id="g-dark" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0" stopColor="#0f0f13" />
								<stop offset="0.28" stopColor="#2c2c34" />
								<stop offset="0.55" stopColor="#1a1a1f" />
								<stop offset="1" stopColor="#09090c" />
							</linearGradient>
							<linearGradient id="g-mesh" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0" stopColor="#1b1b21" />
								<stop offset="0.3" stopColor="#3d3d46" />
								<stop offset="0.62" stopColor="#24242b" />
								<stop offset="1" stopColor="#0d0d11" />
							</linearGradient>
							<linearGradient id="g-metal" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0" stopColor="#3b3b44" />
								<stop offset="0.35" stopColor="#8a8a94" />
								<stop offset="0.7" stopColor="#4a4a53" />
								<stop offset="1" stopColor="#25252b" />
							</linearGradient>
							<linearGradient id="g-pcb" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0" stopColor="#2a0b10" />
								<stop offset="0.4" stopColor="#4a1219" />
								<stop offset="1" stopColor="#1e070b" />
							</linearGradient>
							<pattern id="mesh-dots" width="7" height="7" patternUnits="userSpaceOnUse">
								<circle cx="3.5" cy="3.5" r="1.1" fill="#fff" opacity="0.2" />
							</pattern>
							<filter id="ring-blur" x="-20%" y="-200%" width="140%" height="500%">
								<feGaussianBlur stdDeviation="5" />
							</filter>
							<clipPath id="body-clip">
								<path
									d={`M${CENTER_X - 100} ${round(partY(time, get('body')))} L${CENTER_X - 100} ${round(partY(time, get('body')) + 120)} A100 22 0 0 0 ${CENTER_X + 100} ${round(partY(time, get('body')) + 120)} L${CENTER_X + 100} ${round(partY(time, get('body')))} Z`}
								/>
							</clipPath>
						</defs>

						<rect width="640" height="480" fill="#0b0b0e" />
						<rect width="640" height="480" fill="url(#halo-bg)" />
						{Array.from({ length: 13 }, (_, index) => (
							<line key={index} x1={index * 50} y1="0" x2={index * 50} y2="480" stroke="#fff" opacity="0.03" />
						))}
						<ellipse cx={CENTER_X} cy={round(372 + lift * 76)} rx={round(130 - lift * 6)} ry="14" fill="#000" opacity="0.4" />

						<g transform={`translate(0 ${round(groupShift)})`}>
							<g transform={`translate(0 ${round(partY(time, get('base')) - get('base').assembled)})`}>
								<Cylinder cy={get('base').assembled} rx={112} ry={24} height={24} side="g-dark" top="#1c1c22" />
								<ellipse cx={CENTER_X} cy={get('base').assembled} rx="70" ry="13" fill="none" stroke={RED} strokeOpacity="0.35" />
							</g>

							<g transform={`translate(0 ${round(partY(time, get('board')) - get('board').assembled)})`}>
								<Cylinder cy={get('board').assembled} rx={96} ry={20} height={6} side="g-pcb" top="#3a0f14" edge="rgba(255,52,72,0.4)" />
								{[
									[-52, -2, 22, 9],
									[-12, 3, 16, 8],
									[30, -3, 26, 9],
									[58, 2, 12, 7],
								].map(([x, y, width, height], index) => (
									<rect
										key={index}
										x={CENTER_X + x - width / 2}
										y={get('board').assembled + y - height / 2}
										width={width}
										height={height}
										rx="1.5"
										fill="#0c0c0f"
										stroke="rgba(255,255,255,0.18)"
										strokeWidth="0.6"
									/>
								))}
								<path
									d={`M${CENTER_X - 80} ${get('board').assembled} H${CENTER_X - 66} M${CENTER_X + 70} ${get('board').assembled} H${CENTER_X + 82}`}
									stroke={RED}
									strokeOpacity="0.7"
									strokeWidth="1.4"
								/>
							</g>

							<g transform={`translate(0 ${round(partY(time, get('driver')) - get('driver').assembled)})`}>
								<Cylinder cy={get('driver').assembled} rx={72} ry={15} height={16} side="g-metal" top="#2d2d34" />
								{[0.8, 0.58, 0.36].map((scale, index) => (
									<ellipse
										key={scale}
										cx={CENTER_X}
										cy={get('driver').assembled}
										rx={72 * scale}
										ry={15 * scale}
										fill={index === 2 ? '#0c0c0f' : 'none'}
										stroke="rgba(244,241,234,0.3)"
										strokeWidth="1"
									/>
								))}
								<ellipse cx={CENTER_X} cy={get('driver').assembled - 1} rx="10" ry="2.6" fill={RED} opacity="0.85" />
							</g>

							<g transform={`translate(0 ${round(partY(time, get('body')) - get('body').assembled)})`}>
								<Cylinder cy={get('body').assembled} rx={100} ry={22} height={120} side="g-mesh" top="#26262d" />
								<path
									d={`M${CENTER_X - 100} ${get('body').assembled} L${CENTER_X - 100} ${get('body').assembled + 120} A100 22 0 0 0 ${CENTER_X + 100} ${get('body').assembled + 120} L${CENTER_X + 100} ${get('body').assembled} Z`}
									fill="url(#mesh-dots)"
								/>
							</g>
							<g clipPath="url(#body-clip)" opacity={round(assembledGlow * 0.9)}>
								<rect x={round(sweepX)} y="0" width="64" height="520" fill="#fff" opacity="0.18" transform={`rotate(18 ${round(sweepX)} 240)`} />
							</g>

							<g transform={`translate(0 ${round(partY(time, get('cap')) - get('cap').assembled)})`}>
								<Cylinder cy={get('cap').assembled} rx={100} ry={22} height={10} side="g-dark" top="#17171c" />
								<ellipse
									cx={CENTER_X}
									cy={get('cap').assembled + 4}
									rx="100"
									ry="22"
									fill="none"
									stroke={RED}
									strokeWidth="4"
									opacity={round(ringPulse)}
									filter="url(#ring-blur)"
								/>
								<ellipse cx={CENTER_X} cy={get('cap').assembled} rx="86" ry="18" fill="none" stroke={RED} strokeWidth="2" opacity={round(0.5 + ringPulse * 0.5)} />
							</g>

							{PARTS.map((part, index) => {
								const y = partY(time, part) + 6;
								const active = showActive && index === activeIndex;
								const appear = labelOpacity;
								return (
									<g key={part.id} opacity={round(appear)}>
										<line
											x1={CENTER_X + (part.id === 'base' ? 112 : part.id === 'board' ? 96 : part.id === 'driver' ? 72 : 100) + 8}
											y1={round(y)}
											x2="388"
											y2={round(y)}
											stroke={active ? RED : PAPER}
											strokeOpacity={active ? 1 : 0.35}
											strokeDasharray="3 5"
										/>
										<circle cx="388" cy={round(y)} r="3.5" fill={active ? RED : PAPER} />
										<text x="400" y={round(y - 2)} className="svg-caption" fill={active ? RED : PAPER}>
											0{index + 1} {part.name.toUpperCase()}
										</text>
										<text x="400" y={round(y + 15)} className="svg-label" style={{ fontSize: 12 }} fill={PAPER} opacity="0.6">
											{part.detail}
										</text>
									</g>
								);
							})}
						</g>

						<text x="24" y="34" className="svg-caption" fill={PAPER} opacity="0.55">HALO / EXPLODED VIEW</text>
						<text x="616" y="34" textAnchor="end" className="svg-caption" fill={RED} opacity={round(0.4 + pulse(time % 2, 0, 1, 2) * 0.6)}>
							{lift > 0.02 && lift < 0.98 ? 'MOVING' : lift >= 0.98 ? 'EXPLODED' : 'ASSEMBLED'}
						</text>
					</svg>
				);
			}}
		</MotionPlayer>
	);
}
