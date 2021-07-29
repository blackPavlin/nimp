import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Transparency', () => {
	it.skip('Transparent, black background chunk, 4 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbbn0g04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it.skip('Transparent, blue background chunk, 16 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbbn2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it('Transparent, black background chunk, 8 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbbn3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it.skip('Transparent, green background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbgn2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it('Transparent, light-gray background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbgn3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Transparent, red background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbrn2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it.skip('Transparent, white background chunk, bitdepth 16', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbwn0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('Transparent, white background chunk, bitdepth 8', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbwn3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Transparent, yellow background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tbyn3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Not transparent for reference (logo on gray), Grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tp0n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Not transparent for reference (logo on gray), TrueColor', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tp0n2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Not transparent for reference (logo on gray), IndexedColor', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tp0n3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Transparent, but no background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tp1n3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Multiple levels of transparency, 3 entries', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/tm3n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toMatchSnapshot();
	});
});
