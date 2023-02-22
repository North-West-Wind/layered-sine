import { Canvas } from "canvas";
import * as fs from "fs";
import { encode } from "upng-js";
import { colorString, lcm } from "./utils";

export enum FillMode {
	LINE = 0,
	UP = 1,
	DOWN = 2
}

export class SineWave {
	// asin(kx-wt+p)+y
	amplitude: number;
	wavelength: number;
	waveNum: number;
	period: number;
	nFreq: number;
	// In radian
	phase: number;
	y: number;
	fill = FillMode.LINE;
	color = 0xFFFFFF;

	constructor(amplitude: number, wavelength: number, period: number, phase: number, y: number) {
		this.amplitude = amplitude;
		this.wavelength = wavelength;
		this.waveNum = 2 * Math.PI / wavelength;
		this.period = period;
		this.nFreq = 2 * Math.PI / period;
		this.phase = phase;
		this.y = y;
	}

	substitute(x: number, t: number) {
		return this.amplitude * Math.sin(this.waveNum * x - this.nFreq * t + this.phase) + this.y;
	}
}

/**
 * Draws a sine wave onto the canvas.
 * @param wave The sine wave to draw.
 * @param canvas The canvas to fill.
 * @param t Time. Also determines phase of wave.
 * @returns {Canvas} Canvas with sine wave drawn.
 */
export function drawSine(wave: SineWave, canvas: Canvas, t = 0): Canvas {
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = colorString(wave.color);
	switch (wave.fill) {
		case FillMode.UP:
			for (let ii = 0; ii < canvas.width; ii++)
				ctx.fillRect(ii, 0, 1, Math.round(wave.substitute(ii, t)));
			break;
		case FillMode.DOWN:
			for (let ii = 0; ii < canvas.width; ii++)
				ctx.fillRect(ii, Math.round(wave.substitute(ii, t)), 1, canvas.height);
			break;
		default:
			for (let ii = 0; ii < canvas.width; ii++)
				ctx.fillRect(ii, Math.round(wave.substitute(ii, t)), 1, 1);
	}
	return canvas;
}

/**
 * Generates frames for the animation and saves them in <path> as PNGs.
 * @param waves Sine wave(s) to draw.
 * @param canvas Background canvas.
 * @param fps Framerate of animation.
 * @param path Path to store the frames.
 * @returns {number} Number of PNGs generated.
 */
export function animateSinesFrames(waves: SineWave[], canvas: Canvas, fps: number, path: string): number {
	if (!fs.existsSync(path) || !fs.statSync(path).isDirectory()) fs.mkdirSync(path);
	if (!path.endsWith("/")) path += "/";

	const duration = waves.map(x => x.period).reduce((a, b) => lcm(a, b));
	const advance = 1 / fps;
	for (let ii = 0; ii < duration * fps; ii++) {
		var copy = new Canvas(canvas.width, canvas.height, "image");
		copy.getContext("2d").drawImage(canvas, 0, 0);
		for (const wave of waves) {
			copy = drawSine(wave, copy, advance * ii);
		}
		fs.writeFileSync(path + `frame-${ii}.png`, copy.toBuffer());
	}

	return duration * fps;
}

/**
 * Generates an animation of sine wave(s) moving.
 * @param waves Sine wave(s) to draw.
 * @param canvas Background canvas.
 * @param fps Framerate of animation.
 * @returns {ArrayBuffer} Buffer of animation (APNG format).
 */
export function animateSines(waves: SineWave[], canvas: Canvas, fps: number): ArrayBuffer {
	const duration = waves.map(x => x.period).reduce((a, b) => lcm(a, b));
	const advance = 1 / fps;
	const frames: ArrayBuffer[] = [];
	for (let ii = 0; ii < duration * fps; ii++) {
		var copy = new Canvas(canvas.width, canvas.height, "image");
		copy.getContext("2d").drawImage(canvas, 0, 0);
		for (const wave of waves) {
			copy = drawSine(wave, copy, advance * ii);
		}
		frames.push(copy.getContext("2d").getImageData(0, 0, copy.width, copy.height).data.buffer);
	}
	return encode(frames, canvas.width, canvas.height, 0, Array(frames.length).fill(advance * 1000));
}