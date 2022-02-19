import { BmpSignature } from '../constants';

export default class Decoder {
	constructor(buffer: Buffer) {
		if (!Decoder.isBMP(buffer)) {
			throw new Error('Not a BMP file');
		}

		// BitMapFileHeader
		const fileSize = buffer.readUInt32LE(2);
		const offset = buffer.readUInt32LE(10);

		console.log('fileSize', fileSize);
		console.log('offset', offset);

		// BitMapInfoHeader
		const headerSize = buffer.readUInt32LE(14);

		const width = buffer.readUInt32LE(18);
		const height = buffer.readUInt32LE(22);

		if (width <= 0 || height <= 0) {
			throw new Error();
		}

		const colorPlanes = buffer.readUInt16LE(26);
		const bitsPerPixel = buffer.readUInt16LE(28);
		const compressionMethod = buffer.readUInt32LE(30);
		const bytesOfBitmapData = buffer.readUInt32LE(34);
		const horizontalScreenResolution = buffer.readUInt32LE(38);
		const verticalScreenResolution = buffer.readUInt32LE(42);
		const colorsUsedInImage = buffer.readUInt32LE(46);
		const importantColors = buffer.readUInt32LE(50);

		console.log('headerSize', headerSize);
		console.log('width', width);
		console.log('height', height);
		console.log('colorPlanes', colorPlanes);
		console.log('bitsPerPixel', bitsPerPixel);
		console.log('compressionMethod', compressionMethod);
		console.log('bytesOfBitmapData', bytesOfBitmapData);
		console.log('horizontalScreenResolution', horizontalScreenResolution);
		console.log('verticalScreenResolution', verticalScreenResolution);
		console.log('colorsUsedInImage', colorsUsedInImage);
		console.log('importantColors', importantColors);

		const palette = new Array<Buffer>();

		if (bitsPerPixel <= 8) {
			const paletteEntries = colorsUsedInImage || 1 << bitsPerPixel;

			console.log('paletteEntries', paletteEntries);

			for (let i = 0, k = 54; i < paletteEntries; i += 1, k += 4) {
				palette.push(buffer.subarray(i, i + 4));
			}

			console.log(palette);
		}
	}

	public static isBMP(buffer: Buffer): boolean {
		return BmpSignature.compare(buffer, 0, 2) === 0;
	}

	public width!: number;

	public height!: number;
}
