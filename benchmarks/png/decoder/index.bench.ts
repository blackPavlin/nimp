import fs from 'fs';
import path from 'path';
import { Suite, Event } from 'benchmark';
import Decoder from '../../../src/png/decoder';

// basn0g01 x 18,500 ops/sec ±2.22% (89 runs sampled)
// basn0g02 x 15,581 ops/sec ±2.06% (87 runs sampled)
// basn0g04 x 11,916 ops/sec ±1.23% (89 runs sampled)
// basn0g08 x 18,865 ops/sec ±8.13% (73 runs sampled)
// basn0g16 x 19,493 ops/sec ±3.49% (90 runs sampled)
// basn2c08 x 15,624 ops/sec ±6.56% (80 runs sampled)
// basn2c16 x 10,087 ops/sec ±3.18% (89 runs sampled)
// basn3p01 x 19,877 ops/sec ±1.04% (90 runs sampled)
// basn3p02 x 16,693 ops/sec ±2.64% (88 runs sampled)
// basn3p04 x 12,645 ops/sec ±0.70% (93 runs sampled)
// basn3p08 x 14,859 ops/sec ±0.96% (93 runs sampled)
// basn4a08 x 19,445 ops/sec ±8.09% (75 runs sampled)
// basn4a16 x 13,215 ops/sec ±2.29% (95 runs sampled)
// basn6a08 x 18,102 ops/sec ±5.87% (64 runs sampled)
// basn6a16 x 6,994 ops/sec ±4.82% (71 runs sampled)

// basi0g01 x 5,779 ops/sec ±0.51% (92 runs sampled)
// basi0g02 x 5,887 ops/sec ±0.31% (95 runs sampled)
// basi0g04 x 5,198 ops/sec ±2.49% (93 runs sampled)
// basi0g08 x 6,537 ops/sec ±0.29% (93 runs sampled)
// basi0g16 x 6,227 ops/sec ±0.38% (95 runs sampled)
// basi2c08 x 6,207 ops/sec ±2.17% (95 runs sampled)
// basi2c16 x 5,129 ops/sec ±0.58% (93 runs sampled)
// basi3p01 x 5,933 ops/sec ±0.26% (95 runs sampled)
// basi3p02 x 5,673 ops/sec ±1.79% (94 runs sampled)
// basi3p04 x 5,105 ops/sec ±0.34% (94 runs sampled)
// basi3p08 x 5,523 ops/sec ±2.52% (94 runs sampled)
// basi4a08 x 6,408 ops/sec ±0.29% (95 runs sampled)
// basi4a16 x 5,043 ops/sec ±2.54% (95 runs sampled)
// basi6a08 x 6,540 ops/sec ±0.27% (93 runs sampled)
// basi6a16 x 4,547 ops/sec ±0.31% (93 runs sampled)

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

const suite = new Suite('Png decoder - no-interlacing');

suite.add('basn0g01', () => new Decoder(basn0g01));
suite.add('basn0g02', () => new Decoder(basn0g02));
suite.add('basn0g04', () => new Decoder(basn0g04));
suite.add('basn0g08', () => new Decoder(basn0g08));
suite.add('basn0g16', () => new Decoder(basn0g16));
suite.add('basn2c08', () => new Decoder(basn2c08));
suite.add('basn2c16', () => new Decoder(basn2c16));
suite.add('basn3p01', () => new Decoder(basn3p01));
suite.add('basn3p02', () => new Decoder(basn3p02));
suite.add('basn3p04', () => new Decoder(basn3p04));
suite.add('basn3p08', () => new Decoder(basn3p08));
suite.add('basn4a08', () => new Decoder(basn4a08));
suite.add('basn4a16', () => new Decoder(basn4a16));
suite.add('basn6a08', () => new Decoder(basn6a08));
suite.add('basn6a16', () => new Decoder(basn6a16));

suite.add('basi0g01', () => new Decoder(basi0g01));
suite.add('basi0g02', () => new Decoder(basi0g02));
suite.add('basi0g04', () => new Decoder(basi0g04));
suite.add('basi0g08', () => new Decoder(basi0g08));
suite.add('basi0g16', () => new Decoder(basi0g16));
suite.add('basi2c08', () => new Decoder(basi2c08));
suite.add('basi2c16', () => new Decoder(basi2c16));
suite.add('basi3p01', () => new Decoder(basi3p01));
suite.add('basi3p02', () => new Decoder(basi3p02));
suite.add('basi3p04', () => new Decoder(basi3p04));
suite.add('basi3p08', () => new Decoder(basi3p08));
suite.add('basi4a08', () => new Decoder(basi4a08));
suite.add('basi4a16', () => new Decoder(basi4a16));
suite.add('basi6a08', () => new Decoder(basi6a08));
suite.add('basi6a16', () => new Decoder(basi6a16));

suite.on('cycle', (event: Event) => {
	console.log(String(event.target));
});

suite.run();
