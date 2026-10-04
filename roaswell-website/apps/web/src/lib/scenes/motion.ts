import { clamp } from '@/lib/motion-math';
import { PAPER, RED, TAU, WINE, frac, mix, rgba, roundRectPath, sceneBackground, sceneVignette, type Rgb, type Scene } from './helpers';

const W = 1280;
const H = 960;
const DURATION = 8;
const PATH_STEPS = 300;
const TUBE_STEPS = 6;
const CAMERA = 640;
const CENTER_X = W / 2;
const CENTER_Y = 368;
const SCALE = 94;
const WORD = 'MOTION';
const MONO = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInCubic = (x: number) => x * x * x;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type Vec = [number, number, number];

function knotPath(u: number): Vec {
	const radius = 2 + Math.cos(3 * u);
	return [radius * Math.cos(2 * u), radius * Math.sin(2 * u), Math.sin(3 * u)];
}

function ringPath(u: number): Vec {
	return [2.7 * Math.cos(u), 2.7 * Math.sin(u), 0.9 * Math.sin(4 * u)];
}

function centerline(u: number, morph: number): Vec {
	const a = knotPath(u);
	const b = ringPath(u);
	return [a[0] + (b[0] - a[0]) * morph, a[1] + (b[1] - a[1]) * morph, a[2] + (b[2] - a[2]) * morph];
}

function cross(a: Vec, b: Vec): Vec {
	return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(v: Vec): Vec {
	const length = Math.hypot(v[0], v[1], v[2]) || 1;
	return [v[0] / length, v[1] / length, v[2] / length];
}

function project(point: Vec, yaw: number, pitch: number) {
	const cosYaw = Math.cos(yaw);
	const sinYaw = Math.sin(yaw);
	const x1 = point[0] * cosYaw + point[2] * sinYaw;
	const z1 = -point[0] * sinYaw + point[2] * cosYaw;
	const cosPitch = Math.cos(pitch);
	const sinPitch = Math.sin(pitch);
	const y2 = point[1] * cosPitch - z1 * sinPitch;
	const z2 = point[1] * sinPitch + z1 * cosPitch;
	const depth = CAMERA / (CAMERA + z2 * SCALE);
	return { x: CENTER_X + x1 * SCALE * depth, y: CENTER_Y + y2 * SCALE * depth, depth, z: z2 };
}

function heat(color: Rgb, amount: number): Rgb {
	return mix(color, RED, amount);
}

function drawOrbits(ctx: CanvasRenderingContext2D, t: number) {
	ctx.globalCompositeOperation = 'lighter';
	ctx.lineWidth = 1;
	for (let ring = 0; ring < 3; ring += 1) {
		const radius = 300 + ring * 62;
		const tilt = 0.32 + ring * 0.07;
		const spin = (TAU * t) / DURATION;
		ctx.save();
		ctx.translate(CENTER_X, CENTER_Y);
		ctx.rotate(-0.28 + ring * 0.2);
		ctx.strokeStyle = rgba(PAPER, 0.07 + ring * 0.015);
		ctx.setLineDash([2, 9 + ring * 5]);
		ctx.beginPath();
		ctx.ellipse(0, 0, radius, radius * tilt, 0, 0, TAU);
		ctx.stroke();
		ctx.setLineDash([]);
		const direction = ring % 2 === 0 ? 1 : -1;
		const angle = direction * spin * (ring + 1) + ring * 2.1;
		const sx = Math.cos(angle) * radius;
		const sy = Math.sin(angle) * radius * tilt;
		const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18);
		glow.addColorStop(0, rgba(RED, 0.9));
		glow.addColorStop(1, rgba(RED, 0));
		ctx.fillStyle = glow;
		ctx.fillRect(sx - 18, sy - 18, 36, 36);
		ctx.fillStyle = rgba(PAPER, 0.95);
		ctx.beginPath();
		ctx.arc(sx, sy, 2.6, 0, TAU);
		ctx.fill();
		ctx.restore();
	}
}

function drawWord(ctx: CanvasRenderingContext2D, t: number) {
	ctx.globalCompositeOperation = 'source-over';
	ctx.font = '800 200px "Inter", "Helvetica Neue", Arial, sans-serif';
	ctx.textBaseline = 'alphabetic';
	const spacing = 14;
	const widths = [...WORD].map(letter => ctx.measureText(letter).width);
	const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (WORD.length - 1);
	let x = CENTER_X - total / 2;
	const baseline = CENTER_Y + 78;

	[...WORD].forEach((letter, index) => {
		const enter = easeOutExpo(clamp((t - 0.25 - index * 0.11) / 1.3));
		const exit = easeInCubic(clamp((t - 6.35 - index * 0.07) / 0.95));
		const visible = enter * (1 - exit);
		if (visible > 0.001) {
			const lift = (1 - enter) * 150 - exit * 90;
			ctx.save();
			ctx.translate(x + widths[index] / 2, baseline + lift);
			ctx.scale(1, 0.6 + 0.4 * enter);
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = rgba(PAPER, 0.2 * visible);
			ctx.textAlign = 'center';
			ctx.strokeText(letter, 0, 0);
			const sweep = frac((t - 0.8 - index * 0.14) / DURATION);
			const fillAlpha = 0.05 + 0.1 * Math.pow(Math.max(0, Math.sin(Math.PI * clamp(sweep * 3.2))), 2);
			ctx.fillStyle = rgba(RED, fillAlpha * visible);
			ctx.fillText(letter, 0, 0);
			ctx.restore();
		}
		x += widths[index] + spacing;
	});
}

function drawKnot(ctx: CanvasRenderingContext2D, t: number) {
	const cycle = t / DURATION;
	const morphWave = 0.5 - 0.5 * Math.cos(TAU * cycle);
	const morph = easeInOut(clamp((morphWave - 0.12) / 0.76));
	const yaw = TAU * cycle;
	const pitch = 0.55 + 0.28 * Math.sin(TAU * cycle);
	const travel = TAU * cycle * 2;

	const path: Vec[] = [];
	for (let i = 0; i <= PATH_STEPS; i += 1) path.push(centerline((i / PATH_STEPS) * TAU, morph));

	const tubeRadius = 0.34 + 0.06 * Math.sin(TAU * cycle * 2);

	ctx.globalCompositeOperation = 'lighter';
	const bloom = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, 380);
	bloom.addColorStop(0, rgba(RED, 0.22));
	bloom.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = bloom;
	ctx.fillRect(0, 0, W, 800);

	for (let i = 0; i < PATH_STEPS; i += 1) {
		const current = path[i];
		const next = path[i + 1];
		const tangent = normalize([next[0] - current[0], next[1] - current[1], next[2] - current[2]]);
		const helper: Vec = Math.abs(tangent[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
		const normalA = normalize(cross(tangent, helper));
		const normalB = cross(tangent, normalA);
		const along = i / PATH_STEPS;
		const pulse = Math.pow(0.5 + 0.5 * Math.sin(TAU * along * 2 - travel), 7);

		for (let k = 0; k < TUBE_STEPS; k += 1) {
			const angle = (k / TUBE_STEPS) * TAU + along * 14;
			const cosAngle = Math.cos(angle) * tubeRadius;
			const sinAngle = Math.sin(angle) * tubeRadius;
			const point: Vec = [
				current[0] + normalA[0] * cosAngle + normalB[0] * sinAngle,
				current[1] + normalA[1] * cosAngle + normalB[1] * sinAngle,
				current[2] + normalA[2] * cosAngle + normalB[2] * sinAngle,
			];
			const view = project(point, yaw, pitch);
			const facing = clamp(0.5 - view.z * 0.22);
			const base = mix(WINE, PAPER, Math.pow(facing, 1.8));
			const color = heat(base, clamp(pulse * 1.1 + 0.18 * (1 - facing)));
			const size = (0.9 + facing * 1.5 + pulse * 1.6) * view.depth;
			ctx.fillStyle = rgba(color, 0.35 + facing * 0.55);
			ctx.fillRect(view.x - size / 2, view.y - size / 2, size, size);
		}

		const view = project(current, yaw, pitch);
		const nextView = project(next, yaw, pitch);
		ctx.strokeStyle = rgba(RED, 0.1 + 0.55 * pulse);
		ctx.lineWidth = 0.8 + pulse * 1.6;
		ctx.beginPath();
		ctx.moveTo(view.x, view.y);
		ctx.lineTo(nextView.x, nextView.y);
		ctx.stroke();
	}

	const headIndex = Math.floor(frac(cycle * 2) * PATH_STEPS);
	const head = project(path[headIndex], yaw, pitch);
	const flare = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 40);
	flare.addColorStop(0, rgba(PAPER, 0.95));
	flare.addColorStop(0.25, rgba(RED, 0.8));
	flare.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = flare;
	ctx.fillRect(head.x - 40, head.y - 40, 80, 80);
}

function drawFrameMarks(ctx: CanvasRenderingContext2D, t: number) {
	ctx.globalCompositeOperation = 'source-over';
	ctx.strokeStyle = rgba(PAPER, 0.28);
	ctx.lineWidth = 1.2;
	const inset = 44;
	const arm = 22;
	const corners: [number, number, number, number][] = [
		[inset, inset, 1, 1],
		[W - inset, inset, -1, 1],
		[inset, 654, 1, -1],
		[W - inset, 654, -1, -1],
	];
	corners.forEach(([x, y, dx, dy]) => {
		ctx.beginPath();
		ctx.moveTo(x + dx * arm, y);
		ctx.lineTo(x, y);
		ctx.lineTo(x, y + dy * arm);
		ctx.stroke();
	});

	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';

	const frames = Math.floor(t * 60);
	const seconds = Math.floor(frames / 60);
	const code = `00:0${seconds}:${String(frames % 60).padStart(2, '0')}`;
	ctx.fillStyle = rgba(RED, 0.95);
	ctx.fillText(code, inset + 14, 630);
	ctx.textAlign = 'right';
	ctx.fillStyle = rgba(PAPER, 0.4);
	ctx.fillText('60 FPS  ·  4K  ·  LOOP', W - inset - 14, 630);
}

const TRACKS: { label: string; keys: number[] }[] = [
	{ label: 'POSITION', keys: [0.4, 1.9, 3.6, 5.6, 7.2] },
	{ label: 'SCALE', keys: [0.9, 2.7, 4.3, 6.4] },
	{ label: 'ROTATION', keys: [0.2, 2.2, 3.9, 5.1, 6.9] },
	{ label: 'OPACITY', keys: [0.6, 1.5, 4.8, 7.4] },
];

function drawTimeline(ctx: CanvasRenderingContext2D, t: number) {
	const x0 = 150;
	const x1 = 800;
	const top = 712;
	const rowHeight = 38;
	const panelTop = 688;

	ctx.globalCompositeOperation = 'source-over';
	roundRectPath(ctx, 56, panelTop, x1 - 56 + 24, 214, 18);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';

	for (let tick = 0; tick <= 8; tick += 1) {
		const x = x0 + ((x1 - x0) * tick) / 8;
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
		ctx.beginPath();
		ctx.moveTo(x, top - 6);
		ctx.lineTo(x, top + rowHeight * TRACKS.length + 4);
		ctx.stroke();
		ctx.fillStyle = rgba(PAPER, 0.32);
		ctx.fillText(`${tick}s`, x + 4, top - 12);
	}

	const playheadX = x0 + ((x1 - x0) * t) / DURATION;

	TRACKS.forEach((track, row) => {
		const y = top + row * rowHeight + rowHeight / 2;
		ctx.fillStyle = rgba(PAPER, 0.55);
		ctx.textAlign = 'left';
		ctx.fillText(track.label, 76, y);

		for (let i = 0; i < track.keys.length - 1; i += 1) {
			const startX = x0 + ((x1 - x0) * track.keys[i]) / DURATION;
			const endX = x0 + ((x1 - x0) * track.keys[i + 1]) / DURATION;
			const active = t >= track.keys[i] && t <= track.keys[i + 1];
			roundRectPath(ctx, startX + 3, y - 5, endX - startX - 6, 10, 5);
			ctx.fillStyle = active ? rgba(RED, 0.42) : 'rgba(255, 255, 255, 0.07)';
			ctx.fill();
			if (active) {
				const filled = ((t - track.keys[i]) / (track.keys[i + 1] - track.keys[i])) * (endX - startX - 6);
				roundRectPath(ctx, startX + 3, y - 5, Math.max(10, filled), 10, 5);
				ctx.fillStyle = rgba(RED, 0.95);
				ctx.fill();
			}
		}

		track.keys.forEach(key => {
			const x = x0 + ((x1 - x0) * key) / DURATION;
			const distance = Math.abs(t - key);
			const flash = Math.pow(clamp(1 - distance / 0.35), 2);
			const size = 6 + flash * 4;
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(Math.PI / 4);
			ctx.fillStyle = t >= key ? rgba(PAPER, 0.95) : rgba(PAPER, 0.4);
			if (flash > 0) {
				ctx.shadowColor = rgba(RED, 1);
				ctx.shadowBlur = 16 * flash;
			}
			ctx.fillRect(-size / 2, -size / 2, size, size);
			ctx.restore();
		});
	});

	ctx.shadowBlur = 0;
	const lineBottom = top + rowHeight * TRACKS.length + 8;
	const lineGlow = ctx.createLinearGradient(playheadX - 8, 0, playheadX + 8, 0);
	lineGlow.addColorStop(0, rgba(RED, 0));
	lineGlow.addColorStop(0.5, rgba(RED, 0.35));
	lineGlow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = lineGlow;
	ctx.fillRect(playheadX - 8, top - 22, 16, lineBottom - top + 22);
	ctx.fillStyle = rgba(RED, 1);
	ctx.fillRect(playheadX - 0.75, top - 22, 1.5, lineBottom - top + 22);
	ctx.beginPath();
	ctx.moveTo(playheadX - 6, top - 24);
	ctx.lineTo(playheadX + 6, top - 24);
	ctx.lineTo(playheadX, top - 14);
	ctx.closePath();
	ctx.fill();
}

function bezier(p1x: number, p1y: number, p2x: number, p2y: number, u: number): [number, number] {
	const inv = 1 - u;
	const x = 3 * inv * inv * u * p1x + 3 * inv * u * u * p2x + u * u * u;
	const y = 3 * inv * inv * u * p1y + 3 * inv * u * u * p2y + u * u * u;
	return [x, y];
}

function drawCurveEditor(ctx: CanvasRenderingContext2D, t: number) {
	const left = 850;
	const top = 688;
	const panelW = 374;
	const panelH = 214;
	const boxX = left + 40;
	const boxY = top + 34;
	const boxW = 292;
	const boxH = 150;

	ctx.globalCompositeOperation = 'source-over';
	roundRectPath(ctx, left, top, panelW, panelH, 18);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
	ctx.fill();
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.font = MONO;
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.fillStyle = rgba(PAPER, 0.55);
	ctx.fillText('EASING', left + 22, top + 20);

	const cycle = t / DURATION;
	const p1x = 0.3 + 0.16 * Math.sin(TAU * cycle);
	const p1y = 0.5 + 0.45 * Math.sin(TAU * cycle * 2 + 0.6);
	const p2x = 0.7 + 0.14 * Math.cos(TAU * cycle);
	const p2y = 0.9 - 0.5 * (0.5 + 0.5 * Math.cos(TAU * cycle * 2));

	const toX = (value: number) => boxX + value * boxW;
	const toY = (value: number) => boxY + boxH - value * boxH;

	ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
	for (let line = 0; line <= 4; line += 1) {
		ctx.beginPath();
		ctx.moveTo(boxX, boxY + (boxH * line) / 4);
		ctx.lineTo(boxX + boxW, boxY + (boxH * line) / 4);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(boxX + (boxW * line) / 4, boxY);
		ctx.lineTo(boxX + (boxW * line) / 4, boxY + boxH);
		ctx.stroke();
	}

	ctx.setLineDash([3, 5]);
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
	ctx.beginPath();
	ctx.moveTo(toX(0), toY(0));
	ctx.lineTo(toX(1), toY(1));
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.strokeStyle = rgba(PAPER, 0.4);
	ctx.beginPath();
	ctx.moveTo(toX(0), toY(0));
	ctx.lineTo(toX(p1x), toY(p1y));
	ctx.moveTo(toX(1), toY(1));
	ctx.lineTo(toX(p2x), toY(p2y));
	ctx.stroke();

	ctx.globalCompositeOperation = 'lighter';
	ctx.lineWidth = 2.4;
	ctx.strokeStyle = rgba(RED, 1);
	ctx.shadowColor = rgba(RED, 0.9);
	ctx.shadowBlur = 12;
	ctx.beginPath();
	for (let step = 0; step <= 60; step += 1) {
		const [x, y] = bezier(p1x, p1y, p2x, p2y, step / 60);
		if (step === 0) ctx.moveTo(toX(x), toY(y));
		else ctx.lineTo(toX(x), toY(y));
	}
	ctx.stroke();
	ctx.shadowBlur = 0;

	ctx.globalCompositeOperation = 'source-over';
	[
		[p1x, p1y],
		[p2x, p2y],
	].forEach(([x, y]) => {
		ctx.fillStyle = '#0a0a0d';
		ctx.strokeStyle = rgba(PAPER, 0.95);
		ctx.lineWidth = 1.6;
		ctx.beginPath();
		ctx.arc(toX(x), toY(y), 5.5, 0, TAU);
		ctx.fill();
		ctx.stroke();
	});

	const progress = easeInOut(frac(cycle * 2) < 0.5 ? frac(cycle * 2) * 2 : 2 - frac(cycle * 2) * 2);
	const [dotX, dotY] = bezier(p1x, p1y, p2x, p2y, progress);
	ctx.strokeStyle = rgba(RED, 0.35);
	ctx.lineWidth = 1;
	ctx.setLineDash([2, 4]);
	ctx.beginPath();
	ctx.moveTo(toX(dotX), toY(dotY));
	ctx.lineTo(toX(dotX), toY(0));
	ctx.moveTo(toX(dotX), toY(dotY));
	ctx.lineTo(toX(0), toY(dotY));
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.globalCompositeOperation = 'lighter';
	const dotGlow = ctx.createRadialGradient(toX(dotX), toY(dotY), 0, toX(dotX), toY(dotY), 20);
	dotGlow.addColorStop(0, rgba(PAPER, 0.95));
	dotGlow.addColorStop(0.3, rgba(RED, 0.7));
	dotGlow.addColorStop(1, rgba(RED, 0));
	ctx.fillStyle = dotGlow;
	ctx.fillRect(toX(dotX) - 20, toY(dotY) - 20, 40, 40);

	ctx.globalCompositeOperation = 'source-over';
	ctx.textAlign = 'right';
	ctx.fillStyle = rgba(PAPER, 0.4);
	ctx.fillText(`cubic-bezier(${p1x.toFixed(2)}, ${p1y.toFixed(2)}, ${p2x.toFixed(2)}, ${p2y.toFixed(2)})`, left + panelW - 20, top + 20);
}

export const motionScene: Scene = {
	width: W,
	height: H,
	duration: DURATION,
	poster: 3.1,
	draw(ctx, t) {
		sceneBackground(ctx, W, H, 0.09);
		drawOrbits(ctx, t);
		drawWord(ctx, t);
		drawKnot(ctx, t);
		drawFrameMarks(ctx, t);
		drawTimeline(ctx, t);
		drawCurveEditor(ctx, t);
		sceneVignette(ctx, W, H);
		ctx.globalCompositeOperation = 'source-over';
	},
};
