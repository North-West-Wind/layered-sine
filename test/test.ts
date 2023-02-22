import { Canvas } from "canvas";
import * as fs from "fs";
import { SineWave, FillMode, animateSines, animateSinesFrames, drawSine } from "../lib";

const wave = new SineWave(4, 60, 1, 0, 20);
wave.fill = FillMode.UP;
wave.color = 0x555555;
const wave2 = new SineWave(3, 70, 1.5, Math.PI * Math.random(), 30);
wave2.fill = FillMode.UP;
wave2.color = 0x888888;
const wave3 = new SineWave(2.5, 80, 2, Math.PI * Math.random(), 45);
wave3.fill = FillMode.UP;
wave3.color = 0xaaaaaa;
const wave4 = new SineWave(2, 100, 3, Math.PI * Math.random(), 60);
wave4.fill = FillMode.UP;
wave4.color = 0xcccccc;

var canvas = new Canvas(100, 100, "image");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#eee";
ctx.fillRect(0, 0, canvas.width, canvas.height);
//animateSinesFrames([wave, wave2], canvas, 10, __dirname + "/frames");
fs.writeFileSync(__dirname + "/apng.png", Buffer.from(animateSines([wave, wave2, wave3, wave4].reverse(), canvas, 60)));