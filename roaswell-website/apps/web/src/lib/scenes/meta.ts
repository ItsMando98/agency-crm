import { clamp, easeInOutCubic, lerp, seg } from '@/lib/motion-math';
import { PAPER, RED, TAU, WINE, frac, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const COLS = 9;
const ROWS = 7;
const GAP = 112;
const CX = W / 2;
const CY = H / 2;
const ORIGIN_X = CX - ((COLS - 1) / 2) * GAP;
const ORIGIN_Y = CY - ((ROWS - 1) / 2) * GAP;

export const metaScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 4.4,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.07);
		const select = seg(t, 3.2, 5, easeInOutCubic) - seg(t, 6.4, 8, easeInOutCubic);
		const scanning = t < 3.4;
		const front = seg(t, 0, 3.2) * 640;

		for (let row = 0; row < ROWS; row += 1) {
			for (let col = 0; col < COLS; col += 1) {
				const homeX = ORIGIN_X + col * GAP;
				const homeY = ORIGIN_Y + row * GAP;
				const dx = homeX - CX;
				const dy = homeY - CY;
				const distance = Math.sqrt(dx * dx + dy * dy);
				if (distance < 1) continue;

				const push = select * lerp(18, 4, clamp(distance / 520));
				const x = homeX + (dx / distance) * push;
				const y = homeY + (dy / distance) * push;
				const lit = scanning ? Math.pow(clamp(1 - Math.abs(distance - front) / 90), 2) : 0;
				const alpha = (0.2 + 0.7 * lit) * (1 - 0.72 * select);
				const radius = 15 + 6 * lit;

				ctx.strokeStyle = rgba(lit > 0.05 ? RED : PAPER, alpha);
				ctx.lineWidth = 1.6 + lit;
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, TAU);
				ctx.stroke();
				ctx.fillStyle = rgba(lit > 0.05 ? RED : PAPER, alpha * 0.9);
				ctx.beginPath();
				ctx.arc(x, y, 2.6 + 2 * lit, 0, TAU);
				ctx.fill();
			}
		}

		const radius = lerp(15, 92, select);
		ctx.globalCompositeOperation = 'lighter';
		const halo = ctx.createRadialGradient(CX, CY, 0, CX, CY, radius * 4.2);
		halo.addColorStop(0, rgba(RED, 0.38 * select + 0.05));
		halo.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = halo;
		ctx.fillRect(CX - radius * 4.2, CY - radius * 4.2, radius * 8.4, radius * 8.4);
		ctx.globalCompositeOperation = 'source-over';

		const body = ctx.createRadialGradient(CX - radius * 0.3, CY - radius * 0.35, radius * 0.1, CX, CY, radius);
		body.addColorStop(0, rgba(RED, 0.3 + 0.7 * select));
		body.addColorStop(1, rgba(WINE, 0.35 + 0.6 * select));
		ctx.fillStyle = body;
		ctx.beginPath();
		ctx.arc(CX, CY, radius, 0, TAU);
		ctx.fill();
		ctx.strokeStyle = rgba(select > 0.1 ? [255, 255, 255] : PAPER, 0.35 + 0.55 * select);
		ctx.lineWidth = 1.6 + select;
		ctx.stroke();

		if (select > 0.55) {
			for (let k = 0; k < 2; k += 1) {
				const ring = frac(t / 2.2 + k / 2);
				ctx.strokeStyle = rgba(RED, 0.4 * (1 - ring) * select);
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(CX, CY, radius + ring * 150, 0, TAU);
				ctx.stroke();
			}
		}
		sceneVignette(ctx, W, H);
	},
};
