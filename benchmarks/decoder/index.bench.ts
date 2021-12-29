import fs from 'fs';
import path from 'path';
import { Suite, Event } from 'benchmark';
import { PNG } from 'pngjs';
// import Decoder from '../../lib/decoder';
import Decoder from '../../src/decoder/main';
const suite = new Suite();

const image256x256 = fs.readFileSync(path.join(__dirname, './images/PngSuite.png'));

suite.add('Nimp - sync decode image 256x256', () => new Decoder(image256x256));

suite.add('Pngjs - sync decode image 256x256', () =>
	PNG.sync.read(image256x256, { checkCRC: true }),
);

suite.on('cycle', (event: Event) => {
	console.log(String(event.target));
});

suite.run();

// Nimp - sync decode image 256x256 x 123 ops/sec ±0.38% (79 runs sampled)
// Pngjs - sync decode image 256x256 x 502 ops/sec ±2.31% (83 runs sampled)
