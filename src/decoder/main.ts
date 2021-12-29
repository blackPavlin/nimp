import zlib from 'zlib';
import { unfilter } from './unfilter';

import crc from '../crc';
import {
	BitDepth,
	Channels,
	ChunkTypeE,
	ColorType,
	ColorTypeE,
	CompressionMethod,
	FilterMethod,
	InterlaceMethod,
	PngHeader,
} from '../types';

type DecoderOptions = {
	checkCrc?: boolean; // Default true
	skipAncillary?: boolean; // Default true
};

class PNG {
	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorType;

	protected channels!: Channels;

	public compressionMethod!: CompressionMethod;

	public filterMethod!: FilterMethod;

	public interlaceMethod!: InterlaceMethod;

	public palette: Buffer[] = [];

	public bitmap!: Buffer;
}

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

	static isPNG(buffer: Buffer): boolean {
		return buffer.length > 8 && PngHeader.compare(buffer, 0, 8) === 0;
	}

	static verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc.crc32(buffer) === checkSum;
	}

	private decodeChunk(type: number, chunk: Buffer, skipAncillary = true): void {
		switch (type) {
			case ChunkTypeE.IHDR:
				this.parseIHDR(chunk);
				break;
			case ChunkTypeE.PLTE:
				this.parsePLTE(chunk);
				break;
			case ChunkTypeE.IDAT:
				this.parseIDAT(chunk);
				break;
			case ChunkTypeE.IEND:
				this.parseIEND(chunk);
				break;
		}

		if (!skipAncillary) {
			// switch (type) {
			// 	case ChunkTypeE.gAMA:
			// 		this.parseGAMA(chunk);
			// 		break;
			// 	case ChunkTypeE.tRNS:
			// 		this.parseTRNS(chunk);
			// 		break;
			// 	case ChunkTypeE.tEXt:
			// 		this.parseTEXT(chunk);
			// 		break;
			// 	case ChunkTypeE.zTXt:
			// 		this.parseZTXT(chunk);
			// 		break;
			// 	case ChunkTypeE.iTXt:
			// 		this.parseITXT(chunk);
			// 		break;
			// 	case ChunkTypeE.tIME:
			// 		this.parseTIME(chunk);
			// 		break;
			// }
		}
	}

	private parseIHDR(chunk: Buffer) {
		if (chunk.length !== 13) {
			throw new Error(`Bad IHDR length ${chunk.length}`);
		}

		this.width = chunk.readInt32BE();
		this.height = chunk.readInt32BE(4);

		if (this.width <= 0 || this.height <= 0) {
			throw new Error('Non-positive dimension');
		}

		const bitDepth = chunk.readUInt8(8);
		switch (bitDepth) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 16:
				this.bitDepth = bitDepth;
				break;
			default:
				throw new Error(`Bad bit depth ${bitDepth}`);
		}

		const colorType = chunk.readUInt8(9);
		switch (colorType) {
			case ColorTypeE.Grayscale:
				this.channels = 1;
				break;
			case ColorTypeE.TrueColor:
				this.channels = 3;
				break;
			case ColorTypeE.IndexedColor:
				this.channels = 1;
				break;
			case ColorTypeE.GrayscaleAlpha:
				this.channels = 2;
				break;
			case ColorTypeE.TrueColorAlpha:
				this.channels = 4;
				break;
			default:
				throw new Error(`Bad color type ${colorType}`);
		}

		this.colorType = colorType;

		if ([2, 4, 6].includes(this.colorType) && ![8, 16].includes(this.bitDepth)) {
			throw new Error(`Unsupported bit depth ${this.bitDepth}, color type ${this.colorType}`);
		}

		if (this.colorType === 3 && this.bitDepth === 16) {
			throw new Error(`Unsupported bit depth ${this.bitDepth}, color type ${this.colorType}`);
		}

		this.compressionMethod = chunk.readUInt8(10) as CompressionMethod;

		if (this.compressionMethod !== 0) {
			throw new Error('Unsupported compression method');
		}

		this.filterMethod = chunk.readUInt8(11) as FilterMethod;

		if (this.filterMethod !== 0) {
			throw new Error('Unsupported filter method');
		}

		this.interlaceMethod = chunk.readUInt8(12) as InterlaceMethod;

		if (this.interlaceMethod !== 0 && this.interlaceMethod !== 1) {
			throw new Error('Bad interlace method');
		}
	}

	private parsePLTE(chunk: Buffer) {
		if (this.colorType === ColorTypeE.Grayscale || this.colorType === ColorTypeE.GrayscaleAlpha) {
			throw new Error('PLTE, color type mismatch');
		}

		const paletteEntris = chunk.length / 3;

		if (chunk.length % 3 !== 0 || paletteEntris > 256 || paletteEntris > 2 ** this.bitDepth) {
			throw new Error('Bad PLTE length');
		}

		for (let i = 0; i < chunk.length; i += 3) {
			this.palette.push(Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]));
		}
	}

	private deflatedIDAT: Buffer[] = [];

	private parseIDAT(chunk: Buffer) {
		this.deflatedIDAT.push(chunk);
	}

	private parseIEND(chunk: Buffer) {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}

	private decodeImageData(): void {
		if (this.deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunk');
		}

		if (this.interlaceMethod === 1) {
			throw new Error('Unsupported interlace method');
		}

		const data = zlib.inflateSync(Buffer.concat(this.deflatedIDAT));
		this.deflatedIDAT = [];

		const bitsPerPixel = Math.ceil((this.channels * this.bitDepth) / 8);
		const bitsPerLine = Math.ceil(((this.channels * this.bitDepth) / 8) * this.width);

		const unfilteredChunks = unfilter(data, bitsPerPixel, bitsPerLine);

		switch (this.colorType) {
			case ColorTypeE.Grayscale:
				// bitmapper[ColorTypeE.Grayscale](normilized, this.transparent).copy(this.bitmap, k);
				break;
			case ColorTypeE.TrueColor:
				// bitmapper[ColorTypeE.TrueColor](normilized, this.transparent).copy(this.bitmap, k);
				break;
			case ColorTypeE.IndexedColor:
				// bitmapper[ColorTypeE.IndexedColor](normilized, this.palette).copy(this.bitmap, k);
				break;
			case ColorTypeE.GrayscaleAlpha:
				// bitmapper[ColorTypeE.GrayscaleAlpha](normilized).copy(this.bitmap, k);
				break;
			case ColorTypeE.TrueColorAlpha:
				// bitmapper[ColorTypeE.TrueColorAlpha](normilized).copy(this.bitmap, k);
				break;
			default:
				throw new Error('Bad color type');
		}
	}
}
