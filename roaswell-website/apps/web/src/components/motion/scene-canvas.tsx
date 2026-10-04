import { useCallback, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import type { Scene } from '@/lib/scenes/helpers';

type SceneCanvasProps = {
	scene: Scene;
	active?: boolean;
	fit?: 'contain' | 'cover';
	maxDpr?: number;
	className?: string;
};

export function SceneCanvas({ scene, active = true, fit = 'contain', maxDpr = 2, className }: SceneCanvasProps) {
	const ref = useRef<HTMLCanvasElement>(null);
	const reduced = useReducedMotion();
	const inView = useInView(ref, { margin: '100px 0px 100px 0px' });
	const size = useRef({ width: 0, height: 0, dpr: 1 });
	const timeRef = useRef(scene.poster);

	const render = useCallback(
		(time: number) => {
			const canvas = ref.current;
			const ctx = canvas?.getContext('2d');
			const { width, height, dpr } = size.current;
			if (!canvas || !ctx || width === 0) return;
			const pick = fit === 'cover' ? Math.max : Math.min;
			const scale = pick(width / scene.width, height / scene.height);
			const offsetX = (width - scene.width * scale) / 2;
			const offsetY = (height - scene.height * scale) / 2;
			ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = 'source-over';
			ctx.shadowBlur = 0;
			scene.draw(ctx, time);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		},
		[scene, fit],
	);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			size.current = { width, height, dpr };
			render(timeRef.current);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		return () => observer.disconnect();
	}, [render, maxDpr]);

	useEffect(() => {
		if (reduced || !active || !inView) return;
		let frame = 0;
		const start = performance.now() - timeRef.current * 1000;
		const tick = (now: number) => {
			timeRef.current = ((now - start) / 1000) % scene.duration;
			render(timeRef.current);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [reduced, active, inView, render, scene.duration]);

	return <canvas ref={ref} className={className} aria-hidden="true" />;
}
