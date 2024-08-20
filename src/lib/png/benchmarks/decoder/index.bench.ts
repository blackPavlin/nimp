import fs from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import { PngDecoder } from '../../decoder.js';

// basn0g01 x 31,765 ops/sec ±0.95% (94 runs sampled)
// basn0g02 x 27,197 ops/sec ±1.02% (95 runs sampled)
// basn0g04 x 20,890 ops/sec ±1.09% (95 runs sampled)
// basn0g08 x 42,576 ops/sec ±1.59% (90 runs sampled)
// basn0g16 x 35,723 ops/sec ±1.20% (91 runs sampled)
// basn2c08 x 31,204 ops/sec ±1.25% (92 runs sampled)
// basn2c16 x 17,951 ops/sec ±1.29% (93 runs sampled)
// basn3p01 x 30,474 ops/sec ±1.29% (92 runs sampled)
// basn3p02 x 24,775 ops/sec ±0.91% (96 runs sampled)
// basn3p04 x 18,805 ops/sec ±0.62% (96 runs sampled)
// basn3p08 x 24,426 ops/sec ±0.80% (94 runs sampled)
// basn4a08 x 39,544 ops/sec ±1.58% (90 runs sampled)
// basn4a16 x 20,873 ops/sec ±0.54% (95 runs sampled)
// basn6a08 x 49,569 ops/sec ±0.59% (92 runs sampled)
// basn6a16 x 14,827 ops/sec ±0.63% (94 runs sampled)

// basi0g01 x 13,093 ops/sec ±0.33% (99 runs sampled)
// basi0g02 x 12,200 ops/sec ±1.13% (100 runs sampled)
// basi0g04 x 10,300 ops/sec ±0.68% (97 runs sampled)
// basi0g08 x 15,007 ops/sec ±0.23% (99 runs sampled)
// basi0g16 x 13,843 ops/sec ±0.23% (100 runs sampled)
// basi2c08 x 13,974 ops/sec ±0.25% (98 runs sampled)
// basi2c16 x 10,117 ops/sec ±0.37% (97 runs sampled)
// basi3p01 x 12,777 ops/sec ±0.30% (97 runs sampled)
// basi3p02 x 11,888 ops/sec ±0.22% (97 runs sampled)
// basi3p04 x 10,198 ops/sec ±0.22% (99 runs sampled)
// basi3p08 x 11,971 ops/sec ±0.17% (98 runs sampled)
// basi4a08 x 14,557 ops/sec ±0.23% (97 runs sampled)
// basi4a16 x 10,564 ops/sec ±0.30% (94 runs sampled)
// basi6a08 x 15,069 ops/sec ±0.52% (99 runs sampled)
// basi6a16 x 8,979 ops/sec ±0.34% (95 runs sampled)

// No-Interlacing
const basn0g01 = fs.readFileSync(path.join(import.meta.dirname, './images/basn0g01.png'));
const basn0g02 = fs.readFileSync(path.join(import.meta.dirname, './images/basn0g02.png'));
const basn0g04 = fs.readFileSync(path.join(import.meta.dirname, './images/basn0g04.png'));
const basn0g08 = fs.readFileSync(path.join(import.meta.dirname, './images/basn0g08.png'));
const basn0g16 = fs.readFileSync(path.join(import.meta.dirname, './images/basn0g16.png'));
const basn2c08 = fs.readFileSync(path.join(import.meta.dirname, './images/basn2c08.png'));
const basn2c16 = fs.readFileSync(path.join(import.meta.dirname, './images/basn2c16.png'));
const basn3p01 = fs.readFileSync(path.join(import.meta.dirname, './images/basn3p01.png'));
const basn3p02 = fs.readFileSync(path.join(import.meta.dirname, './images/basn3p02.png'));
const basn3p04 = fs.readFileSync(path.join(import.meta.dirname, './images/basn3p04.png'));
const basn3p08 = fs.readFileSync(path.join(import.meta.dirname, './images/basn3p08.png'));
const basn4a08 = fs.readFileSync(path.join(import.meta.dirname, './images/basn4a08.png'));
const basn4a16 = fs.readFileSync(path.join(import.meta.dirname, './images/basn4a16.png'));
const basn6a08 = fs.readFileSync(path.join(import.meta.dirname, './images/basn6a08.png'));
const basn6a16 = fs.readFileSync(path.join(import.meta.dirname, './images/basn6a16.png'));

// Interlacing
const basi0g01 = fs.readFileSync(path.join(import.meta.dirname, './images/basi0g01.png'));
const basi0g02 = fs.readFileSync(path.join(import.meta.dirname, './images/basi0g02.png'));
const basi0g04 = fs.readFileSync(path.join(import.meta.dirname, './images/basi0g04.png'));
const basi0g08 = fs.readFileSync(path.join(import.meta.dirname, './images/basi0g08.png'));
const basi0g16 = fs.readFileSync(path.join(import.meta.dirname, './images/basi0g16.png'));
const basi2c08 = fs.readFileSync(path.join(import.meta.dirname, './images/basi2c08.png'));
const basi2c16 = fs.readFileSync(path.join(import.meta.dirname, './images/basi2c16.png'));
const basi3p01 = fs.readFileSync(path.join(import.meta.dirname, './images/basi3p01.png'));
const basi3p02 = fs.readFileSync(path.join(import.meta.dirname, './images/basi3p02.png'));
const basi3p04 = fs.readFileSync(path.join(import.meta.dirname, './images/basi3p04.png'));
const basi3p08 = fs.readFileSync(path.join(import.meta.dirname, './images/basi3p08.png'));
const basi4a08 = fs.readFileSync(path.join(import.meta.dirname, './images/basi4a08.png'));
const basi4a16 = fs.readFileSync(path.join(import.meta.dirname, './images/basi4a16.png'));
const basi6a08 = fs.readFileSync(path.join(import.meta.dirname, './images/basi6a08.png'));
const basi6a16 = fs.readFileSync(path.join(import.meta.dirname, './images/basi6a16.png'));

const suite = new Benchmark.Suite('PngDecoder');

suite.add('basn0g01', () => new PngDecoder(basn0g01));
suite.add('basn0g02', () => new PngDecoder(basn0g02));
suite.add('basn0g04', () => new PngDecoder(basn0g04));
suite.add('basn0g08', () => new PngDecoder(basn0g08));
suite.add('basn0g16', () => new PngDecoder(basn0g16));
suite.add('basn2c08', () => new PngDecoder(basn2c08));
suite.add('basn2c16', () => new PngDecoder(basn2c16));
suite.add('basn3p01', () => new PngDecoder(basn3p01));
suite.add('basn3p02', () => new PngDecoder(basn3p02));
suite.add('basn3p04', () => new PngDecoder(basn3p04));
suite.add('basn3p08', () => new PngDecoder(basn3p08));
suite.add('basn4a08', () => new PngDecoder(basn4a08));
suite.add('basn4a16', () => new PngDecoder(basn4a16));
suite.add('basn6a08', () => new PngDecoder(basn6a08));
suite.add('basn6a16', () => new PngDecoder(basn6a16));

suite.add('basi0g01', () => new PngDecoder(basi0g01));
suite.add('basi0g02', () => new PngDecoder(basi0g02));
suite.add('basi0g04', () => new PngDecoder(basi0g04));
suite.add('basi0g08', () => new PngDecoder(basi0g08));
suite.add('basi0g16', () => new PngDecoder(basi0g16));
suite.add('basi2c08', () => new PngDecoder(basi2c08));
suite.add('basi2c16', () => new PngDecoder(basi2c16));
suite.add('basi3p01', () => new PngDecoder(basi3p01));
suite.add('basi3p02', () => new PngDecoder(basi3p02));
suite.add('basi3p04', () => new PngDecoder(basi3p04));
suite.add('basi3p08', () => new PngDecoder(basi3p08));
suite.add('basi4a08', () => new PngDecoder(basi4a08));
suite.add('basi4a16', () => new PngDecoder(basi4a16));
suite.add('basi6a08', () => new PngDecoder(basi6a08));
suite.add('basi6a16', () => new PngDecoder(basi6a16));

suite.on('cycle', (event: Benchmark.Event) => {
	console.log(String(event.target));
});

suite.run();
