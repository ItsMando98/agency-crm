import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useT, type MessageKey } from '@/i18n/context';
import { MaskedLines } from '@/components/motion/primitives';
import { APPROACH_STEPS } from '@/data/studio';

type StepProps = {
	item: (typeof APPROACH_STEPS)[number];
	index: number;
	total: number;
	progress: MotionValue<number>;
};

function Step({ item, index, total, progress }: StepProps) {
	const t = useT();
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
				<h3>{t(item.titleKey)}</h3>
				<p>{t(item.textKey)}</p>
			</div>
		</motion.article>
	);
}

export function Approach() {
	const t = useT();
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.65', 'end 0.75'] });
	const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

	return (
		<section className="approach section" id="approach">
			<div className="approach-intro">
				<span className="eyebrow">
					<i /> {t('approach.home.eyebrow')}
				</span>
				<h2>
					<MaskedLines lines={[t('approach.line1'), t('approach.line2'), <em key="better">{t('approach.line3')}</em>]} />
				</h2>
				<p>
					{t('approach.home.lede')}
				</p>
				<span className="approach-sign">{t('approach.sign')}</span>
			</div>
			<div className="approach-steps" ref={ref}>
				<div className="approach-line" aria-hidden="true">
					<motion.i style={{ scaleY: line }} />
				</div>
				{APPROACH_STEPS.map((item, index) => (
					<Step key={item.number} item={item} index={index} total={APPROACH_STEPS.length} progress={scrollYProgress} />
				))}
				<div className="principle">
					<span className="status-dot" /> {t('approach.principle')}
				</div>
			</div>
		</section>
	);
}
