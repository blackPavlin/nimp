import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Corrupted files', () => {
	it('signature byte 1 MSBit reset to zero', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xs1n0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('signature byte 2 is a "Q"', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xs2n0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('signature byte 4 lowercase', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xs4n0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('7th byte a space instead of control-Z', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xs7n0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('added cr bytes', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xcrn0g04.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('added lf bytes', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xlfn0g04.png'));
		assert.throws(() => new PngDecoder(image), new Error('Not a PNG file'));
	});

	it('incorrect IHDR checksum', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xhdn0g08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Invalid checksum'));
	});

	it('color type 1', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xc1n0g08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Bad color type: 1'));
	});

	it('color type 9', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xc9n2c08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Bad color type: 9'));
	});

	it('bit-depth 0', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xd0n2c08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Bad bit depth: 0'));
	});

	it('bit-depth 3', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xd3n2c08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Bad bit depth: 3'));
	});

	it('bit-depth 99', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xd9n2c08.png'));
		assert.throws(() => new PngDecoder(image), new Error('Bad bit depth: 99'));
	});

	it('missing IDAT chunk', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xdtn0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Missing IDAT chunks'));
	});

	it('incorrect IDAT checksum', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'corrupted-files', 'xcsn0g01.png'));
		assert.throws(() => new PngDecoder(image), new Error('Invalid checksum'));
	});
});
