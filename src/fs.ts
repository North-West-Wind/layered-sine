import { Canvas } from "canvas";
import * as fs from "fs";
import { encode } from "upng-js";
import { SineWave, drawSine } from ".";
import { lcm } from "./utils";

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