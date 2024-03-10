import fs from 'node:fs';
import path from 'node:path';
import PngDecoder from '../../../decoder/index.js';
import { ColorTypes } from '../../../types.js';

describe('Background colors', () => {
	it('8 bit grayscale, alpha, no background chunk, interlaced', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgai4a08.png'));
		const png = new PngDecoder(image);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.GrayscaleAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeUndefined();
	});

	it('16 bit grayscale, alpha, no background chunk, interlaced', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgai4a16.png'));
		const png = new PngDecoder(image);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.GrayscaleAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeUndefined();
	});

	it('3x8 bits rgb color, alpha, no background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgan6a08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColorAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeUndefined();
	});

	it('3x16 bits rgb color, alpha, no background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgan6a16.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.TrueColorAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeUndefined();
	});

	it('8 bit grayscale, alpha, black background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgbn4a08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.GrayscaleAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeDefined();
		expect(png.background).toStrictEqual([0, 0, 0, 255]);
	});

	it('16 bit grayscale, alpha, gray background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bggn4a16.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.GrayscaleAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeDefined();
		expect(png.background).toStrictEqual([171, 171, 171, 255]);
	});

	it('3x8 bits rgb color, alpha, white background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgwn6a08.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColorAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeDefined();
		expect(png.background).toStrictEqual([255, 255, 255, 255]);
	});

	it('3x16 bits rgb color, alpha, yellow background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgyn6a16.png'));
		const png = new PngDecoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.TrueColorAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.background).toBeDefined();
		expect(png.background).toStrictEqual([255, 255, 0, 255]);
	});
});
