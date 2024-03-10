import fs from 'node:fs';
import path from 'node:path';
import PngDecoder from '../../../decoder/index.js';

describe('Gamma values', () => {
	it('Grayscale, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g03n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.35);
	});

	it('Color, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g03n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.35);
	});

	it('Paletted, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g03n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.35);
	});

	it('Grayscale, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g04n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.45);
	});

	it('Color, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g04n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.45);
	});

	it('Paletted, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g04n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.45);
	});

	it('Grayscale, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g05n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.55);
	});

	it('Color, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g05n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.55);
	});

	it('Paletted, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g05n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.55);
	});

	it('Grayscale, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g07n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.7);
	});

	it('Color, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g07n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.7);
	});

	it('Paletted, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g07n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(0.7);
	});

	it('Grayscale, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g10n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(1);
	});

	it('Color, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g10n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(1);
	});

	it('Paletted, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g10n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(1);
	});

	it('Grayscale, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g25n0g16.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(2.5);
	});

	it('Color, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g25n2c08.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(2.5);
	});

	it('Paletted, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/g25n3p04.png'));
		const png = new PngDecoder(image);

		expect(png.gamma).toBe(2.5);
	});
});
