import { easeInCubic, lerp, seg } from '@/lib/motion-math';
import { PAPER, RED, TAU, frac, mix, mulberry32, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 6;

const random = mulberry32(7);
const DOTS = Array.from({ length: 54 }, (_, index) => ({
	base: (index / 54) * TAU + random() * 0.4,
	cycles: 1 + (index % 2),
	phase: random(),
	size: 2.4 + random() * 2.2,
}));

export const googleScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 2,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.1);
		const cx = W / 2;
		const cy = H / 2;
		ctx.lineWidth = 1.5;
		for (const radius of [130, 260, 390]) {
			ctx.strokeStyle = 'rgba(244, 241, 234, 0.13)';
			ctx.beginPath();
			ctx.arc(cx, cy, radius, 0, TAU);
			ctx.stroke();
		}
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.07)';
		ctx.beginPath();
		ctx.moveTo(cx, 60);
		ctx.lineTo(cx, H - 60);
		ctx.moveTo(60, cy);
		ctx.lineTo(W - 60, cy);
		ctx.stroke();

		ctx.globalCompositeOperation = 'lighter';
		for (const dot of DOTS) {
			const p = frac(dot.cycles * (t / DURATION) + dot.phase);
			const radius = lerp(560, 26, easeInCubic(p));
			const angle = dot.base + p * 1.5;
			const x = cx + Math.cos(angle) * radius;
			const y = cy + Math.sin(angle) * radius;
			const fade = Math.pow(Math.sin(Math.PI * p), 0.6);
			const color = mix(PAPER, RED, seg(p, 0.55, 0.95));
			const glow = ctx.createRadialGradient(x, y, 0, x, y, dot.size * 6);
			glow.addColorStop(0, rgba(color, 0.4 * fade));
			glow.addColorStop(1, rgba(color, 0));
			ctx.fillStyle = glow;
			ctx.fillRect(x - dot.size * 6, y - dot.size * 6, dot.size * 12, dot.size * 12);
			ctx.fillStyle = rgba(color, 0.95 * fade);
			ctx.beginPath();
			ctx.arc(x, y, dot.size * (1 - 0.35 * p), 0, TAU);
			ctx.fill();
		}

		const pulseP = frac((t / DURATION) * 3);
		ctx.strokeStyle = rgba(RED, 0.55 * (1 - pulseP));
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		ctx.arc(cx, cy, 30 + pulseP * 150, 0, TAU);
		ctx.stroke();

		const breathe = 1 + 0.12 * Math.sin(TAU * 3 * (t / DURATION));
		const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
		core.addColorStop(0, rgba(RED, 0.5));
		core.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = core;
		ctx.fillRect(cx - 120, cy - 120, 240, 240);
		ctx.fillStyle = rgba(RED, 1);
		ctx.beginPath();
		ctx.arc(cx, cy, 20 * breathe, 0, TAU);
		ctx.fill();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.beginPath();
		ctx.arc(cx, cy, 7, 0, TAU);
		ctx.fill();
		sceneVignette(ctx, W, H);
	},
};
