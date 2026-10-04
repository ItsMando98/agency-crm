import { clamp, easeInCubic, lerp } from '@/lib/motion-math';
import { PAPER, RED, TAU, frac, mix, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const CX = W / 2;
const CY = H / 2;
const COUNT = 96;
const RX = 590;
const RY = 450;

type Curve = { sx: number; sy: number; cx: number; cy: number; ex: number; ey: number; phase: number };

const CURVES: Curve[] = Array.from({ length: COUNT }, (_, index) => {
	const angle = (index / COUNT) * TAU;
	const swirl = angle + 0.95;
	const end = angle + 1.3;
	return {
		sx: CX + Math.cos(angle) * RX,
		sy: CY + Math.sin(angle) * RY,
		cx: CX + Math.cos(swirl) * RX * 0.46,
		cy: CY + Math.sin(swirl) * RY * 0.46,
		ex: CX + Math.cos(end) * 20,
		ey: CY + Math.sin(end) * 20,
		phase: frac(index * 0.381966),
	};
});

function pointAt(curve: Curve, s: number): [number, number] {
	const k = 1 - s;
	return [
		k * k * curve.sx + 2 * k * s * curve.cx + s * s * curve.ex,
		k * k * curve.sy + 2 * k * s * curve.cy + s * s * curve.ey,
	];
}

export const googleScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 3,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.08);

		ctx.lineWidth = 1.2;
		ctx.strokeStyle = rgba(PAPER, 0.075);
		for (const curve of CURVES) {
			ctx.beginPath();
			ctx.moveTo(curve.sx, curve.sy);
			ctx.quadraticCurveTo(curve.cx, curve.cy, curve.ex, curve.ey);
			ctx.stroke();
		}

		ctx.globalCompositeOperation = 'lighter';
		ctx.lineCap = 'round';
		let arrival = 0;
		for (const curve of CURVES) {
			const head = frac(t / DURATION + curve.phase);
			const eased = 1 - Math.pow(1 - head, 1.6);
			const tail = 0.16;
			arrival += Math.max(0, 1 - Math.abs(head - 0.98) / 0.06);
			const steps = 9;
			for (let i = 0; i < steps; i += 1) {
				const a = Math.max(0, eased - tail * ((steps - i) / steps));
				const b = Math.max(0, eased - tail * ((steps - i - 1) / steps));
				const [x0, y0] = pointAt(curve, a);
				const [x1, y1] = pointAt(curve, b);
				const fade = (i + 1) / steps;
				const color = mix(PAPER, RED, clamp((head - 0.35) / 0.5));
				ctx.strokeStyle = rgba(color, 0.9 * fade * fade);
				ctx.lineWidth = 1 + 1.6 * fade;
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.stroke();
			}
		}

		const energy = clamp(arrival / 6);
		const core = ctx.createRadialGradient(CX, CY, 0, CX, CY, 220);
		core.addColorStop(0, rgba(RED, 0.5 + 0.3 * energy));
		core.addColorStop(0.35, rgba(RED, 0.12));
		core.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = core;
		ctx.fillRect(CX - 220, CY - 220, 440, 440);

		ctx.globalCompositeOperation = 'source-over';
		const radius = lerp(24, 30, energy);
		ctx.fillStyle = rgba(RED, 1);
		ctx.beginPath();
		ctx.arc(CX, CY, radius, 0, TAU);
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(CX, CY, radius + 12 + 6 * easeInCubic(energy), 0, TAU);
		ctx.stroke();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
		ctx.beginPath();
		ctx.arc(CX, CY, 8, 0, TAU);
		ctx.fill();
		sceneVignette(ctx, W, H);
	},
};
