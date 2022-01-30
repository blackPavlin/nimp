import zlib from 'zlib';
import crc from '../crc';

import {
	BitDepth,
	Channels,
	ChunkTypes,
	ColorType,
	ColorTypes,
	CompressionMethod,
	FilterMethod,
	InterlaceMethod,
} from '../types';

import PNG from '../png';

import unFilter from './unfilter';
import converter from './converter';
import bitmapper from './bitmapper';

type DecoderOptions = {
	checkCrc?: boolean; // Default true
	skipAncillary?: boolean; // Default true
};

export default class Decoder extends PNG {
	constructor(buffer: Buffer, options: DecoderOptions = {}) {
		super();

		if (!Decoder.isPNG(buffer)) {
			throw new Error('Not a PNG file');
		}

		const checkCrc = options.checkCrc ?? true;
		const skipAncillary = options.skipAncillary ?? true;

		for (let i = 8; i < buffer.length; i += 4) {
			const length = buffer.readUInt32BE(i);

			if (
				checkCrc &&
				!Decoder.verifyCheckSum(
					buffer.subarray(i + 4, i + 4 + 4 + length),
					buffer.readInt32BE(i + 4 + 4 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			const type = buffer.readUInt32BE((i += 4));
			const chunk = buffer.subarray((i += 4), (i += length));

			this.decodeChunk(type, chunk, skipAncillary);
		}

		this.decodeImageData();
	}

	static verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc.crc32(buffer) === checkSum;
	}

	private decodeChunk(type: number, chunk: Buffer, skipAncillary = true): void {
		switch (type) {
			case ChunkTypes.IHDR:
				this.parseIHDR(chunk);
				break;
			case ChunkTypes.PLTE:
				this.parsePLTE(chunk);
				break;
			case ChunkTypes.tRNS:
				this.parseTRNS(chunk);
				break;
			case ChunkTypes.IDAT:
				this.parseIDAT(chunk);
				break;
			case ChunkTypes.IEND:
				this.parseIEND(chunk);
				break;
		}
	}

	private parseIHDR(chunk: Buffer): void {
		if (chunk.length !== 13) {
			throw new Error(`Bad IHDR length ${chunk.length}`);
		}

		this.width = chunk.readInt32BE();
		this.height = chunk.readInt32BE(4);
		this.bitDepth = chunk.readUInt8(8) as BitDepth;
		this.colorType = chunk.readUInt8(9) as ColorType;
		this.compressionMethod = chunk.readUInt8(10) as CompressionMethod;
		this.filterMethod = chunk.readUInt8(11) as FilterMethod;
		this.interlaceMethod = chunk.readUInt8(12) as InterlaceMethod;
	}

	private parsePLTE(chunk: Buffer): void {
		const paletteEntries = chunk.length / 3;

		if (chunk.length % 3 !== 0 || paletteEntries > 256 || paletteEntries > 2 ** this.bitDepth) {
			throw new Error('Bad PLTE length');
		}

		for (let i = 0; i < chunk.length; i += 3) {
			// this.palette.push(Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]));
		}
	}

	private parseTRNS(chunk: Buffer): void {
		if (
			this.colorType === ColorTypes.GrayscaleAlpha ||
			this.colorType === ColorTypes.TrueColorAlpha
		) {
			throw new Error('tRNS, color type mismatch');
		}

		if (this.colorType === ColorTypes.Grayscale) {
			if (chunk.length !== 2) {
				throw new Error('Bad tRNS length');
			}

			this.transparent = [chunk.readUInt16BE(0)];
		}

		if (this.colorType === ColorTypes.TrueColor) {
			if (chunk.length !== 6) {
				throw new Error('Bad tRNS length');
			}

			this.transparent = [chunk.readUInt16BE(0), chunk.readUInt16BE(2), chunk.readUInt16BE(4)];
		}

		if (this.colorType === ColorTypes.IndexedColor) {
			if (this.palette?.length === 0) {
				throw new Error('Palette not found');
			}

			// if (chunk.length > this.palette.length) {
			// 	throw new Error('Bad tRNS length');
			// }

			// for (let i = 0; i < chunk.length; i += 1) {
			// 	this.palette[i][3] = chunk[i];
			// }
		}
	}

	private deflatedIDAT: Buffer[] = [];

	private parseIDAT(chunk: Buffer): void {
		this.deflatedIDAT.push(chunk);
	}

	private parseIEND(chunk: Buffer): void {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}

	private decodeImageData(): void {
		const data = zlib.inflateSync(Buffer.concat(this.deflatedIDAT));

		const bitsPerPixel = 0;
	}
}
