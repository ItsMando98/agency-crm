import { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { clamp } from '@/lib/motion-math';
import { PAPER, RED, TAU, frac, rgba } from '@/lib/scenes/helpers';
import { NODES, benchmarkY, curveX, curveY, revealAt } from './hero-curve';

const SETTLED_TIME = 6;

const layer = typeof document === 'undefined' ? null : document.createElement('canvas');

function wave(u: number, time: number) {
	return 0.011 * u * Math.sin(TAU * (u * 1.8 - time / 10));
}

function drawHero(
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	time: number,
	pointer: { x: number; y: number },
) {
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = '#09090c';
	ctx.fillRect(0, 0, w, h);

	const ambient = ctx.createRadialGradient(w * 0.12, h * 0.06, 0, w * 0.12, h * 0.06, w * 0.62);
	ambient.addColorStop(0, rgba(RED, 0.2));
	ambient.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = ambient;
	ctx.fillRect(0, 0, w, h);

	const follow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(w, h) * 0.34);
	follow.addColorStop(0, rgba(RED, 0.13));
	follow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = follow;
	ctx.fillRect(0, 0, w, h);

	ctx.strokeStyle = 'rgba(244, 241, 234, 0.05)';
	ctx.lineWidth = 1;
	const step = 88;
	ctx.beginPath();
	for (let x = 0.5; x < w; x += step) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, h);
	}
	for (let y = 0.5; y < h; y += step) {
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
	}
	ctx.stroke();

	const reveal = revealAt(time);
	if (reveal <= 0.001) return;

	const bottom = h * 0.93;
	const xStart = curveX(0) * w;
	const points: Array<[number, number, number]> = [];
	for (let u = 0; u <= reveal + 0.0001; u += 0.004) {
		const uu = Math.min(u, reveal);
		points.push([curveX(uu) * w, curveY(uu, wave(uu, time)) * h, uu]);
	}
	const last = points[points.length - 1];

	ctx.save();
	ctx.beginPath();
	ctx.moveTo(xStart, h * 0.93);
	ctx.lineTo(w, h * 0.93);
	ctx.strokeStyle = 'rgba(244, 241, 234, 0.12)';
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();

	ctx.strokeStyle = 'rgba(244, 241, 234, 0.24)';
	ctx.lineWidth = 1.5;
	ctx.setLineDash([3, 9]);
	ctx.lineCap = 'round';
	ctx.beginPath();
	for (let u = 0; u <= reveal; u += 0.01) {
		const x = curveX(u) * w;
		const y = benchmarkY(u) * h;
		if (u === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.stroke();
	ctx.setLineDash([]);

	const layerCtx = layer?.getContext('2d');
	if (layer && layerCtx) {
		const dpr = ctx.getTransform().a;
		const layerW = Math.ceil((w - xStart + 4) * dpr);
		const layerH = Math.ceil(h * dpr);
		if (layer.width !== layerW || layer.height !== layerH) {
			layer.width = layerW;
			layer.height = layerH;
		}
		layerCtx.setTransform(dpr, 0, 0, dpr, -xStart * dpr, 0);
		layerCtx.clearRect(xStart - 1, 0, w - xStart + 4, h);
		layerCtx.globalCompositeOperation = 'source-over';
		const fill = layerCtx.createLinearGradient(0, h * 0.18, 0, bottom);
		fill.addColorStop(0, rgba(RED, 0.32));
		fill.addColorStop(1, rgba(RED, 0));
		layerCtx.fillStyle = fill;
		layerCtx.beginPath();
		layerCtx.moveTo(points[0][0], bottom);
		for (const [x, y] of points) layerCtx.lineTo(x, y);
		layerCtx.lineTo(last[0], bottom);
		layerCtx.closePath();
		layerCtx.fill();
		layerCtx.lineWidth = 1;
		for (let x = Math.ceil(xStart / 12) * 12; x <= last[0]; x += 12) {
			const u = clamp((x / w - curveX(0)) / (curveX(1) - curveX(0)));
			const y = curveY(u, wave(u, time)) * h;
			layerCtx.strokeStyle = rgba(RED, 0.07 + 0.12 * u);
			layerCtx.beginPath();
			layerCtx.moveTo(x + 0.5, y);
			layerCtx.lineTo(x + 0.5, bottom);
			layerCtx.stroke();
		}
		layerCtx.globalCompositeOperation = 'destination-in';
		const mask = layerCtx.createLinearGradient(xStart, 0, curveX(1) * w + 36, 0);
		mask.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
		mask.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
		mask.addColorStop(1, 'rgba(0, 0, 0, 0)');
		layerCtx.fillStyle = mask;
		layerCtx.fillRect(xStart - 1, 0, w - xStart + 4, h);
		layerCtx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalCompositeOperation = 'source-over';
		ctx.drawImage(layer, xStart, 0, layerW / dpr, layerH / dpr);
	}

	ctx.globalCompositeOperation = 'lighter';
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.strokeStyle = rgba(RED, 0.16);
	ctx.lineWidth = 14;
	ctx.beginPath();
	points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
	ctx.stroke();

	const stroke = ctx.createLinearGradient(xStart, 0, last[0], 0);
	stroke.addColorStop(0, rgba(RED, 0));
	stroke.addColorStop(0.3, rgba(RED, 0.95));
	stroke.addColorStop(1, 'rgba(255, 255, 255, 1)');
	ctx.strokeStyle = stroke;
	ctx.lineWidth = 3.2;
	ctx.beginPath();
	points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
	ctx.stroke();

	const settled = time >= 3.6;
	const sweep = settled ? frac((time - 3.6) / 5.5) : -1;
	if (settled) {
		for (let k = 0; k < 24; k += 1) {
			const u0 = sweep - 0.24 + (k / 24) * 0.24;
			const u1 = sweep - 0.24 + ((k + 1) / 24) * 0.24;
			if (u1 < 0 || u0 > 1) continue;
			const a = clamp(u0);
			const b = clamp(u1);
			ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * (k / 24) * (k / 24)})`;
			ctx.lineWidth = 3.4;
			ctx.beginPath();
			ctx.moveTo(curveX(a) * w, curveY(a, wave(a, time)) * h);
			ctx.lineTo(curveX(b) * w, curveY(b, wave(b, time)) * h);
			ctx.stroke();
		}
	}

	for (const node of NODES) {
		if (node.u > reveal) continue;
		const x = curveX(node.u) * w;
		const y = curveY(node.u, wave(node.u, time)) * h;
		const heat = settled ? Math.max(0, 1 - Math.abs(sweep - node.u) / 0.07) : 0;
		const halo = ctx.createRadialGradient(x, y, 0, x, y, 34);
		halo.addColorStop(0, rgba(RED, 0.4 + 0.4 * heat));
		halo.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = halo;
		ctx.fillRect(x - 34, y - 34, 68, 68);
		ctx.fillStyle = '#09090c';
		ctx.beginPath();
		ctx.arc(x, y, 6.5, 0, TAU);
		ctx.fill();
		ctx.strokeStyle = heat > 0.2 ? 'rgba(255, 255, 255, 1)' : rgba(RED, 1);
		ctx.lineWidth = 2.4;
		ctx.stroke();
	}

	if (reveal > 0.985) {
		const [x, y] = last;
		const ring = frac(time / 2.6);
		ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * (1 - ring)})`;
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(x, y, 9 + ring * 38, 0, TAU);
		ctx.stroke();
		const core = ctx.createRadialGradient(x, y, 0, x, y, 40);
		core.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
		core.addColorStop(0.25, rgba(RED, 0.7));
		core.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = core;
		ctx.fillRect(x - 40, y - 40, 80, 80);
		ctx.fillStyle = rgba(PAPER, 1);
		ctx.beginPath();
		ctx.arc(x, y, 5, 0, TAU);
		ctx.fill();
	}
}

export function HeroCanvas() {
	const ref = useRef<HTMLCanvasElement>(null);
	const reduced = useReducedMotion();
	const inView = useInView(ref);
	const size = useRef({ w: 0, h: 0, dpr: 1 });
	const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
	const clock = useRef(0);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const paint = (time: number) => {
			const ctx = canvas.getContext('2d');
			const { w, h, dpr } = size.current;
			if (!ctx || w === 0) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			drawHero(ctx, w, h, time, pointer.current);
		};
		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = canvas.clientWidth;
			const h = canvas.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			size.current = { w, h, dpr };
			pointer.current = { x: w * 0.3, y: h * 0.4, tx: w * 0.3, ty: h * 0.4 };
			paint(reduced ? SETTLED_TIME : clock.current);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);

		if (reduced || !inView) return () => observer.disconnect();

		const onMove = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			const rect = canvas.getBoundingClientRect();
			pointer.current.tx = event.clientX - rect.left;
			pointer.current.ty = event.clientY - rect.top;
		};
		window.addEventListener('pointermove', onMove);

		let frame = 0;
		const start = performance.now() - clock.current * 1000;
		const tick = (now: number) => {
			clock.current = (now - start) / 1000;
			const p = pointer.current;
			p.x += (p.tx - p.x) * 0.06;
			p.y += (p.ty - p.y) * 0.06;
			paint(clock.current);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onMove);
			observer.disconnect();
		};
	}, [reduced, inView]);

	return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
