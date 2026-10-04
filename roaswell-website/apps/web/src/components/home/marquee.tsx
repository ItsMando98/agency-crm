import {
	motion,
	useAnimationFrame,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
	useVelocity,
} from 'framer-motion';

const ROW_ONE = ['SEO & CONTENT', 'META ADS', 'GOOGLE ADS', 'CREATIVE TESTING'];
const ROW_TWO = ['INCREMENTALITY', 'SERVER-SIDE TRACKING', 'FULL-FUNNEL', 'BLENDED CAC'];

function wrapPercent(value: number) {
	return ((((value + 50) % 50) + 50) % 50) - 50;
}

type MarqueeRowProps = {
	items: string[];
	direction: 1 | -1;
	outlined?: boolean;
};

function MarqueeRow({ items, direction, outlined = false }: MarqueeRowProps) {
	const reduced = useReducedMotion();
	const offset = useMotionValue(0);
	const { scrollY } = useScroll();
	const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
	const velocityFactor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
	const x = useTransform(offset, latest => `${wrapPercent(latest)}%`);

	useAnimationFrame((_time, delta) => {
		if (reduced) return;
		const base = direction * 2.2 * (delta / 1000);
		offset.set(offset.get() + base + base * Math.abs(velocityFactor.get()));
	});

	const content = [...items, ...items, ...items, ...items];

	return (
		<div className={outlined ? 'marquee-row outlined' : 'marquee-row'} aria-hidden="true">
			<motion.div className="marquee-track" style={{ x }}>
				{content.map((item, index) => (
					<span key={`${item}-${index}`}>
						{item}
						<b>✦</b>
					</span>
				))}
			</motion.div>
		</div>
	);
}

export function Marquee() {
	return (
		<section className="marquee" aria-label="Capabilities">
			<MarqueeRow items={ROW_ONE} direction={-1} />
			<MarqueeRow items={ROW_TWO} direction={1} outlined />
		</section>
	);
}
