import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Transparency', () => {
	it('transparent, black background chunk, 4 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbbn0g04.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 4);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, blue background chunk, 16 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbbn2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, black background chunk, 8 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbbn3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, green background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbgn2c16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, light-gray background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbgn3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, red background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbrn2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, white background chunk, bitdepth 16', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbwn0g16.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, white background chunk, bitdepth 8', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbwn3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('transparent, yellow background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tbyn3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('not transparent for reference (logo on gray), Grayscale', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tp0n0g08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('not transparent for reference (logo on gray), TrueColor', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tp0n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('not transparent for reference (logo on gray), IndexedColor', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tp0n3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('mransparent, but no background chunk', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tp1n3p08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('multiple levels of transparency, 3 entries', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'transparency', 'tm3n3p02.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 2);
		t.assert.strictEqual(png.colorType, ColorTypes.IndexedColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
