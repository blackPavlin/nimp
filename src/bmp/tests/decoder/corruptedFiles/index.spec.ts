import fs from 'fs';
import path from 'path';
import Decoder from '../../../decoder';

describe('Corrupted files', () => {
	it('A bitmap that has 1 bit per pixel and no palette', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/1bpp-no-palette.bmp'));
		const bmp = new Decoder(image);
	});

	it('A 1 bpp bitmap that ends in the middle of the pixel data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/1bpp-pixeldata-cropped.bmp'));
		const bmp = new Decoder(image);
	});

	it('A 24 bpp bitmap that ends in the middle of the pixel data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/24bpp-pixeldata-cropped.bmp'));
		const bmp = new Decoder(image);
	});

	it('A 32 bpp bitmap that ends in the middle of the pixel data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/32bpp-pixeldata-cropped.bmp'));
		const bmp = new Decoder(image);
	});

	it('A bitmap that has 4 bit per pixel and no palette', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/4bpp-no-palette.bmp'));
		const bmp = new Decoder(image);
	});

	it('An 4 bpp bitmap that ends in the middle of the pixel data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/4bpp-pixeldata-cropped.bmp'));
		const bmp = new Decoder(image);
	});

	it('A 5-5-5 16 bpp bitmap that ends in the middle of the pixel data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/555-pixeldata-cropped.bmp'));
		const bmp = new Decoder(image);
	});

	it('An 8 bpp bitmap with five colors, but a very large "biColorsImportant" field', () => {
		const image = fs.readFileSync(
			path.join(__dirname, './images/8bpp-colorsimportant-large.bmp'),
		);
		const bmp = new Decoder(image);
	});

	it('An 8 bpp bitmap with a negative "biColorsImportant" field', () => {
		const image = fs.readFileSync(
			path.join(__dirname, './images/8bpp-colorsimportant-negative.bmp'),
		);
		const bmp = new Decoder(image);
	});

	it('An 8 bpp bitmap with a very large "biColorsUsed" field', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/8bpp-colorsused-large.bmp'));
		const bmp = new Decoder(image);
	});
});
