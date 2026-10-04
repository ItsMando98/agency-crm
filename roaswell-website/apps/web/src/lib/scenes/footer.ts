import { PAPER, RED, TAU, WINE, frac, mulberry32, rgba, type Scene } from './helpers';

const W = 1920;
const H = 800;
const DURATION = 8;
const BAR_COUNT = 110;
const PARTICLE_COUNT = 110;

const random = mulberry32(20260410);
const bars = Array.from({ length: BAR_COUNT }, () => ({
	phase: random(),
	cycles: random() > 0.5 ? 2 : 1,
	jitter: 0.03 + random() * 0.07,
}));
const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
	x: random() * W,
	phase: random(),
	cycles: 1 + Math.floor(random() * 3),
	sway: 8 + random() * 38,
	swayPhase: random(),
	size: 0.8 + random() * 2.4,
	warm: random() > 0.82,
}));
const glows = [
	{ x: 0.78, y: 0.38, r: 760, phase: 0, alpha: 0.32 },
	{ x: 0.22, y: 0.72, r: 620, phase: 0.33, alpha: 0.18 },
	{ x: 0.55, y: 0.95, r: 900, phase: 0.66, alpha: 0.24 },
];

function envelope(x: number, t: number) {
	const u = x / W;
	const ramp = 0.16 + 0.5 * Math.pow(u, 1.35);
	const swell = 0.8 + 0.2 * Math.sin(TAU * (t / DURATION + u * 2));
	return ramp * swell;
}

export const footerScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 3.2,
	draw(ctx, t) {
		ctx.globalCompositeOperation = 'source-over';
		const base = ctx.createLinearGradient(0, 0, 0, H);
		base.addColorStop(0, '#07070a');
		base.addColorStop(1, '#0d0508');
		ctx.fillStyle = base;
		ctx.fillRect(0, 0, W, H);

		ctx.globalCompositeOperation = 'lighter';
		for (const glow of glows) {
			const angle = TAU * (t / DURATION + glow.phase);
			const cx = glow.x * W + Math.sin(angle) * 140;
			const cy = glow.y * H + Math.cos(angle) * 70;
			const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glow.r);
			gradient.addColorStop(0, rgba(RED, glow.alpha));
			gradient.addColorStop(0.45, rgba(WINE, glow.alpha * 0.55));
			gradient.addColorStop(1, rgba(WINE, 0));
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, W, H);
		}

		const cx = W * 0.84;
		const cy = H * 1.12;
		for (let i = 0; i < 4; i += 1) {
			const progress = frac(t / DURATION + i / 4);
			ctx.strokeStyle = rgba(RED, Math.sin(progress * Math.PI) * 0.3);
			ctx.lineWidth = 1.5 + (1 - progress) * 2.5;
			ctx.beginPath();
			ctx.arc(cx, cy, 60 + progress * 980, 0, TAU);
			ctx.stroke();
		}

		const step = W / BAR_COUNT;
		const barWidth = step * 0.56;
		for (let i = 0; i < BAR_COUNT; i += 1) {
			const bar = bars[i];
			const x = i * step + (step - barWidth) / 2;
			const wave = Math.sin(TAU * (bar.cycles * (t / DURATION) + bar.phase));
			const level = envelope(x + barWidth / 2, t) + bar.jitter * wave;
			const height = Math.max(8, level * H * 0.64);
			const fill = ctx.createLinearGradient(0, H - height, 0, H);
			fill.addColorStop(0, rgba(RED, 0.5));
			fill.addColorStop(1, rgba(WINE, 0));
			ctx.fillStyle = fill;
			ctx.fillRect(x, H - height, barWidth, height);
			ctx.fillStyle = rgba(RED, 0.8);
			ctx.fillRect(x, H - height, barWidth, 2);
		}

		const head = frac(t / DURATION) * W;
		const points: Array<[number, number]> = [];
		for (let x = -20; x <= W + 20; x += 10) {
			const level = envelope(Math.min(Math.max(x, 0), W), t);
			points.push([x, H - level * H * 0.64 - 14]);
		}
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		for (const pass of [0, 1]) {
			for (let i = 1; i < points.length; i += 1) {
				const [x0, y0] = points[i - 1];
				const [x1, y1] = points[i];
				const trail = Math.exp(-((head - x1 + W) % W) / 520);
				if (pass === 0) {
					if (trail < 0.04) continue;
					ctx.strokeStyle = rgba(RED, 0.2 * trail);
					ctx.lineWidth = 12 + 10 * trail;
				} else {
					ctx.strokeStyle = `rgba(255, ${Math.round(70 + 150 * trail)}, ${Math.round(88 + 140 * trail)}, ${0.1 + 0.9 * trail})`;
					ctx.lineWidth = 2 + 3 * trail;
				}
				ctx.beginPath();
				ctx.moveTo(x0, y0);
				ctx.lineTo(x1, y1);
				ctx.stroke();
			}
		}
		const headY = H - envelope(head, t) * H * 0.64 - 14;
		const flare = ctx.createRadialGradient(head, headY, 0, head, headY, 90);
		flare.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
		flare.addColorStop(0.18, rgba(RED, 0.7));
		flare.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = flare;
		ctx.fillRect(head - 100, headY - 100, 200, 200);

		for (const particle of particles) {
			const progress = frac(particle.cycles * (t / DURATION) + particle.phase);
			const y = H + 24 - progress * (H + 48);
			const x = particle.x + Math.sin(TAU * (particle.cycles * (t / DURATION) + particle.swayPhase)) * particle.sway;
			const fade = Math.sin(progress * Math.PI);
			const color = particle.warm ? ([255, 206, 190] as const) : RED;
			const radius = particle.size * (0.7 + 0.5 * fade);
			const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 7);
			glow.addColorStop(0, rgba([color[0], color[1], color[2]], 0.5 * fade));
			glow.addColorStop(1, rgba([color[0], color[1], color[2]], 0));
			ctx.fillStyle = glow;
			ctx.fillRect(x - radius * 7, y - radius * 7, radius * 14, radius * 14);
			ctx.fillStyle = rgba(PAPER, 0.8 * fade);
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, TAU);
			ctx.fill();
		}

		ctx.globalCompositeOperation = 'source-over';
		const edge = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
		edge.addColorStop(0, 'rgba(7, 7, 10, 0)');
		edge.addColorStop(1, 'rgba(7, 7, 10, 0.78)');
		ctx.fillStyle = edge;
		ctx.fillRect(0, 0, W, H);
	},
};
