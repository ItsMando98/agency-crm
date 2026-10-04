import { clamp } from '@/lib/motion-math';
import { PAPER, RED, TAU, WINE, frac, mix, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const STRANDS = 44;
const SAMPLES = 160;
const SPAN = 1160;

function strandY(s: number, strand: number, t: number) {
	const phase = strand / STRANDS;
	const envelope = Math.pow(Math.sin(Math.PI * s), 0.85);
	const slow = Math.sin(TAU * (s * 1 + t / DURATION) + phase * 1.7);
	const fast = Math.sin(TAU * (s * 2 - (2 * t) / DURATION) + phase * 3.4);
	const drift = Math.sin(TAU * (s * 3 + t / DURATION) + phase * 5.1);
	return H / 2 + envelope * (150 * slow + 62 * fast + 18 * drift);
}

const strandX = (s: number) => W / 2 + (s - 0.5) * SPAN;

export const motionScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 2.2,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.1);

		ctx.globalCompositeOperation = 'lighter';
		const haze = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 520);
		haze.addColorStop(0, rgba(RED, 0.16));
		haze.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = haze;
		ctx.fillRect(0, 0, W, H);

		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		for (let strand = 0; strand < STRANDS; strand += 1) {
			const k = strand / (STRANDS - 1);
			const tone = mix(WINE, PAPER, Math.pow(k, 2.2));
			const heat = mix(tone, RED, 0.55 * Math.sin(Math.PI * k));
			ctx.strokeStyle = rgba(heat, 0.2 + 0.5 * Math.sin(Math.PI * k));
			ctx.lineWidth = 1.1 + 0.9 * Math.sin(Math.PI * k);
			ctx.beginPath();
			for (let i = 0; i <= SAMPLES; i += 1) {
				const s = i / SAMPLES;
				const x = strandX(s);
				const y = strandY(s, strand, t);
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}

		const lead = STRANDS >> 1;
		const head = frac(t / DURATION);
		for (let i = 0; i < 26; i += 1) {
			const s = clamp(head - (26 - i) * 0.006);
			const x = strandX(s);
			const y = strandY(s, lead, t);
			const fade = (i + 1) / 26;
			ctx.fillStyle = rgba(PAPER, 0.5 * fade * fade);
			ctx.beginPath();
			ctx.arc(x, y, 1.2 + 2.8 * fade, 0, TAU);
			ctx.fill();
		}
		const hx = strandX(head);
		const hy = strandY(head, lead, t);
		const flare = ctx.createRadialGradient(hx, hy, 0, hx, hy, 70);
		flare.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
		flare.addColorStop(0.2, rgba(RED, 0.6));
		flare.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = flare;
		ctx.fillRect(hx - 70, hy - 70, 140, 140);

		ctx.globalCompositeOperation = 'source-over';
		const fadeEdge = ctx.createLinearGradient(0, 0, W, 0);
		fadeEdge.addColorStop(0, 'rgba(9, 9, 12, 1)');
		fadeEdge.addColorStop(0.1, 'rgba(9, 9, 12, 0)');
		fadeEdge.addColorStop(0.9, 'rgba(9, 9, 12, 0)');
		fadeEdge.addColorStop(1, 'rgba(9, 9, 12, 1)');
		ctx.fillStyle = fadeEdge;
		ctx.fillRect(0, 0, W, H);
		sceneVignette(ctx, W, H);
	},
};
