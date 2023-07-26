import { Canvas } from "canvas";
import { colorString } from "./utils";

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
export function drawSine<T extends Canvas | HTMLCanvasElement>(wave: SineWave, canvas: T, t = 0): T {
	const ctx = <CanvasRenderingContext2D> canvas.getContext("2d");
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

export { animateSinesFrames, animateSines } from "./fs";