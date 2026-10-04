import { clamp, lerp, seg } from '@/lib/motion-math';
import { PAPER, RED, TAU, rgba, sceneBackground, sceneVignette, type Scene } from './helpers';

const W = 1280;
const H = 960;
const GX0 = 170;
const GX1 = 1110;
const GY0 = 600;
const GY1 = 170;
const TRACK_Y = 790;
const P1 = [0.16, 1];
const P2 = [0.3, 1];

function bezier(s: number, a: number, b: number) {
	const k = 1 - s;
	return 3 * k * k * s * a + 3 * k * s * s * b + s * s * s;
}

const CURVE = Array.from({ length: 241 }, (_, index) => {
	const s = index / 240;
	return { x: bezier(s, P1[0], P2[0]), y: bezier(s, P1[1], P2[1]) };
});

function curveY(u: number) {
	const x = clamp(u);
	let lo = 0;
	let hi = CURVE.length - 1;
	while (hi - lo > 1) {
		const mid = (lo + hi) >> 1;
		if (CURVE[mid].x < x) lo = mid;
		else hi = mid;
	}
	const span = CURVE[hi].x - CURVE[lo].x || 1;
	return lerp(CURVE[lo].y, CURVE[hi].y, (x - CURVE[lo].x) / span);
}

function progressAt(t: number) {
	if (t < 0.5) return 0;
	if (t < 2.7) return seg(t, 0.5, 2.7);
	if (t < 3.3) return 1;
	if (t < 5.5) return 1 - seg(t, 3.3, 5.5);
	return 0;
}

const px = (u: number) => lerp(GX0, GX1, u);
const py = (v: number) => lerp(GY0, GY1, v);

export const motionScene: Scene = {
	width: W,
	height: H,
	duration: 6,
	poster: 2.6,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.09);
		const u = progressAt(t);

		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.07)';
		for (let i = 0; i <= 4; i += 1) {
			ctx.beginPath();
			ctx.moveTo(px(i / 4), GY0);
			ctx.lineTo(px(i / 4), GY1);
			ctx.moveTo(GX0, py(i / 4));
			ctx.lineTo(GX1, py(i / 4));
			ctx.stroke();
		}
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.35)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(GX0, GY1 - 20);
		ctx.lineTo(GX0, GY0);
		ctx.lineTo(GX1 + 20, GY0);
		ctx.stroke();

		ctx.strokeStyle = 'rgba(244, 241, 234, 0.12)';
		ctx.lineWidth = 1.5;
		ctx.setLineDash([6, 8]);
		ctx.beginPath();
		ctx.moveTo(px(0), py(0));
		ctx.lineTo(px(P1[0]), py(P1[1]));
		ctx.moveTo(px(1), py(1));
		ctx.lineTo(px(P2[0]), py(P2[1]));
		ctx.stroke();
		ctx.setLineDash([]);
		for (const handle of [P1, P2]) {
			ctx.fillStyle = 'rgba(244, 241, 234, 0.35)';
			ctx.beginPath();
			ctx.arc(px(handle[0]), py(handle[1]), 7, 0, TAU);
			ctx.fill();
		}

		ctx.strokeStyle = 'rgba(244, 241, 234, 0.38)';
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		CURVE.forEach((point, index) => {
			if (index === 0) ctx.moveTo(px(point.x), py(point.y));
			else ctx.lineTo(px(point.x), py(point.y));
		});
		ctx.stroke();

		ctx.globalCompositeOperation = 'lighter';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = rgba(RED, 0.95);
		ctx.lineWidth = 6;
		ctx.shadowColor = rgba(RED, 0.9);
		ctx.shadowBlur = 18;
		ctx.beginPath();
		let started = false;
		for (const point of CURVE) {
			if (point.x > u) break;
			if (!started) {
				ctx.moveTo(px(point.x), py(point.y));
				started = true;
			} else {
				ctx.lineTo(px(point.x), py(point.y));
			}
		}
		if (started) ctx.lineTo(px(u), py(curveY(u)));
		ctx.stroke();
		ctx.shadowBlur = 0;

		const headX = px(u);
		const headY = py(curveY(u));
		const flare = ctx.createRadialGradient(headX, headY, 0, headX, headY, 60);
		flare.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
		flare.addColorStop(0.2, rgba(RED, 0.7));
		flare.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = flare;
		ctx.fillRect(headX - 60, headY - 60, 120, 120);

		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgba(244, 241, 234, 0.25)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(GX0, TRACK_Y);
		ctx.lineTo(GX1, TRACK_Y);
		ctx.stroke();
		for (const end of [0, 1]) {
			ctx.save();
			ctx.translate(px(end), TRACK_Y);
			ctx.rotate(Math.PI / 4);
			ctx.strokeStyle = 'rgba(244, 241, 234, 0.55)';
			ctx.lineWidth = 2;
			ctx.strokeRect(-9, -9, 18, 18);
			ctx.restore();
		}
		for (let k = 6; k >= 1; k -= 1) {
			const back = clamp(progressAt(Math.max(0, t - 0.04 * k)));
			ctx.fillStyle = rgba(RED, 0.09 * (7 - k));
			ctx.beginPath();
			ctx.arc(px(curveY(back)), TRACK_Y, 26, 0, TAU);
			ctx.fill();
		}
		const ballX = px(curveY(u));
		ctx.fillStyle = rgba(RED, 1);
		ctx.beginPath();
		ctx.arc(ballX, TRACK_Y, 26, 0, TAU);
		ctx.fill();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.beginPath();
		ctx.arc(ballX, TRACK_Y, 8, 0, TAU);
		ctx.fill();
		sceneVignette(ctx, W, H);
	},
};
