import fs from 'fs';
import path from 'path';
import { Suite, Event } from 'benchmark';
import { PNG } from 'pngjs';

// basn0g01 x 9,419 ops/sec ±0.65% (91 runs sampled)
// basn0g02 x 9,966 ops/sec ±0.29% (94 runs sampled)
// basn0g04 x 9,740 ops/sec ±0.17% (96 runs sampled)
// basn0g08 x 32,691 ops/sec ±0.19% (93 runs sampled)
// basn0g16 x 8,758 ops/sec ±0.29% (96 runs sampled)
// basn2c08 x 16,096 ops/sec ±3.03% (95 runs sampled)
// basn2c16 x 5,975 ops/sec ±0.35% (94 runs sampled)
// basn3p01 x 9,967 ops/sec ±2.84% (92 runs sampled)
// basn3p02 x 9,902 ops/sec ±1.06% (87 runs sampled)
// basn3p04 x 9,806 ops/sec ±2.57% (94 runs sampled)
// basn3p08 x 18,194 ops/sec ±0.31% (95 runs sampled)
// basn4a08 x 23,790 ops/sec ±2.56% (93 runs sampled)
// basn4a16 x 5,748 ops/sec ±0.27% (95 runs sampled)
// basn6a08 x 14,690 ops/sec ±2.97% (91 runs sampled)
// basn6a16 x 4,505 ops/sec ±0.22% (96 runs sampled)

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

const suite = new Suite('Pngjs - no-interlacing');

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

suite.on('cycle', (event: Event) => {
	console.log(String(event.target));
});

suite.run();
