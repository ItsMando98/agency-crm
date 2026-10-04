import { MotionPlayer } from '@/components/motion/player';
import {
	clamp,
	easeInOutCubic,
	easeInCubic,
	easeOutBack,
	easeOutBounce,
	easeOutCubic,
	easeOutExpo,
	pulse,
	round,
	seeded,
	seg,
} from '@/lib/motion-math';

const RED = '#ff3448';
const PAPER = '#f4f1ea';
const INK = '#0a0a0c';
const DURATION = 10;
const CENTER_X = 180;

const BEATS = [
	{ name: 'Hook', from: 0, to: 2.4, text: 'Win the first second. A direct question and a fast scroll cue stop the thumb.' },
	{ name: 'Claim', from: 2.4, to: 6, text: 'One clear promise, shown not told. The product lands and the two benefits hit on the beat.' },
	{ name: 'Proof', from: 6, to: 8.3, text: 'Three small proof points answer the doubt before it forms.' },
	{ name: 'Call', from: 8.3, to: 10, text: 'A single action, with a button, a swipe cue and nothing else competing for attention.' },
];

const VARIANTS = ['Still scrolling?', 'Your feed is too quiet.', 'What if it tasted louder?'];

const GHOST_CARDS = [0, 1, 2, 3, 4];

const DROPS = Array.from({ length: 14 }, (_, index) => ({
	x: round((seeded(index, 3) - 0.5) * 84),
	y: round(index % 2 === 0 ? -86 + seeded(index, 4) * 60 : 56 + seeded(index, 5) * 32),
	r: round(1.4 + seeded(index, 6) * 2),
}));

const BUBBLES = Array.from({ length: 18 }, (_, index) => ({
	x: (seeded(index, 7) - 0.5) * 120,
	period: 2 + seeded(index, 8) * 1.6,
	offset: seeded(index, 9) * 3,
	size: 2 + seeded(index, 10) * 4,
}));

const CHIPS = [
	{ label: '0g SUGAR', at: 6.3 },
	{ label: 'REAL FRUIT', at: 6.7 },
	{ label: 'ICE COLD', at: 7.1 },
];

function Can({ time }: { time: number }) {
	const drop = seg(time, 2.3, 3.4, easeOutBounce);
	const settle = seg(time, 6, 6.9, easeInOutCubic);
	const y = (-210 + (330 + 210) * drop) * (1 - settle) + 250 * settle;
	const scale = 1 - 0.22 * settle;
	const hit = pulse(time, 3.55, 3.65, 3.95) + pulse(time, 4.35, 4.45, 4.85);
	const wobble = time > 3.6 && time < 6 ? Math.sin(time * 2.2) * 3 : 0;
	const exit = seg(time, 8.1, 8.6, easeInCubic);

	return (
		<g transform={`translate(${CENTER_X} ${round(y - exit * 700)}) rotate(${round(wobble)}) scale(${round(scale * (1 + hit * 0.06))})`}>
			<ellipse cx="0" cy="112" rx="54" ry="9" fill="#000" opacity="0.28" />
			<rect x="-52" y="-95" width="104" height="190" rx="14" fill={PAPER} />
			<rect x="-52" y="-22" width="104" height="72" fill={INK} />
			<text x="0" y="22" textAnchor="middle" className="ad-display" fontSize="36" fill="#fff" letterSpacing="2">NOVA</text>
			<text x="0" y="39" textAnchor="middle" className="ad-body" fontSize="8" fill={RED} letterSpacing="3.4" fontWeight="800">SPARKLING</text>
			<ellipse cx="0" cy="-95" rx="52" ry="8" fill="#d9d6cd" />
			<ellipse cx="0" cy="-95" rx="43" ry="5" fill="#8f8c84" />
			<ellipse cx="9" cy="-96" rx="12" ry="3.4" fill="none" stroke="#bfbcb3" strokeWidth="2" />
			<rect x="-42" y="-88" width="13" height="176" rx="6.5" fill="#fff" opacity="0.5" />
			{DROPS.map((dropItem, index) => (
				<circle key={index} cx={dropItem.x} cy={dropItem.y} r={dropItem.r} fill="#fff" opacity="0.55" />
			))}
		</g>
	);
}

export function PaidSocialAd() {
	return (
		<MotionPlayer
			title="Concept vertical ad for an invented sparkling drink, shown with its four beats"
			duration={DURATION}
			poster={4.3}
			aspect="9 / 16"
			maxStageHeight="660px"
			chapters={BEATS.map(beat => ({ at: beat.from, label: beat.name }))}
			side={time => (
				<div className="beat-panel">
					<span className="eyebrow">
						<i /> THE FOUR BEATS
					</span>
					<ol>
						{BEATS.map(beat => {
							const active = time >= beat.from && time < beat.to;
							const progress = clamp((time - beat.from) / (beat.to - beat.from));
							return (
								<li key={beat.name} className={active ? 'on' : ''}>
									<div className="beat-head">
										<strong>{beat.name}</strong>
										<span>
											{beat.from.toFixed(1)}s to {beat.to.toFixed(1)}s
										</span>
									</div>
									<p>{beat.text}</p>
									<i style={{ width: `${active ? progress * 100 : time >= beat.to ? 100 : 0}%` }} />
								</li>
							);
						})}
					</ol>
					<div className="variant-row">
						<span className="eyebrow">
							<i /> THREE HOOKS, ONE AD
						</span>
						<div>
							{VARIANTS.map((variant, index) => (
								<span key={variant}>
									<b>{String.fromCharCode(65 + index)}</b> {variant}
								</span>
							))}
						</div>
						<p>The master file swaps its opening line, so testing never means rebuilding the ad.</p>
					</div>
				</div>
			)}
		>
			{time => {
				const ghostShift = (time * 260) % 520;
				const wipe = seg(time, 2, 3.2, easeInOutCubic) * 880;
				const ctaWipe = seg(time, 8.1, 8.9, easeInOutCubic) * 880;
				const hookIn = (delay: number) => seg(time, 0.2 + delay, 0.75 + delay, easeOutBack);
				const hookOut = seg(time, 1.95, 2.4, easeInCubic);
				const glitch = time > 1.25 && time < 1.4 ? (seeded(Math.floor(time * 60)) - 0.5) * 14 : 0;
				const wordA = seg(time, 3.5, 4.1, easeOutExpo);
				const wordB = seg(time, 4.3, 4.9, easeOutExpo);
				const wordsOut = seg(time, 5.4, 5.9, easeInCubic);
				const onRed = time > 3.2 && time < 8.4;
				const headerInk = time > 8.6 && time < 9.7 ? INK : '#fff';
				const fadeOverlay = Math.max(1 - seg(time, 0, 0.35), seg(time, 9.7, 10));
				const bubbleVisible = seg(time, 3.3, 3.8) * (1 - seg(time, 7.6, 8.1));

				return (
					<svg viewBox="0 0 360 640" className="ad-svg" preserveAspectRatio="xMidYMid slice">
						<rect width="360" height="640" fill={INK} />
						{GHOST_CARDS.map(index => {
							const y = ((index * 130 - ghostShift) % 650 + 650) % 650 - 120;
							return (
								<rect
									key={index}
									x={28 + (index % 2) * 10}
									y={round(y)}
									width={304 - (index % 2) * 20}
									height="104"
									rx="14"
									fill="#fff"
									opacity={round(0.07 * (1 - seg(time, 1.9, 2.3)))}
								/>
							);
						})}

						<g opacity={round(1 - hookOut)} transform={`translate(0 ${round(-hookOut * 40)})`}>
							<text
								x={CENTER_X + glitch}
								y={round(262 + (1 - hookIn(0)) * 70)}
								textAnchor="middle"
								className="ad-display"
								fontSize="118"
								fill={PAPER}
								opacity={round(hookIn(0))}
							>
								STILL
							</text>
							<text
								x={CENTER_X - glitch}
								y={round(342 + (1 - hookIn(0.28)) * 70)}
								textAnchor="middle"
								className="ad-display"
								fontSize="64"
								fill={RED}
								opacity={round(hookIn(0.28))}
							>
								SCROLLING?
							</text>
							<rect x="40" y="366" width={round(280 * seg(time, 0.95, 1.5, easeOutExpo))} height="5" fill={PAPER} />
						</g>

						<circle cx={CENTER_X} cy="330" r={round(wipe)} fill={RED} />

						<g opacity={round(bubbleVisible)}>
							{BUBBLES.map((bubble, index) => {
								const phase = (time * 1 + bubble.offset) % bubble.period;
								const progress = phase / bubble.period;
								return (
									<circle
										key={index}
										cx={round(CENTER_X + bubble.x + Math.sin(time * 2 + index) * 5)}
										cy={round(430 - progress * 360)}
										r={round(bubble.size)}
										fill="none"
										stroke="#fff"
										strokeWidth="1.6"
										opacity={round(Math.sin(progress * Math.PI) * 0.8)}
									/>
								);
							})}
						</g>

						<g opacity={round(1 - wordsOut)}>
							<text
								x={round(CENTER_X - (1 - wordA) * 340)}
								y="150"
								textAnchor="middle"
								className="ad-display"
								fontSize="62"
								fill="#fff"
								opacity={round(wordA)}
							>
								ZERO SUGAR.
							</text>
							<text
								x={round(CENTER_X + (1 - wordB) * 340)}
								y="560"
								textAnchor="middle"
								className="ad-display"
								fontSize="62"
								fill={INK}
								opacity={round(wordB)}
							>
								FULL VOLUME.
							</text>
						</g>

						<Can time={time} />

						{CHIPS.map((chip, index) => {
							const pop = seg(time, chip.at, chip.at + 0.5, easeOutBack);
							const out = seg(time, 8.1, 8.5, easeInCubic);
							return (
								<g
									key={chip.label}
									transform={`translate(${CENTER_X} ${430 + index * 58}) scale(${round(pop * (1 - out))})`}
								>
									<rect x="-98" y="-22" width="196" height="44" rx="22" fill="#fff" />
									<circle cx="-72" cy="0" r="8" fill={RED} />
									<text x="-52" y="6" className="ad-body" fontSize="17" fontWeight="800" fill={INK} letterSpacing="1.5">
										{chip.label}
									</text>
								</g>
							);
						})}

						<circle cx={CENTER_X} cy="640" r={round(ctaWipe)} fill={PAPER} />
						<g opacity={round(seg(time, 8.7, 9.2))}>
							<text
								x={CENTER_X}
								y={round(238 + (1 - seg(time, 8.7, 9.4, easeOutExpo)) * 40)}
								textAnchor="middle"
								className="ad-display"
								fontSize="64"
								fill={INK}
							>
								TAKE THE
							</text>
							<text
								x={CENTER_X}
								y={round(304 + (1 - seg(time, 8.85, 9.5, easeOutExpo)) * 40)}
								textAnchor="middle"
								className="ad-display"
								fontSize="64"
								fill={RED}
							>
								FIRST SIP.
							</text>
							<g transform={`translate(${CENTER_X} 420) scale(${round(1 + pulse(time % 0.9, 0, 0.45, 0.9) * 0.06)})`}>
								<rect x="-104" y="-28" width="208" height="56" rx="28" fill={RED} />
								<text x="0" y="7" textAnchor="middle" className="ad-body" fontSize="18" fontWeight="800" fill="#fff" letterSpacing="2.4">
									SHOP NOW
								</text>
							</g>
							{[0, 1, 2].map(index => (
								<path
									key={index}
									d={`M${CENTER_X - 12} ${548 - index * 14} l12 -9 l12 9`}
									fill="none"
									stroke={INK}
									strokeWidth="3"
									strokeLinecap="round"
									opacity={round(pulse((time * 1.6 + index * 0.25) % 1, 0, 0.3, 1))}
								/>
							))}
						</g>

						<rect x="12" y="12" width="336" height="3" rx="1.5" fill={headerInk} opacity="0.25" />
						<rect x="12" y="12" width={round(336 * (time / DURATION))} height="3" rx="1.5" fill={headerInk} />
						<circle cx="28" cy="40" r="12" fill={onRed ? PAPER : RED} />
						<text x="28" y="45" textAnchor="middle" className="ad-display" fontSize="15" fill={onRed ? RED : '#fff'}>N</text>
						<text x="48" y="38" className="ad-body" fontSize="11" fontWeight="800" fill={headerInk}>nova.sparkling</text>
						<text x="48" y="50" className="ad-body" fontSize="9" fill={headerInk} opacity="0.8">Sponsored</text>

						<rect width="360" height="640" fill="#000" opacity={round(fadeOverlay)} />
					</svg>
				);
			}}
		</MotionPlayer>
	);
}
