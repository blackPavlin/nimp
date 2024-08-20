import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Zlib compression level', () => {
	it('color, no interlacing, compression level 0 (none)', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'zlib-compression', 'z00n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, compression level 3', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'zlib-compression', 'z03n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, compression level 6 (default)', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'zlib-compression', 'z06n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('color, no interlacing, compression level 9 (maximum)', (t: TestContext) => {
		const image = fs.readFileSync(path.join(testdataDir, 'zlib-compression', 'z09n2c08.png'));
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
