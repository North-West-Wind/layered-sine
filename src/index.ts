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

export function drawSine(wave: SineWave, canvas: Canvas, t = 0) {
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

export function animateSinesFrames(waves: SineWave[], canvas: Canvas, fps: number, path: string) {
	if (!fs.statSync(path).isDirectory()) fs.mkdirSync(path);
	if (!path.endsWith("/")) path += "/";

	const duration = waves.map(x => x.period).reduce((a, b) => lcm(a, b));
	const advance = 1 / fps;
	for (let ii = 0; ii < duration * fps; ii++) {
		var copy = canvas;
		for (const wave of waves) {
			copy = drawSine(wave, copy, advance * ii);
		}
		fs.writeFileSync(path + `frame-${ii}.png`, copy.toBuffer());
	}
}

export function animateSines(waves: SineWave[], canvas: Canvas, fps: number) {
	const duration = waves.map(x => x.period).reduce((a, b) => lcm(a, b));
	const advance = 1 / fps;
	const frames: ArrayBuffer[] = [];
	for (let ii = 0; ii < duration * fps; ii++) {
		var copy = canvas;
		for (const wave of waves) {
			copy = drawSine(wave, copy, advance * ii);
		}
		frames.push(copy.getContext("2d").getImageData(0, 0, copy.width, copy.height).data.buffer);
	}
	return encode(frames, canvas.width, canvas.height, 0, Array(frames.length).fill(advance * 1000));
}