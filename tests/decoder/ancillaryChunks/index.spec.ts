import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';

describe('Time chunk', () => {
	it('Modification time, 01-jan-2000 12:34:56', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm0n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(2000, 1, 1, 12, 34, 56));
	});

	it('Modification time, 01-jan-1970 00:00:00', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm7n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(1970, 1, 1, 0, 0, 0));
	});

	it('Modification time, 31-dec-1999 23:59:59', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm9n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(1999, 12, 31, 23, 59, 59));
	});
});
