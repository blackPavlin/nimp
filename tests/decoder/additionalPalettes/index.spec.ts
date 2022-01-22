import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypes } from '../../../src/types';

describe('Additional palettes', () => {
	it.skip('Six-cube palette-chunk in true-color image', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/pp0n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it('Six-cube palette-chunk in true-color+alpha image', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/pp0n6a08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.TrueColorAlpha);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('Six-cube suggested palette (1 byte) in grayscale image, 8 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ps1n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();

		expect(png.suggestedPalette['six-cube']).toBeDefined();
		expect(png.suggestedPalette['six-cube']).toHaveLength(216);
	});

	it.skip('Six-cube suggested palette (1 byte) in true-color image, 16 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ps1n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});

	it('Six-cube suggested palette (2 bytes) in grayscale image, 8 bit depth', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ps2n0g08.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(8);
		expect(png.colorType).toBe(ColorTypes.Grayscale);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();

		expect(png.suggestedPalette['six-cube']).toBeDefined();
		expect(png.suggestedPalette['six-cube']).toHaveLength(216);
	});

	it.skip('Six-cube suggested palette (2 bytes) in true-color image', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ps2n2c16.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(16);
		expect(png.colorType).toBe(ColorTypes.TrueColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
	});
});
