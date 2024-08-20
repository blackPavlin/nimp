import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { describe, it, TestContext } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Ancillary chunks', () => {
	describe('Chroma chunk', () => {
		it('w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ccwn2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.chromaticities, {
				white: { x: 0.3127, y: 0.329 },
				red: { x: 0.64, y: 0.33 },
				green: { x: 0.3, y: 0.6 },
				blue: { x: 0.15, y: 0.06 },
			});
		});

		it('w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ccwn3p08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.chromaticities, {
				white: { x: 0.3127, y: 0.329 },
				red: { x: 0.64, y: 0.33 },
				green: { x: 0.3, y: 0.6 },
				blue: { x: 0.15, y: 0.06 },
			});
		});
	});

	describe('Physical pixel dimensions', () => {
		it('8x32 flat pixels', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cdfn2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.physicalDimensions?.pixelPerUnitX, 1);
			assert.strictEqual(png.physicalDimensions?.pixelPerUnitY, 4);
			assert.strictEqual(png.physicalDimensions?.unitSpecifier, 0);
		});

		it('32x8 high pixels', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cdhn2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.physicalDimensions?.pixelPerUnitX, 4);
			assert.strictEqual(png.physicalDimensions?.pixelPerUnitY, 1);
			assert.strictEqual(png.physicalDimensions?.unitSpecifier, 0);
		});

		it('8x8 square pixels', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cdsn2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.physicalDimensions?.pixelPerUnitX, 1);
			assert.strictEqual(png.physicalDimensions?.pixelPerUnitY, 1);
			assert.strictEqual(png.physicalDimensions?.unitSpecifier, 0);
		});

		it('1000 pixels per 1 meter', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cdun2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.physicalDimensions?.pixelPerUnitX, 1000);
			assert.strictEqual(png.physicalDimensions?.pixelPerUnitY, 1000);
			assert.strictEqual(png.physicalDimensions?.unitSpecifier, 1);
		});
	});

	describe('Histogram', () => {
		it('15 colors', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ch1n3p04.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.histogram.length, 15);
		});

		it('256 colors', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ch2n3p08.png'),
			);
			const png = new PngDecoder(image);

			assert.strictEqual(png.histogram.length, 256);
		});
	});

	describe('Time chunk', () => {
		it('modification time, 01-jan-2000 12:34:56', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cm0n0g04.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.time, Date.UTC(2000, 1, 1, 12, 34, 56));
		});

		it('modification time, 01-jan-1970 00:00:00', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cm7n0g04.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.time, Date.UTC(1970, 1, 1, 0, 0, 0));
		});

		it('modification time, 31-dec-1999 23:59:59', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cm9n0g04.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.time, Date.UTC(1999, 12, 31, 23, 59, 59));
		});
	});

	describe('Significant bits', () => {
		it('color, 13 significant bits', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs3n2c16.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, [13, 13, 13, 16]);
		});

		it('paletted, 3 significant bits', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs3n3p08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, [3, 3, 3, 8]);
		});

		it('color, 5 significant bits', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs5n2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, [5, 5, 5, 8]);
		});

		it('paletted, 5 significant bits', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs5n3p08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, [5, 5, 5, 8]);
		});

		it('color, 8 significant bits (reference)', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs8n2c08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, undefined);
		});

		it('paletted, 8 significant bits (reference)', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cs8n3p08.png'),
			);
			const png = new PngDecoder(image);

			assert.deepStrictEqual(png.significantBits, undefined);
		});
	});

	describe('Text chunk', () => {
		it('no textual data', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ct0n0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 0);
		});

		it('with textual data', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ct1n0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('with compressed textual data', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ctzn0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('UTF-8 international text - english', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cten0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('UTF-8 international text - finnish', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ctfn0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('UTF-8 international text - greek', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ctgn0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('UTF-8 international text - hindi', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'cthn0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});

		it('UTF-8 international text - japanese', (t: TestContext) => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'ctjn0g04.png'),
			);
			const png = new PngDecoder(image);

			t.assert.strictEqual(png.text.length, 6);
			t.assert.snapshot(png.text);
		});
	});

	describe('Exif chunk', () => {
		it.todo('chunk with jpeg exif data', () => {
			const image = fs.readFileSync(
				path.join(testdataDir, 'ancillary-chunks', 'exif2c08.png'),
			);
			new PngDecoder(image);
		});
	});
});
