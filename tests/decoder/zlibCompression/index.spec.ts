import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Zlib compression level', () => {
	it('Color, no interlacing, compression level 0 (none)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z00n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 3', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z03n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 6 (default)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z06n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 9 (maximum)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z09n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});
});
