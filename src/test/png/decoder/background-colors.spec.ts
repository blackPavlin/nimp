import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Background colors', () => {
	it('8 bit grayscale, alpha, no background chunk, interlaced', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgai4a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, undefined);
		t.assert.snapshot(png.bitmap);
	});

	it('16 bit grayscale, alpha, no background chunk, interlaced', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgai4a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, undefined);
		t.assert.snapshot(png.bitmap);
	});

	it('3x8 bits rgb color, alpha, no background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgan6a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, undefined);
		t.assert.snapshot(png.bitmap);
	});

	it('3x16 bits rgb color, alpha, no background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgan6a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, undefined);
		t.assert.snapshot(png.bitmap);
	});

	it('8 bit grayscale, alpha, black background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgbn4a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, [0, 0, 0, 255]);
		t.assert.snapshot(png.bitmap);
	});

	it('16 bit grayscale, alpha, gray background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bggn4a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.GrayscaleAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, [171, 171, 171, 255]);
		t.assert.snapshot(png.bitmap);
	});

	it('3x8 bits rgb color, alpha, white background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgwn6a08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, [255, 255, 255, 255]);
		t.assert.snapshot(png.bitmap);
	});

	it('3x16 bits rgb color, alpha, yellow background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'background-colors', 'bgyn6a16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.deepStrictEqual(png.background, [255, 255, 0, 255]);
		t.assert.snapshot(png.bitmap);
	});
});
