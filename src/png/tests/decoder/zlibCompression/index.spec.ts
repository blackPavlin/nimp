import fs from 'node:fs';
import path from 'node:path';
import PngDecoder from '../../../decoder/index.js';
import { ColorTypes } from '../../../types.js';

describe('Zlib compression level', () => {
	it('Color, no interlacing, compression level 0 (none)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z00n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 3', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z03n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 6 (default)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z06n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, compression level 9 (maximum)', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/z09n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});
});
