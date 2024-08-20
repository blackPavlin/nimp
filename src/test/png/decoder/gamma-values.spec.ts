import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { PngDecoder } from '../../../lib/png/decoder.js';

const testdataDir = path.join(import.meta.dirname, '..', '..', '..', '..', 'testdata', 'pngsuite');

describe('Gamma values', () => {
	it('grayscale, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g03n0g16.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.35);
	});

	it('color, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g03n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.35);
	});

	it('paletted, file-gamma = 0.35', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g03n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.35);
	});

	it('grayscale, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g04n0g16.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.45);
	});

	it('color, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g04n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.45);
	});

	it('paletted, file-gamma = 0.45', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g04n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.45);
	});

	it('grayscale, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g05n0g16.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.55);
	});

	it('color, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g05n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.55);
	});

	it('paletted, file-gamma = 0.55', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g05n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.55);
	});

	it('grayscale, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g07n0g16.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.7);
	});

	it('color, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g07n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.7);
	});

	it('paletted, file-gamma = 0.70', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g07n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 0.7);
	});

	it('grayscale, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g10n0g16.png'));
		const png = new PngDecoder(image);

		assert.strictEqual(png.gamma, 1);
	});

	it('color, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g10n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 1);
	});

	it('paletted, file-gamma = 1.00', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g10n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 1);
	});

	it('grayscale, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g25n0g16.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 2.5);
	});

	it('color, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g25n2c08.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 2.5);
	});

	it('paletted, file-gamma = 2.50', () => {
		const image = fs.readFileSync(path.join(testdataDir, 'gamma-values', 'g25n3p04.png'));
		const png = new PngDecoder(image);
		assert.strictEqual(png.gamma, 2.5);
	});
});
