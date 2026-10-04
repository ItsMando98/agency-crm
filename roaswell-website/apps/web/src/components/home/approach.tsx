import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { approach } from '@/data/studio';
import { MaskedLines } from '@/components/motion/primitives';

type StepProps = {
	item: (typeof approach)[number];
	index: number;
	total: number;
	progress: MotionValue<number>;
};

function Step({ item, index, total, progress }: StepProps) {
	const threshold = index / total;
	const opacity = useTransform(progress, [threshold - 0.12, threshold + 0.06], [0.22, 1], { clamp: true });
	const lift = useTransform(progress, [threshold - 0.12, threshold + 0.06], [24, 0], { clamp: true });
	const color = useTransform(progress, [threshold - 0.05, threshold + 0.08], ['#4a4a50', '#ff3448']);
	return (
		<motion.article style={{ opacity, y: lift }}>
			<motion.span className="large-index" style={{ color }}>
				{item.number}
			</motion.span>
			<div>
				<h3>{item.title}</h3>
				<p>{item.text}</p>
			</div>
		</motion.article>
	);
}

export function Approach() {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.65', 'end 0.75'] });
	const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

	return (
		<section className="approach section" id="approach">
			<div className="approach-intro">
				<span className="eyebrow">
					<i /> 03 / THE ROASWELL APPROACH
				</span>
				<h2>
					<MaskedLines lines={['Big thinking.', 'Small team.', <em key="better">Better work.</em>]} />
				</h2>
				<p>
					You work directly with the people doing the thinking and the doing. No layers. No handoffs. No mystery
					about where your investment goes.
				</p>
				<span className="approach-sign">Independent in spirit. Accountable by nature.</span>
			</div>
			<div className="approach-steps" ref={ref}>
				<div className="approach-line" aria-hidden="true">
					<motion.i style={{ scaleY: line }} />
				</div>
				{approach.map((item, index) => (
					<Step key={item.number} item={item} index={index} total={approach.length} progress={scrollYProgress} />
				))}
				<div className="principle">
					<span className="status-dot" /> SENIOR-LED. SPECIALIST-DELIVERED. ALWAYS ACCOUNTABLE.
				</div>
			</div>
		</section>
	);
}
