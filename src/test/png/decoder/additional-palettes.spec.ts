import fs from 'node:fs';
import path from 'node:path';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';
import { ColorTypes } from '../../../lib/png/types.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Additional palettes', () => {
	it('six-cube palette-chunk in true-color image', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'pp0n2c16.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('six-cube palette-chunk in true-color+alpha image', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'pp0n6a08.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColorAlpha);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('six-cube suggested palette (1 byte) in grayscale image, 8 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'ps1n0g08.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.strictEqual(png.suggestedPalette['six-cube'].length, 216);
		t.assert.snapshot(png.bitmap);
	});

	it('six-cube suggested palette (1 byte) in true-color image, 16 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'ps1n2c16.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});

	it('six-cube suggested palette (2 bytes) in grayscale image, 8 bit depth', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'ps2n0g08.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 8);
		t.assert.strictEqual(png.colorType, ColorTypes.Grayscale);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.strictEqual(png.suggestedPalette['six-cube'].length, 216);
		t.assert.snapshot(png.bitmap);
	});

	it('six-cube suggested palette (2 bytes) in true-color image', (t: TestContext) => {
		const image = fs.readFileSync(
			path.join(testdataDir, 'additional-palettes', 'ps2n2c16.png'),
		);
		const png = new PngDecoder(image);

		t.assert.strictEqual(png.width, 32);
		t.assert.strictEqual(png.height, 32);
		t.assert.strictEqual(png.bitDepth, 16);
		t.assert.strictEqual(png.colorType, ColorTypes.TrueColor);
		t.assert.strictEqual(png.bitmap.length, png.width * png.height * 4);
		t.assert.snapshot(png.bitmap);
	});
});
