import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Chunk ordering', () => {
	it.skip('Grayscale mother image with 1 idat-chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi1n0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it.skip('Color mother image with 1 idat-chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi1n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it.skip('Grayscale image with 2 idat-chunks', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi2n0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it.skip('Color image with 2 idat-chunks', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi2n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it.skip('Grayscale image with 4 unequal sized idat-chunks', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi4n0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it.skip('Color image with 4 unequal sized idat-chunks', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi4n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it.skip('Grayscale image with all idat-chunks length one', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi9n0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it.skip('Color image with all idat-chunks length one', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/oi9n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});
});
