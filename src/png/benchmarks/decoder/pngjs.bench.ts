import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import Benchmark from 'benchmark';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// basn0g01 x 16,948 ops/sec ±0.43% (91 runs sampled)
// basn0g02 x 16,359 ops/sec ±3.09% (90 runs sampled)
// basn0g04 x 16,254 ops/sec ±1.61% (96 runs sampled)
// basn0g08 x 51,406 ops/sec ±0.35% (96 runs sampled)
// basn0g16 x 13,529 ops/sec ±0.20% (99 runs sampled)
// basn2c08 x 22,977 ops/sec ±1.48% (94 runs sampled)
// basn2c16 x 8,562 ops/sec ±0.20% (99 runs sampled)
// basn3p01 x 15,261 ops/sec ±0.18% (99 runs sampled)
// basn3p02 x 15,182 ops/sec ±0.24% (97 runs sampled)
// basn3p04 x 14,499 ops/sec ±0.19% (99 runs sampled)
// basn3p08 x 22,117 ops/sec ±0.25% (99 runs sampled)
// basn4a08 x 33,367 ops/sec ±0.31% (97 runs sampled)
// basn4a16 x 8,104 ops/sec ±0.24% (100 runs sampled)
// basn6a08 x 20,464 ops/sec ±0.72% (97 runs sampled)
// basn6a16 x 6,106 ops/sec ±0.19% (99 runs sampled)

// basi0g01 x 11,689 ops/sec ±0.32% (97 runs sampled)
// basi0g02 x 12,374 ops/sec ±0.13% (99 runs sampled)
// basi0g04 x 12,014 ops/sec ±0.23% (99 runs sampled)
// basi0g08 x 24,221 ops/sec ±0.62% (101 runs sampled)
// basi0g16 x 10,428 ops/sec ±0.28% (97 runs sampled)
// basi2c08 x 19,432 ops/sec ±0.35% (96 runs sampled)
// basi2c16 x 7,338 ops/sec ±0.20% (100 runs sampled)
// basi3p01 x 12,025 ops/sec ±0.20% (97 runs sampled)
// basi3p02 x 11,863 ops/sec ±2.06% (97 runs sampled)
// basi3p04 x 12,050 ops/sec ±0.26% (98 runs sampled)
// basi3p08 x 17,067 ops/sec ±0.65% (97 runs sampled)
// basi4a08 x 21,715 ops/sec ±0.32% (99 runs sampled)
// basi4a16 x 7,241 ops/sec ±0.23% (100 runs sampled)
// basi6a08 x 17,210 ops/sec ±0.33% (99 runs sampled)
// basi6a16 x 5,604 ops/sec ±0.16% (101 runs sampled)

// No-Interlacing
const basn0g01 = fs.readFileSync(path.join(__dirname, './images/basn0g01.png'));
const basn0g02 = fs.readFileSync(path.join(__dirname, './images/basn0g02.png'));
const basn0g04 = fs.readFileSync(path.join(__dirname, './images/basn0g04.png'));
const basn0g08 = fs.readFileSync(path.join(__dirname, './images/basn0g08.png'));
const basn0g16 = fs.readFileSync(path.join(__dirname, './images/basn0g16.png'));
const basn2c08 = fs.readFileSync(path.join(__dirname, './images/basn2c08.png'));
const basn2c16 = fs.readFileSync(path.join(__dirname, './images/basn2c16.png'));
const basn3p01 = fs.readFileSync(path.join(__dirname, './images/basn3p01.png'));
const basn3p02 = fs.readFileSync(path.join(__dirname, './images/basn3p02.png'));
const basn3p04 = fs.readFileSync(path.join(__dirname, './images/basn3p04.png'));
const basn3p08 = fs.readFileSync(path.join(__dirname, './images/basn3p08.png'));
const basn4a08 = fs.readFileSync(path.join(__dirname, './images/basn4a08.png'));
const basn4a16 = fs.readFileSync(path.join(__dirname, './images/basn4a16.png'));
const basn6a08 = fs.readFileSync(path.join(__dirname, './images/basn6a08.png'));
const basn6a16 = fs.readFileSync(path.join(__dirname, './images/basn6a16.png'));

// Interlacing
const basi0g01 = fs.readFileSync(path.join(__dirname, './images/basi0g01.png'));
const basi0g02 = fs.readFileSync(path.join(__dirname, './images/basi0g02.png'));
const basi0g04 = fs.readFileSync(path.join(__dirname, './images/basi0g04.png'));
const basi0g08 = fs.readFileSync(path.join(__dirname, './images/basi0g08.png'));
const basi0g16 = fs.readFileSync(path.join(__dirname, './images/basi0g16.png'));
const basi2c08 = fs.readFileSync(path.join(__dirname, './images/basi2c08.png'));
const basi2c16 = fs.readFileSync(path.join(__dirname, './images/basi2c16.png'));
const basi3p01 = fs.readFileSync(path.join(__dirname, './images/basi3p01.png'));
const basi3p02 = fs.readFileSync(path.join(__dirname, './images/basi3p02.png'));
const basi3p04 = fs.readFileSync(path.join(__dirname, './images/basi3p04.png'));
const basi3p08 = fs.readFileSync(path.join(__dirname, './images/basi3p08.png'));
const basi4a08 = fs.readFileSync(path.join(__dirname, './images/basi4a08.png'));
const basi4a16 = fs.readFileSync(path.join(__dirname, './images/basi4a16.png'));
const basi6a08 = fs.readFileSync(path.join(__dirname, './images/basi6a08.png'));
const basi6a16 = fs.readFileSync(path.join(__dirname, './images/basi6a16.png'));

const suite = new Benchmark.Suite('Pngjs - no-interlacing');

suite.add('basn0g01', () => PNG.sync.read(basn0g01));
suite.add('basn0g02', () => PNG.sync.read(basn0g02));
suite.add('basn0g04', () => PNG.sync.read(basn0g04));
suite.add('basn0g08', () => PNG.sync.read(basn0g08));
suite.add('basn0g16', () => PNG.sync.read(basn0g16));
suite.add('basn2c08', () => PNG.sync.read(basn2c08));
suite.add('basn2c16', () => PNG.sync.read(basn2c16));
suite.add('basn3p01', () => PNG.sync.read(basn3p01));
suite.add('basn3p02', () => PNG.sync.read(basn3p02));
suite.add('basn3p04', () => PNG.sync.read(basn3p04));
suite.add('basn3p08', () => PNG.sync.read(basn3p08));
suite.add('basn4a08', () => PNG.sync.read(basn4a08));
suite.add('basn4a16', () => PNG.sync.read(basn4a16));
suite.add('basn6a08', () => PNG.sync.read(basn6a08));
suite.add('basn6a16', () => PNG.sync.read(basn6a16));

suite.add('basi0g01', () => PNG.sync.read(basi0g01));
suite.add('basi0g02', () => PNG.sync.read(basi0g02));
suite.add('basi0g04', () => PNG.sync.read(basi0g04));
suite.add('basi0g08', () => PNG.sync.read(basi0g08));
suite.add('basi0g16', () => PNG.sync.read(basi0g16));
suite.add('basi2c08', () => PNG.sync.read(basi2c08));
suite.add('basi2c16', () => PNG.sync.read(basi2c16));
suite.add('basi3p01', () => PNG.sync.read(basi3p01));
suite.add('basi3p02', () => PNG.sync.read(basi3p02));
suite.add('basi3p04', () => PNG.sync.read(basi3p04));
suite.add('basi3p08', () => PNG.sync.read(basi3p08));
suite.add('basi4a08', () => PNG.sync.read(basi4a08));
suite.add('basi4a16', () => PNG.sync.read(basi4a16));
suite.add('basi6a08', () => PNG.sync.read(basi6a08));
suite.add('basi6a16', () => PNG.sync.read(basi6a16));

suite.on('cycle', (event: Benchmark.Event) => {
	console.log(String(event.target));
});

suite.run();
