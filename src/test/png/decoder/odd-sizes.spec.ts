import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Odd sizes', () => {
	describe('No interlacing', () => {
		it('1x1 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's01n3p01.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 1);
			t.assert.strictEqual(png.height, 1);
			t.assert.strictEqual(png.bitDepth, 1);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('2x2 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's02n3p01.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 2);
			t.assert.strictEqual(png.height, 2);
			t.assert.strictEqual(png.bitDepth, 1);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('3x3 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's03n3p01.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 3);
			t.assert.strictEqual(png.height, 3);
			t.assert.strictEqual(png.bitDepth, 1);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('4x4 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's04n3p01.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 4);
			t.assert.strictEqual(png.height, 4);
			t.assert.strictEqual(png.bitDepth, 1);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('5x5 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's05n3p02.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 5);
			t.assert.strictEqual(png.height, 5);
			t.assert.strictEqual(png.bitDepth, 2);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('6x6 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's06n3p02.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 6);
			t.assert.strictEqual(png.height, 6);
			t.assert.strictEqual(png.bitDepth, 2);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('7x7 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's07n3p02.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 7);
			t.assert.strictEqual(png.height, 7);
			t.assert.strictEqual(png.bitDepth, 2);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('8x8 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's08n3p02.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 8);
			t.assert.strictEqual(png.height, 8);
			t.assert.strictEqual(png.bitDepth, 2);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('9x9 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's09n3p02.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 9);
			t.assert.strictEqual(png.height, 9);
			t.assert.strictEqual(png.bitDepth, 2);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('32x32 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's32n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 32);
			t.assert.strictEqual(png.height, 32);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('33x33 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's33n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 33);
			t.assert.strictEqual(png.height, 33);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('34x34 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's34n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 34);
			t.assert.strictEqual(png.height, 34);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('35x35 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's35n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 35);
			t.assert.strictEqual(png.height, 35);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('36x36 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's36n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 36);
			t.assert.strictEqual(png.height, 36);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('37x37 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's37n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 37);
			t.assert.strictEqual(png.height, 37);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('38x38 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's38n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 38);
			t.assert.strictEqual(png.height, 38);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('39x39 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's39n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 39);
			t.assert.strictEqual(png.height, 39);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});

		it('40x40 paletted file', (t: TestContext) => {
			const image = fs.readFileSync(path.join(testdataDir, 'odd-sizes', 's40n3p04.png'));
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.width, 40);
			t.assert.strictEqual(png.height, 40);
			t.assert.strictEqual(png.bitDepth, 4);
			t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
			t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
			t.assert.snapshot(png.bitmap);
		});
	});
});
