import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';

describe('Time chunk', () => {
	it('Modification time, 01-jan-2000 12:34:56', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm0n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(2000, 1, 1, 12, 34, 56));
	});

	it('Modification time, 01-jan-1970 00:00:00', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm7n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(1970, 1, 1, 0, 0, 0));
	});

	it('Modification time, 31-dec-1999 23:59:59', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cm9n0g04.png'));
		const png = new Decoder(image);

		expect(png.time).toBe(Date.UTC(1999, 12, 31, 23, 59, 59));
	});
});

describe('Text chunk', () => {
	it('No textual data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ct0n0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(0);
	});

	it('With textual data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ct1n0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('With compressed textual data', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ctzn0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('UTF-8 international text - english', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cten0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('UTF-8 international text - finnish', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ctfn0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('UTF-8 international text - greek', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ctgn0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('UTF-8 international text - hindi', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/cthn0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});

	it('UTF-8 international text - japanese', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/ctjn0g04.png'));
		const png = new Decoder(image);

		expect(png.text).toHaveLength(6);
		expect(png.text).toMatchSnapshot();
	});
});
