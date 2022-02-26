import fs from 'fs';
import path from 'path';
import { Suite, Event } from 'benchmark';
import Decoder from '../../../src/png/decoder';

// basn0g01 x 19,649 ops/sec ±0.79% (93 runs sampled)
// basn0g02 x 17,238 ops/sec ±0.31% (91 runs sampled)
// basn0g04 x 12,969 ops/sec ±0.32% (95 runs sampled)
// basn0g08 x 20,008 ops/sec ±7.80% (76 runs sampled)
// basn0g16 x 19,036 ops/sec ±3.71% (91 runs sampled)
// basn2c08 x 15,740 ops/sec ±6.41% (82 runs sampled)
// basn2c16 x 10,083 ops/sec ±2.32% (92 runs sampled)
// basn3p01 x 19,259 ops/sec ±0.28% (95 runs sampled)
// basn3p02 x 15,970 ops/sec ±2.58% (92 runs sampled)
// basn3p04 x 12,196 ops/sec ±0.26% (95 runs sampled)
// basn3p08 x 14,225 ops/sec ±3.49% (91 runs sampled)
// basn4a08 x 19,147 ops/sec ±7.96% (78 runs sampled)
// basn4a16 x 11,721 ops/sec ±4.09% (92 runs sampled)
// basn6a08 x 17,607 ops/sec ±5.77% (63 runs sampled)
// basn6a16 x 6,983 ops/sec ±4.37% (73 runs sampled)

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

suite.on('cycle', (event: Event) => {
	console.log(String(event.target));
});

suite.run();
