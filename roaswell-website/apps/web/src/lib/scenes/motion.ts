import { PAPER, RED, TAU, WINE, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const BASE_RADIUS = 128;
const POINTS = 120;

function center(t: number) {
	const a = TAU * (t / DURATION);
	return { x: W / 2 + 270 * Math.sin(a), y: H / 2 + 110 * Math.sin(2 * a), vx: Math.cos(a), vy: Math.cos(2 * a) };
}

function blobPath(ctx: CanvasRenderingContext2D, t: number) {
	const c = center(t);
	const speed = Math.min(1, Math.hypot(c.vx, c.vy * 0.8));
	const stretch = 1 + 0.2 * speed;
	const angle = Math.atan2(c.vy * 0.8, c.vx);
	ctx.save();
	ctx.translate(c.x, c.y);
	ctx.rotate(angle);
	ctx.scale(stretch, 1 / stretch);
	ctx.rotate(-angle);
	ctx.beginPath();
	for (let i = 0; i <= POINTS; i += 1) {
		const theta = (i / POINTS) * TAU;
		const r =
			BASE_RADIUS *
			(1 +
				0.1 * Math.sin(3 * theta + TAU * (t / DURATION)) +
				0.07 * Math.sin(5 * theta - TAU * 2 * (t / DURATION)) +
				0.04 * Math.sin(2 * theta + TAU * 3 * (t / DURATION)));
		const x = Math.cos(theta) * r;
		const y = Math.sin(theta) * r;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
}

export const motionScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 1.6,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.07);

		ctx.strokeStyle = rgba(PAPER, 0.08);
		ctx.lineWidth = 1.2;
		ctx.beginPath();
		for (let i = 0; i <= 240; i += 1) {
			const c = center((i / 240) * DURATION);
			if (i === 0) ctx.moveTo(c.x, c.y);
			else ctx.lineTo(c.x, c.y);
		}
		ctx.stroke();

		for (let k = 12; k >= 1; k -= 1) {
			const past = (t - k * 0.05 + DURATION) % DURATION;
			blobPath(ctx, past);
			ctx.strokeStyle = rgba(RED, 0.2 * (1 - k / 13));
			ctx.lineWidth = 1.4;
			ctx.stroke();
			ctx.restore();
		}

		const c = center(t);
		ctx.globalCompositeOperation = 'lighter';
		const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, BASE_RADIUS * 3);
		glow.addColorStop(0, rgba(RED, 0.3));
		glow.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = glow;
		ctx.fillRect(c.x - BASE_RADIUS * 3, c.y - BASE_RADIUS * 3, BASE_RADIUS * 6, BASE_RADIUS * 6);
		ctx.globalCompositeOperation = 'source-over';

		blobPath(ctx, t);
		const fill = ctx.createRadialGradient(-BASE_RADIUS * 0.35, -BASE_RADIUS * 0.4, BASE_RADIUS * 0.1, 0, 0, BASE_RADIUS * 1.3);
		fill.addColorStop(0, rgba(RED, 0.95));
		fill.addColorStop(1, rgba(WINE, 0.9));
		ctx.fillStyle = fill;
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 1.8;
		ctx.stroke();
		ctx.restore();
		sceneVignette(ctx, W, H);
	},
};
