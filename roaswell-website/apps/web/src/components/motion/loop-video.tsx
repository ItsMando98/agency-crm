import { useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion, type MotionStyle } from 'framer-motion';

type LoopVideoProps = {
	name: string;
	poster: string;
	className?: string;
	style?: MotionStyle;
	active?: boolean;
	eager?: boolean;
};

export function LoopVideo({ name, poster, className, style, active = true, eager = false }: LoopVideoProps) {
	const ref = useRef<HTMLVideoElement>(null);
	const reduced = useReducedMotion();
	const inView = useInView(ref, { margin: '120px 0px 120px 0px' });

	useEffect(() => {
		const video = ref.current;
		if (!video || reduced) return;
		if (active && inView) {
			video.play().catch(() => undefined);
		} else {
			video.pause();
		}
	}, [active, inView, reduced]);

	return (
		<motion.video
			ref={ref}
			className={className}
			style={style}
			muted
			loop
			playsInline
			preload={eager ? 'auto' : 'metadata'}
			poster={poster}
			aria-hidden="true"
		>
			<source src={`/${name}.webm`} type="video/webm" />
			<source src={`/${name}.mp4`} type="video/mp4" />
		</motion.video>
	);
}
