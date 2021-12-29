import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Interlacing', () => {
	it.skip('black & white', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi0g01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it.skip('2 bit (4 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi0g02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it.skip('4 bit (16 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi0g04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it.skip('8 bit (256 level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypeE.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it.skip('16 bit (64k level) grayscale', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi0g16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
	});

	it.skip('3x8 bits rgb color', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi2c08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('3x16 bits rgb color', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('1 bit (2 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('2 bit (4 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('4 bit (16 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('8 bit (256 color) paletted', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi3p08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('8 bit grayscale + 8 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi4a08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('16 bit grayscale + 16 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi4a16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('3x8 bits rgb color + 8 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi6a08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});

	it.skip('3x16 bits rgb color + 16 bit alpha-channel', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/basi6a16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
	});
});
