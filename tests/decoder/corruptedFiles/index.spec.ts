import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/png/decoder';

describe('Corrupted files', () => {
	it('Signature byte 1 MSBit reset to zero', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xs1n0g01.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('Signature byte 2 is a "Q"', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xs2n0g01.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('Signature byte 4 lowercase', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xs4n0g01.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('7th byte a space instead of control-Z', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xs7n0g01.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('Added cr bytes', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xcrn0g04.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('Added lf bytes', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xlfn0g04.png'));
		expect(() => new Decoder(image)).toThrow('Not a PNG file');
	});

	it('Incorrect IHDR checksum', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xhdn0g08.png'));
		expect(() => new Decoder(image)).toThrow('Invalid checksum');
	});

	it('Color type 1', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xc1n0g08.png'));
		expect(() => new Decoder(image)).toThrow('Bad color type: 1');
	});

	it('Color type 9', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xc9n2c08.png'));
		expect(() => new Decoder(image)).toThrow('Bad color type: 9');
	});

	it('Bit-depth 0', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xd0n2c08.png'));
		expect(() => new Decoder(image)).toThrow('Bad bit depth: 0');
	});

	it('Bit-depth 3', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xd3n2c08.png'));
		expect(() => new Decoder(image)).toThrow('Bad bit depth: 3');
	});

	it('Bit-depth 99', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xd9n2c08.png'));
		expect(() => new Decoder(image)).toThrow('Bad bit depth: 99');
	});

	it('Missing IDAT chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xdtn0g01.png'));
		expect(() => new Decoder(image)).toThrow('Missing IDAT chunk');
	});

	it('Incorrect IDAT checksum', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/xcsn0g01.png'));
		expect(() => new Decoder(image)).toThrow('Invalid checksum');
	});
});
