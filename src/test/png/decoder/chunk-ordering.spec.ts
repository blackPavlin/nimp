import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Chunk ordering', () => {
	it('grayscale mother image with 1 idat-chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi1n0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color mother image with 1 idat-chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi1n2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('grayscale image with 2 idat-chunks', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi2n0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('Color image with 2 idat-chunks', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi2n2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('Grayscale image with 4 unequal sized idat-chunks', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi4n0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('Color image with 4 unequal sized idat-chunks', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi4n2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('Grayscale image with all idat-chunks length one', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi9n0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('Color image with all idat-chunks length one', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'chunk-ordering', 'oi9n2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
