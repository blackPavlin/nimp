import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Image filtering', () => {
	it('grayscale, no interlacing, filter-type 0', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f00n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, filter-type 0', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f00n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('grayscale, no interlacing, filter-type 1', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f01n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, filter-type 1', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f01n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('grayscale, no interlacing, filter-type 2', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f02n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, filter-type 2', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f02n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('grayscale, no interlacing, filter-type 3', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f03n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, filter-type 3', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f03n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('grayscale, no interlacing, filter-type 4', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f04n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, filter-type 4', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f04n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('bit-depth 4, filter changing per scanline', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'image-fitlering', 'f99n0g04.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 4);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
