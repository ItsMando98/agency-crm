import { easeInOutCubic, pulse, seg } from '@/lib/motion-math';
import { PAPER, RED, frac, mix, rgba, roundRectPath, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const TILE_W = 330;
const TILE_H = 250;
const GAP = 30;
const ORIGIN_X = (W - (3 * TILE_W + 2 * GAP)) / 2;
const ORIGIN_Y = (H - (3 * TILE_H + 2 * GAP)) / 2;
const WINNER = 4;

function drawTile(ctx: CanvasRenderingContext2D, index: number, t: number, select: number) {
	const col = index % 3;
	const row = Math.floor(index / 3);
	const cx = ORIGIN_X + col * (TILE_W + GAP) + TILE_W / 2;
	const cy = ORIGIN_Y + row * (TILE_H + GAP) + TILE_H / 2;
	const winner = index === WINNER;
	const scan = pulse(t, index * 0.22, index * 0.22 + 0.2, index * 0.22 + 0.5);
	const scale = winner ? 1 + 0.1 * select : 1 - 0.02 * select;
	const dim = winner ? 1 : 1 - 0.8 * select;
	const accent = winner ? mix(PAPER, RED, select) : PAPER;

	ctx.save();
	ctx.translate(cx, cy);
	ctx.scale(scale, scale);
	ctx.globalAlpha = dim;
	if (winner && select > 0.01) {
		ctx.globalCompositeOperation = 'lighter';
		const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 380);
		glow.addColorStop(0, rgba(RED, 0.3 * select));
		glow.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = glow;
		ctx.fillRect(-420, -420, 840, 840);
		ctx.globalCompositeOperation = 'source-over';
	}
	roundRectPath(ctx, -TILE_W / 2, -TILE_H / 2, TILE_W, TILE_H, 22);
	ctx.fillStyle = winner ? rgba(RED, 0.04 + 0.2 * select) : rgba(PAPER, 0.03 + 0.1 * scan);
	ctx.fill();
	ctx.lineWidth = winner ? 1.5 + 1.5 * select : 1.5;
	ctx.strokeStyle = rgba(accent, winner ? 0.2 + 0.8 * select : 0.16 + 0.5 * scan);
	ctx.stroke();
	roundRectPath(ctx, -TILE_W / 2 + 26, -TILE_H / 2 + 26, TILE_W - 52, 118, 14);
	ctx.fillStyle = rgba(accent, winner ? 0.1 + 0.55 * select : 0.07 + 0.1 * scan);
	ctx.fill();
	roundRectPath(ctx, -TILE_W / 2 + 26, TILE_H / 2 - 74, 170, 12, 6);
	ctx.fillStyle = rgba(accent, winner ? 0.3 + 0.6 * select : 0.2 + 0.2 * scan);
	ctx.fill();
	roundRectPath(ctx, -TILE_W / 2 + 26, TILE_H / 2 - 48, 110, 10, 5);
	ctx.fillStyle = rgba(accent, winner ? 0.2 + 0.4 * select : 0.12 + 0.1 * scan);
	ctx.fill();
	ctx.restore();
}

export const metaScene: Scene = {
	width: W,
	height: H,
	duration: 6,
	poster: 3.9,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.08);
		const select = seg(t, 2.3, 3.4, easeInOutCubic) - seg(t, 5.1, 5.9, easeInOutCubic);
		for (let index = 0; index < 9; index += 1) {
			if (index !== WINNER) drawTile(ctx, index, t, select);
		}
		drawTile(ctx, WINNER, t, select);
		if (t > 3.2 && t < 4.8) {
			const ring = frac((t - 3.2) / 1.6);
			const cx = ORIGIN_X + TILE_W + GAP + TILE_W / 2;
			const cy = ORIGIN_Y + TILE_H + GAP + TILE_H / 2;
			ctx.strokeStyle = rgba(RED, 0.5 * (1 - ring));
			ctx.lineWidth = 2;
			roundRectPath(ctx, cx - TILE_W / 2 - ring * 70, cy - TILE_H / 2 - ring * 70, TILE_W + ring * 140, TILE_H + ring * 140, 22 + ring * 40);
			ctx.stroke();
		}
		sceneVignette(ctx, W, H);
	},
};
