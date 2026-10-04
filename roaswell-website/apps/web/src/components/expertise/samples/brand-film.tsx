import { MotionPlayer } from '@/components/motion/player';
import {
	easeInCubic,
	easeInOutCubic,
	easeOutCubic,
	easeOutExpo,
	lerp,
	pulse,
	round,
	seg,
} from '@/lib/motion-math';

const RED = '#ff3448';
const PAPER = '#f4f1ea';
const DURATION = 16;
const WIDTH = 956;
const HEIGHT = 400;
const MID_X = WIDTH / 2;
const MID_Y = HEIGHT / 2;

const CHAPTERS = [
	{ label: 'Signal', at: 0 },
	{ label: 'Intent', at: 4.5 },
	{ label: 'Return', at: 9 },
	{ label: 'Title', at: 13.3 },
];

const SIGNAL_TEXT = 'A BRAND IS A SIGNAL.'.split('');
const BAR_COUNT = 44;
const BAR_WIDTH = 14;
const BAR_GAP = (WIDTH - BAR_COUNT * BAR_WIDTH) / (BAR_COUNT + 1);

function wavePath(time: number, amplitude: number) {
	const points: string[] = [];
	for (let x = 70; x <= WIDTH - 70; x += 8) {
		const edge = Math.min(1, Math.min(x - 70, WIDTH - 70 - x) / 120);
		const y = 158 + Math.sin(x * 0.045 + time * 7) * amplitude * edge + Math.sin(x * 0.11 - time * 4) * amplitude * 0.35 * edge;
		points.push(`${x === 70 ? 'M' : 'L'}${x} ${round(y)}`);
	}
	return points.join(' ');
}

function chapterTitle(time: number, start: number, number: string, name: string) {
	const visible = pulse(time, start + 0.2, start + 0.7, start + 2.2);
	return (
		<g opacity={round(visible)} transform={`translate(0 ${round((1 - visible) * 8)})`}>
			<circle cx="46" cy="364" r="3.5" fill={RED} />
			<text x="60" y="368" className="svg-caption" fill={PAPER}>
				{number} / {name}
			</text>
		</g>
	);
}

export function BrandFilmSample() {
	return (
		<MotionPlayer
			title="Concept brand film for the Roaswell studio in three chapters: Signal, Intent and Return"
			duration={DURATION}
			poster={10.9}
			aspect="2.39 / 1"
			chapters={CHAPTERS}
		>
			{time => {
				const frame = Math.floor(time * 12);
				const bars = seg(time, 0, 1.4, easeInOutCubic);
				const barHeight = 46 * (1 - bars);

				const signalFade = 1 - seg(time, 4.0, 4.5);
				const lineWidth = seg(time, 0.3, 1.7, easeOutExpo) * 860;
				const amplitude = 30 * seg(time, 1.9, 3.1, easeOutCubic) * (1 - seg(time, 3.7, 4.3));
				const tracking = lerp(18, 7, seg(time, 1.1, 3.6, easeOutCubic));

				const intentFade = seg(time, 4.5, 5) * (1 - seg(time, 8.6, 9));
				const intentTime = Math.max(0, time - 4.5);
				const leftReveal = seg(time, 6, 6.9, easeOutExpo);
				const rightReveal = seg(time, 6.9, 7.8, easeOutExpo);

				const returnIn = seg(time, 9, 9.4);
				const returnFade = returnIn * (1 - seg(time, 12.9, 13.3));
				const push = lerp(1, 1.16, seg(time, 9, 13.3, easeInOutCubic));
				const chart = seg(time, 10.2, 12.5, easeInOutCubic);
				const chartPath = 'M40 320 C 160 316 250 300 340 280 S 520 236 620 196 S 800 120 916 70';

				const titleIn = seg(time, 13.4, 14.8, easeOutExpo);
				const titleSpacing = lerp(60, 8, titleIn);
				const sweep = seg(time, 14.1, 15.2, easeInOutCubic);
				const endFade = seg(time, 15.65, 16, easeInCubic);

				return (
					<svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="sample-svg film-svg" preserveAspectRatio="xMidYMid slice">
						<defs>
							<radialGradient id="film-vignette" cx="50%" cy="50%" r="70%">
								<stop offset="0.45" stopColor="#000" stopOpacity="0" />
								<stop offset="1" stopColor="#000" stopOpacity="0.75" />
							</radialGradient>
							<linearGradient id="film-bar" x1="0" x2="0" y1="0" y2="1">
								<stop offset="0" stopColor={RED} />
								<stop offset="1" stopColor="#4a0d14" />
							</linearGradient>
							<linearGradient id="film-sweep" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0" stopColor="#fff" stopOpacity="0" />
								<stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
								<stop offset="1" stopColor="#fff" stopOpacity="0" />
							</linearGradient>
							<filter id="film-grain" x="0" y="0" width="100%" height="100%">
								<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 40} />
								<feColorMatrix type="saturate" values="0" />
							</filter>
							<clipPath id="film-left">
								<rect x="0" y="0" width={round(60 + leftReveal * 560)} height={HEIGHT} />
							</clipPath>
							<clipPath id="film-right">
								<rect x={round(WIDTH - 60 - rightReveal * 560)} y="0" width="640" height={HEIGHT} />
							</clipPath>
							<clipPath id="film-title-glyphs">
								<text x={MID_X} y="234" textAnchor="middle" className="film-display" fontSize="168" letterSpacing={round(titleSpacing)}>
									ROASWELL
								</text>
							</clipPath>
						</defs>

						<rect width={WIDTH} height={HEIGHT} fill="#050506" />

						<g opacity={round(signalFade)}>
							<line x1={round(MID_X - lineWidth / 2)} y1="158" x2={round(MID_X + lineWidth / 2)} y2="158" stroke={RED} strokeWidth="2" opacity={round(1 - seg(time, 2.2, 3.1) * 0.7)} />
							<path d={wavePath(time, amplitude)} fill="none" stroke={RED} strokeWidth="2.4" opacity={round(seg(time, 1.7, 2.3))} />
							<text x={MID_X} y="262" textAnchor="middle" className="film-display" fontSize="66" fill={PAPER} letterSpacing={round(tracking)}>
								{SIGNAL_TEXT.map((char, index) => (
									<tspan key={index} opacity={round(seg(time, 1.4 + index * 0.05, 1.7 + index * 0.05))}>
										{char}
									</tspan>
								))}
							</text>
						</g>

						<g opacity={round(intentFade)}>
							{[0, 1, 2, 3, 4, 5].map(index => {
								const radius = ((intentTime * 70 + index * 52) % 312) + 6;
								const alpha = Math.sin(Math.min(1, radius / 312) * Math.PI);
								return <circle key={index} cx={MID_X} cy={MID_Y} r={round(radius)} fill="none" stroke={PAPER} strokeWidth="1.4" opacity={round(alpha * 0.4)} />;
							})}
							<line x1="0" y1={MID_Y} x2={WIDTH} y2={MID_Y} stroke={PAPER} opacity="0.1" />
							<line x1={MID_X} y1="0" x2={MID_X} y2={HEIGHT} stroke={PAPER} opacity="0.1" />
							<circle cx={MID_X} cy={MID_Y} r={round(8 + pulse(intentTime % 1.2, 0, 0.6, 1.2) * 5)} fill={RED} />
							<circle cx={MID_X} cy={MID_Y} r="24" fill="none" stroke={RED} strokeWidth="1.5" opacity="0.7" />
							<g clipPath="url(#film-left)">
								<text x="60" y="124" className="film-display" fontSize="60" fill={PAPER}>THE RIGHT</text>
								<text x="60" y="184" className="film-display" fontSize="60" fill={RED}>PEOPLE.</text>
							</g>
							<g clipPath="url(#film-right)">
								<text x={WIDTH - 60} y="256" textAnchor="end" className="film-display" fontSize="60" fill={PAPER}>THE RIGHT</text>
								<text x={WIDTH - 60} y="316" textAnchor="end" className="film-display" fontSize="60" fill={RED}>MOMENT.</text>
							</g>
						</g>

						<g opacity={round(returnFade)} transform={`translate(${MID_X} ${MID_Y}) scale(${round(push)}) translate(${-MID_X} ${-MID_Y})`}>
							<text x={MID_X} y="296" textAnchor="middle" className="film-display" fontSize="250" fill="none" stroke={PAPER} strokeOpacity={round(0.22 * returnIn)} strokeWidth="1.6">
								RETURN
							</text>
							{Array.from({ length: BAR_COUNT }, (_, index) => {
								const grow = seg(time, 9.1 + index * 0.028, 10.6 + index * 0.028, easeOutCubic);
								const height = (26 + index * 4.4 + Math.sin(index * 0.7) * 14) * grow;
								return (
									<rect
										key={index}
										x={round(BAR_GAP + index * (BAR_WIDTH + BAR_GAP))}
										y={round(330 - height)}
										width={BAR_WIDTH}
										height={round(height)}
										rx="2"
										fill="url(#film-bar)"
										opacity="0.85"
									/>
								);
							})}
							<line x1="20" y1="330" x2={WIDTH - 20} y2="330" stroke={PAPER} opacity="0.35" />
							<path d={chartPath} fill="none" stroke={PAPER} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={round(1 - chart)} />
							<g opacity={round(seg(chart, 0.97, 1))}>
								<circle cx="916" cy="70" r="7" fill={PAPER} />
								<circle cx="916" cy="70" r={round(7 + pulse((time * 1.2) % 1, 0, 0.5, 1) * 16)} fill="none" stroke={PAPER} opacity={round(1 - pulse((time * 1.2) % 1, 0, 0.5, 1))} />
							</g>
						</g>

						<g opacity={round(seg(time, 13.3, 13.7))}>
							<text x={MID_X} y="234" textAnchor="middle" className="film-display" fontSize="168" fill={PAPER} letterSpacing={round(titleSpacing)} opacity={round(titleIn)}>
								ROASWELL
							</text>
							<rect x={round(MID_X - 140 * seg(time, 14.4, 15, easeOutExpo))} y="258" width={round(280 * seg(time, 14.4, 15, easeOutExpo))} height="3" fill={RED} />
							<text x={MID_X} y="298" textAnchor="middle" className="svg-caption" fill={PAPER} opacity={round(seg(time, 14.6, 15.2) * 0.8)}>
								MARKETING DONE WELL.
							</text>
							<g clipPath="url(#film-title-glyphs)">
								<rect x={round(lerp(-300, WIDTH + 100, sweep))} y="60" width="220" height="260" fill="url(#film-sweep)" transform="skewX(-18)" opacity={round(sweep > 0 && sweep < 1 ? 0.9 : 0)} />
							</g>
						</g>

						{chapterTitle(time, 0, '01', 'SIGNAL')}
						{chapterTitle(time, 4.5, '02', 'INTENT')}
						{chapterTitle(time, 9, '03', 'RETURN')}

						<rect width={WIDTH} height={HEIGHT} fill="url(#film-vignette)" />
						<rect width={WIDTH} height={HEIGHT} filter="url(#film-grain)" opacity="0.1" style={{ mixBlendMode: 'overlay' }} />
						<rect width={WIDTH} height={round(barHeight)} fill="#000" />
						<rect y={round(HEIGHT - barHeight)} width={WIDTH} height={round(barHeight)} fill="#000" />
						<rect width={WIDTH} height={HEIGHT} fill="#000" opacity={round(endFade)} />
					</svg>
				);
			}}
		</MotionPlayer>
	);
}
