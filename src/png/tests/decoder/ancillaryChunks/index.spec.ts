import fs from 'node:fs';
import path from 'node:path';
import Decoder from '../../../decoder/index.js';

describe('Ancillary chunks', () => {
	describe('Chroma chunk', () => {
		it('w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/ccwn2c08.png'));
			const png = new Decoder(image);

			expect(png.chromaticities).toBeDefined();
			expect(png.chromaticities).toStrictEqual({
				white: { x: 0.3127, y: 0.329 },
				red: { x: 0.64, y: 0.33 },
				green: { x: 0.3, y: 0.6 },
				blue: { x: 0.15, y: 0.06 },
			});
		});

		it('w:0.3127,0.3290 r:0.64,0.33 g:0.30,0.60 b:0.15,0.06', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/ccwn3p08.png'));
			const png = new Decoder(image);

			expect(png.chromaticities).toBeDefined();
			expect(png.chromaticities).toStrictEqual({
				white: { x: 0.3127, y: 0.329 },
				red: { x: 0.64, y: 0.33 },
				green: { x: 0.3, y: 0.6 },
				blue: { x: 0.15, y: 0.06 },
			});
		});
	});

	describe('Physical pixel dimensions', () => {
		it('8x32 flat pixels', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cdfn2c08.png'));
			const png = new Decoder(image);

			expect(png.physicalDimensions).toBeDefined();
			expect(png.physicalDimensions?.pixelPerUnitX).toBe(1);
			expect(png.physicalDimensions?.pixelPerUnitY).toBe(4);
			expect(png.physicalDimensions?.unitSpecifier).toBe(0);
		});

		it('32x8 high pixels', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cdhn2c08.png'));
			const png = new Decoder(image);

			expect(png.physicalDimensions).toBeDefined();
			expect(png.physicalDimensions?.pixelPerUnitX).toBe(4);
			expect(png.physicalDimensions?.pixelPerUnitY).toBe(1);
			expect(png.physicalDimensions?.unitSpecifier).toBe(0);
		});

		it('8x8 square pixels', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cdsn2c08.png'));
			const png = new Decoder(image);

			expect(png.physicalDimensions).toBeDefined();
			expect(png.physicalDimensions?.pixelPerUnitX).toBe(1);
			expect(png.physicalDimensions?.pixelPerUnitY).toBe(1);
			expect(png.physicalDimensions?.unitSpecifier).toBe(0);
		});

		it('1000 pixels per 1 meter', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cdun2c08.png'));
			const png = new Decoder(image);

			expect(png.physicalDimensions).toBeDefined();
			expect(png.physicalDimensions?.pixelPerUnitX).toBe(1000);
			expect(png.physicalDimensions?.pixelPerUnitY).toBe(1000);
			expect(png.physicalDimensions?.unitSpecifier).toBe(1);
		});
	});

	describe('Histogram', () => {
		it('15 colors', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/ch1n3p04.png'));
			const png = new Decoder(image);

			expect(png.histogram).toHaveLength(15);
		});

		it('256 colors', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/ch2n3p08.png'));
			const png = new Decoder(image);

			expect(png.histogram).toHaveLength(256);
		});
	});

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

	describe('Significant bits', () => {
		it('Color, 13 significant bits', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs3n2c16.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeDefined();
			expect(png.significantBits).toStrictEqual([13, 13, 13, 16]);
		});

		it('Paletted, 3 significant bits', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs3n3p08.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeDefined();
			expect(png.significantBits).toStrictEqual([3, 3, 3, 8]);
		});

		it('Color, 5 significant bits', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs5n2c08.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeDefined();
			expect(png.significantBits).toStrictEqual([5, 5, 5, 8]);
		});

		it('Paletted, 5 significant bits', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs5n3p08.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeDefined();
			expect(png.significantBits).toStrictEqual([5, 5, 5, 8]);
		});

		it('Color, 8 significant bits (reference)', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs8n2c08.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeUndefined();
		});

		it('Paletted, 8 significant bits (reference)', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/cs8n3p08.png'));
			const png = new Decoder(image);

			expect(png.significantBits).toBeUndefined();
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

	describe('Exif chunk', () => {
		it('Chunk with jpeg exif data', () => {
			const image = fs.readFileSync(path.join(__dirname, './images/exif2c08.png'));
			const png = new Decoder(image);
		});
	});
});
