import fs from 'fs';
import path from 'path';
import Decoder from '../../../src/decoder';
import { ColorTypeE } from '../../../src/types';

describe('Background colors', () => {
	it.skip('8 bit grayscale, alpha, no background chunk, interlaced', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgai4a08.png'));
		const png = new Decoder(image);
	});

	it.skip('16 bit grayscale, alpha, no background chunk, interlaced', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgai4a16.png'));
		const png = new Decoder(image);
	});

	it('3x8 bits rgb color, alpha, no background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgan6a08.png'));
		const png = new Decoder(image);
	});

	it('3x16 bits rgb color, alpha, no background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgan6a16.png'));
		const png = new Decoder(image);
	});

	it('8 bit grayscale, alpha, black background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgbn4a08.png'));
		const png = new Decoder(image);
	});

	it('16 bit grayscale, alpha, gray background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bggn4a16.png'));
		const png = new Decoder(image);
	});

	it('3x8 bits rgb color, alpha, white background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgwn6a08.png'));
		const png = new Decoder(image);
	});

	it('3x16 bits rgb color, alpha, yellow background chunk', () => {
		const image = fs.readFileSync(path.join(__dirname, './images/bgyn6a16.png'));
		const png = new Decoder(image);
	});
});
