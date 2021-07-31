import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Odd sizes no interlacing', () => {
	it('1x1 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s01n3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(1);
		expect(png.height).toBe(1);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('2x2 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s02n3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(2);
		expect(png.height).toBe(2);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('3x3 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s03n3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(3);
		expect(png.height).toBe(3);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('4x4 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s04n3p01.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(4);
		expect(png.height).toBe(4);
		expect(png.bitDepth).toBe(1);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('5x5 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s05n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(5);
		expect(png.height).toBe(5);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('6x6 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s06n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(6);
		expect(png.height).toBe(6);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('7x7 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s07n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(7);
		expect(png.height).toBe(7);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('8x8 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s08n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(8);
		expect(png.height).toBe(8);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('9x9 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s09n3p02.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(9);
		expect(png.height).toBe(9);
		expect(png.bitDepth).toBe(2);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('32x32 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s32n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(32);
		expect(png.height).toBe(32);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('33x33 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s33n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(33);
		expect(png.height).toBe(33);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('34x34 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s34n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(34);
		expect(png.height).toBe(34);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('35x35 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s35n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(35);
		expect(png.height).toBe(35);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('36x36 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s36n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(36);
		expect(png.height).toBe(36);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('37x37 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s37n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(37);
		expect(png.height).toBe(37);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('38x38 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s38n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(38);
		expect(png.height).toBe(38);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('39x39 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s39n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(39);
		expect(png.height).toBe(39);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});

	it('40x40 paletted file', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/s40n3p04.png'));
		const png = new Decoder(image);

		expect(png.width).toBe(40);
		expect(png.height).toBe(40);
		expect(png.bitDepth).toBe(4);
		expect(png.colorType).toBe(ColorTypeE.IndexedColor);
		expect(png.bitmap).toHaveLength(png.width * png.height * 4);
		expect(png.bitmap).toMatchSnapshot();
	});
});
