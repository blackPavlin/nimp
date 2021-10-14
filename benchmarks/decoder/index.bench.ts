import fs from 'fs';
import path from 'path';
import { Suite, Event } from 'benchmark';
import Decoder from '../../lib/decoder';
const suite = new Suite();

const image256x256 = fs.readFileSync(path.join(__dirname, './images/PngSuite.png'));

suite.add('Decode image 256x256', () => new Decoder(image256x256));

suite.on('cycle', (event: Event) => {
	console.log(String(event.target));
});

suite.run();
