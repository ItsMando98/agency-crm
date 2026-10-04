import { clamp, lerp } from '@/lib/motion-math';

export type Rgb = [number, number, number];

export type Scene = {
	width: number;
	height: number;
	duration: number;
	poster: number;
	draw: (ctx: CanvasRenderingContext2D, time: number) => void;
};

export const TAU = Math.PI * 2;
export const RED: Rgb = [255, 52, 72];
export const PAPER: Rgb = [244, 241, 234];
export const WINE: Rgb = [96, 10, 24];

export const rgba = (color: Rgb, alpha: number) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

export const frac = (value: number) => value - Math.floor(value);

export function mix(from: Rgb, to: Rgb, progress: number): Rgb {
	const p = clamp(progress);
	return [Math.round(lerp(from[0], to[0], p)), Math.round(lerp(from[1], to[1], p)), Math.round(lerp(from[2], to[2], p))];
}

export function mulberry32(seed: number) {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = Math.imul(state ^ (state >>> 15), 1 | state);
		value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

export function sceneBackground(ctx: CanvasRenderingContext2D, w: number, h: number, glowAlpha: number) {
	ctx.globalCompositeOperation = 'source-over';
	ctx.fillStyle = '#0a0a0d';
	ctx.fillRect(0, 0, w, h);
	const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
	glow.addColorStop(0, rgba(RED, glowAlpha));
	glow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, w, h);
}

export function sceneVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
	ctx.globalCompositeOperation = 'source-over';
	const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
	edge.addColorStop(0, 'rgba(7, 7, 10, 0)');
	edge.addColorStop(1, 'rgba(7, 7, 10, 0.7)');
	ctx.fillStyle = edge;
	ctx.fillRect(0, 0, w, h);
}
