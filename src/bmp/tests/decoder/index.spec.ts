import fs from 'fs';
import path from 'path';
import Decoder from '../../decoder';

describe('Decode BMP file', () => {
	it('Dev run', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g08.bmp'));
		const bmp = new Decoder(image);
	});
});
