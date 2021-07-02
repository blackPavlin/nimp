import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Basic formats', () => {
	it('black & white', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('2 bit (4 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('4 bit (16 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('8 bit (256 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('16 bit (64k level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
	});

	it('3x8 bits rgb color', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it('3x16 bits rgb color', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColor);
	});

	it('1 bit (2 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
	});

	it('2 bit (4 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
	});

	it('4 bit (16 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
	});

	it('8 bit (256 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
	});

	it('8 bit grayscale + 8 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn4a08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.GrayscaleAlpha);
	});

	it('16 bit grayscale + 16 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn4a16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.GrayscaleAlpha);
	});

	it('3x8 bits rgb color + 8 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn6a08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.TrueColorAlpha);
	});

	it('3x16 bits rgb color + 16 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basn6a16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypeE.TrueColorAlpha);
	});
});
