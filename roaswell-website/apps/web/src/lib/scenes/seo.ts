import { easeInOutCubic, seg } from '@/lib/motion-math';
import { PAPER, RED, TAU, rgba, sceneBackground, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const LINE_COUNT = 24;
const X0 = -24;
const X1 = W + 24;
const Y_TOP = 250;
const Y_BOTTOM = 790;
const STEP = 6;
const BG = '#09090c';

function highlightBase(t: number) {
	if (t < 0.8) return Y_BOTTOM + 10;
	if (t < 3.8) return Y_BOTTOM + 10 - (Y_BOTTOM - Y_TOP + 30) * seg(t, 0.8, 3.8, easeInOutCubic);
	if (t < 4.8) return Y_TOP - 20;
	if (t < 7.6) return Y_TOP - 20 + (Y_BOTTOM - Y_TOP + 30) * seg(t, 4.8, 7.6, easeInOutCubic);
	return Y_BOTTOM + 10;
}

function ridge(index: number, base: number, boost: number, t: number): Array<[number, number]> {
	const points: Array<[number, number]> = [];
	for (let x = X0; x <= X1; x += STEP) {
		const envelope = Math.exp(-Math.pow((x - 640) / 310, 2));
		const slow = Math.sin(TAU * (x / 360 + t / DURATION + index * 0.11));
		const fast = Math.sin(TAU * (x / 150 - (2 * t) / DURATION + index * 0.29));
		const detail = Math.sin(TAU * (x / 70 + (3 * t) / DURATION + index * 0.47));
		const y = base - envelope * boost * (30 * slow + 13 * fast + 5 * detail);
		points.push([x, y]);
	}
	return points;
}

function trace(ctx: CanvasRenderingContext2D, points: Array<[number, number]>) {
	ctx.beginPath();
	points.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
}

export const seoScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 2.4,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.07);

		const lines = Array.from({ length: LINE_COUNT }, (_, index) => ({
			index,
			base: Y_TOP + ((Y_BOTTOM - Y_TOP) * index) / (LINE_COUNT - 1),
			highlight: false,
		}));
		lines.sort((a, b) => a.base - b.base);
		lines.push({ index: 99, base: highlightBase(t), highlight: true });

		ctx.lineJoin = 'round';
		for (const line of lines) {
			const points = ridge(line.index, line.base, line.highlight ? 1.15 : 1, t);
			const depth = (line.base - Y_TOP) / (Y_BOTTOM - Y_TOP);

			if (!line.highlight) {
				ctx.beginPath();
				ctx.moveTo(points[0][0], H);
				for (const [x, y] of points) ctx.lineTo(x, y);
				ctx.lineTo(points[points.length - 1][0], H);
				ctx.closePath();
				ctx.fillStyle = BG;
				ctx.fill();
			}

			if (line.highlight) {
				ctx.globalCompositeOperation = 'lighter';
				trace(ctx, points);
				ctx.strokeStyle = rgba(RED, 0.18);
				ctx.lineWidth = 14;
				ctx.stroke();
				ctx.globalCompositeOperation = 'source-over';
				trace(ctx, points);
				ctx.strokeStyle = rgba(RED, 1);
				ctx.lineWidth = 3;
				ctx.stroke();
			} else {
				trace(ctx, points);
				ctx.strokeStyle = rgba(PAPER, 0.1 + 0.3 * Math.max(0, Math.min(1, depth)));
				ctx.lineWidth = 1.4;
				ctx.stroke();
			}
		}

	},
};
