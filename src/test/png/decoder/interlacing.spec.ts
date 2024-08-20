import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Interlacing', () => {
	it('black & white', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi0g01.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 1);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('2 bit (4 level) grayscale', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi0g02.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 2);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('4 bit (16 level) grayscale', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi0g04.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 4);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('8 bit (256 level) grayscale', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('16 bit (64k level) grayscale', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('3x8 bits rgb color', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('3x16 bits rgb color', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('1 bit (2 color) paletted', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi3p01.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 1);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('2 bit (4 color) paletted', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi3p02.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 2);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('4 bit (16 color) paletted', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi3p04.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 4);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('8 bit (256 color) paletted', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('8 bit grayscale + 8 bit alpha-channel', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi4a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('16 bit grayscale + 16 bit alpha-channel', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi4a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('3x8 bits rgb color + 8 bit alpha-channel', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi6a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('3x16 bits rgb color + 16 bit alpha-channel', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'interlacing', 'basi6a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
