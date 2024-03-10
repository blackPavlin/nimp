import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import Benchmark from 'benchmark';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// basn0g01 x 7,656 ops/sec ±21.65% (81 runs sampled)
// basn0g02 x 8,830 ops/sec ±1.45% (92 runs sampled)
// basn0g04 x 8,888 ops/sec ±1.56% (87 runs sampled)
// basn0g08 x 32,535 ops/sec ±0.65% (94 runs sampled)
// basn0g16 x 8,866 ops/sec ±0.53% (95 runs sampled)
// basn2c08 x 16,111 ops/sec ±2.41% (93 runs sampled)
// basn2c16 x 6,023 ops/sec ±0.71% (95 runs sampled)
// basn3p01 x 10,066 ops/sec ±2.74% (93 runs sampled)
// basn3p02 x 10,167 ops/sec ±0.45% (95 runs sampled)
// basn3p04 x 9,953 ops/sec ±2.46% (95 runs sampled)
// basn3p08 x 18,271 ops/sec ±0.82% (95 runs sampled)
// basn4a08 x 23,833 ops/sec ±2.03% (95 runs sampled)
// basn4a16 x 5,795 ops/sec ±0.17% (98 runs sampled)
// basn6a08 x 13,700 ops/sec ±2.78% (93 runs sampled)
// basn6a16 x 4,544 ops/sec ±0.14% (98 runs sampled)

// basi0g01 x 7,185 ops/sec ±3.78% (88 runs sampled)
// basi0g02 x 7,597 ops/sec ±2.72% (95 runs sampled)
// basi0g04 x 7,505 ops/sec ±0.09% (98 runs sampled)
// basi0g08 x 16,031 ops/sec ±2.72% (94 runs sampled)
// basi0g16 x 6,808 ops/sec ±0.10% (97 runs sampled)
// basi2c08 x 12,947 ops/sec ±2.71% (96 runs sampled)
// basi2c16 x 5,032 ops/sec ±0.66% (95 runs sampled)
// basi3p01 x 7,741 ops/sec ±3.33% (95 runs sampled)
// basi3p02 x 7,962 ops/sec ±0.57% (98 runs sampled)
// basi3p04 x 7,808 ops/sec ±2.13% (92 runs sampled)
// basi3p08 x 12,847 ops/sec ±0.47% (95 runs sampled)
// basi4a08 x 14,484 ops/sec ±1.70% (95 runs sampled)
// basi4a16 x 4,976 ops/sec ±0.13% (97 runs sampled)
// basi6a08 x 10,844 ops/sec ±2.86% (96 runs sampled)
// basi6a16 x 3,954 ops/sec ±0.08% (98 runs sampled)

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
