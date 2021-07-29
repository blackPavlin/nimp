import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Image filtering', () => {
	it('Grayscale, no interlacing, filter-type 0', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f00n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, filter-type 0', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f00n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Grayscale, no interlacing, filter-type 1', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f01n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, filter-type 1', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f01n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Grayscale, no interlacing, filter-type 2', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f02n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, filter-type 2', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f02n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Grayscale, no interlacing, filter-type 3', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f03n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, filter-type 3', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f03n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Grayscale, no interlacing, filter-type 4', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f04n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Color, no interlacing, filter-type 4', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f04n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it.skip('Bit-depth 4, filter changing per scanline', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/f99n0g04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});
});
