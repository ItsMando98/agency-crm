import { clamp, easeInOutCubic, seg } from '@/lib/motion-math';
import { PAPER, RED, TAU, mix, rgba, roundRectPath, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const ROW_COUNT = 6;
const ROW_X = 170;
const ROW_W = 940;
const ROW_H = 92;
const ROW_TOP = 290;
const ROW_STEP = 106;

function rankAt(t: number) {
	if (t < 0.6) return 5;
	if (t < 2.7) return 5 - 5 * seg(t, 0.6, 2.7, easeInOutCubic);
	if (t < 3.7) return 0;
	if (t < 5.5) return 5 * seg(t, 3.7, 5.5, easeInOutCubic);
	return 5;
}

function drawRow(ctx: CanvasRenderingContext2D, pos: number, active: boolean, glowAmount: number) {
	const y = ROW_TOP + pos * ROW_STEP;
	const accent = active ? RED : PAPER;
	ctx.save();
	if (active) {
		const cx = ROW_X + ROW_W / 2;
		const cy = y + ROW_H / 2;
		ctx.globalCompositeOperation = 'lighter';
		const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 620);
		glow.addColorStop(0, rgba(RED, 0.2 * glowAmount));
		glow.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = glow;
		ctx.fillRect(0, y - 300, W, 700);
		ctx.globalCompositeOperation = 'source-over';
		ctx.translate(cx, cy);
		ctx.scale(1.025, 1.025);
		ctx.translate(-cx, -cy);
		ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
		ctx.shadowBlur = 36;
		roundRectPath(ctx, ROW_X, y, ROW_W, ROW_H, 20);
		ctx.fillStyle = '#0b0b0e';
		ctx.fill();
		ctx.shadowBlur = 0;
	}
	roundRectPath(ctx, ROW_X, y, ROW_W, ROW_H, 20);
	ctx.fillStyle = active ? rgba(RED, 0.1) : 'rgba(244, 241, 234, 0.035)';
	ctx.fill();
	ctx.lineWidth = active ? 2 : 1.5;
	ctx.strokeStyle = active ? rgba(RED, 0.95) : 'rgba(244, 241, 234, 0.14)';
	ctx.stroke();
	ctx.fillStyle = rgba(accent, active ? 0.95 : 0.2);
	ctx.beginPath();
	ctx.arc(ROW_X + 46, y + ROW_H / 2, 15, 0, TAU);
	ctx.fill();
	roundRectPath(ctx, ROW_X + 92, y + 28, ROW_W * 0.5, 12, 6);
	ctx.fillStyle = rgba(accent, active ? 0.85 : 0.26);
	ctx.fill();
	roundRectPath(ctx, ROW_X + 92, y + 52, ROW_W * 0.32, 10, 5);
	ctx.fillStyle = rgba(accent, active ? 0.45 : 0.14);
	ctx.fill();
	ctx.restore();
}

export const seoScene: Scene = {
	width: W,
	height: H,
	duration: 6,
	poster: 3,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.1);
		const rank = rankAt(t);
		roundRectPath(ctx, ROW_X, 110, ROW_W, 96, 48);
		ctx.fillStyle = 'rgba(244, 241, 234, 0.04)';
		ctx.fill();
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.3)';
		ctx.stroke();
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.55)';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(ROW_X + 54, 156, 14, 0, TAU);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(ROW_X + 64, 166);
		ctx.lineTo(ROW_X + 76, 178);
		ctx.stroke();
		roundRectPath(ctx, ROW_X + 104, 150, 300, 12, 6);
		ctx.fillStyle = 'rgba(244, 241, 234, 0.3)';
		ctx.fill();

		for (let dot = 0; dot < ROW_COUNT; dot += 1) {
			const near = clamp(1 - Math.abs(rank - dot));
			ctx.fillStyle = rgba(mix(PAPER, RED, near), 0.25 + 0.75 * near);
			ctx.beginPath();
			ctx.arc(ROW_X + ROW_W - 190 + dot * 26, 158, 4 + 4 * near, 0, TAU);
			ctx.fill();
		}

		for (let k = 0; k < ROW_COUNT - 1; k += 1) {
			const pos = k + easeInOutCubic(clamp(k + 1 - rank, 0, 1));
			drawRow(ctx, pos, false, 0);
		}
		drawRow(ctx, rank, true, 0.6 + 0.4 * (1 - rank / 5));
		sceneVignette(ctx, W, H);
	},
};
