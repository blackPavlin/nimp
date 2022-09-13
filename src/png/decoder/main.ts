import zlib from 'zlib';
import crc32 from '../../hash/crc/crc32';
import { PngSignature, Interlacing } from '../constants';

import converter from './converter';
import normalize from './bitmapper';

import {
	BitDepth,
	Channels,
	ChunkTypes,
	ColorTypes,
	CompressionMethod,
	FilterMethod,
	InterlaceMethods,
} from '../types';
import unFilter from './unfilter';

export default class Decoder {
	constructor(buffer: Buffer) {
		if (!Decoder.isPNG(buffer)) {
			throw new Error('Not a PNG file');
		}

		for (let i = 8; i < buffer.length; i += 4) {
			const length = buffer.readUInt32BE(i);

			if (
				!Decoder.verifyCheckSum(
					buffer.subarray((i += 4), i + 4 + length),
					buffer.readInt32BE(i + 4 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			switch (buffer.readUInt32BE(i)) {
				case ChunkTypes.IHDR:
					this.parseIHDR(buffer.subarray((i += 4), (i += length)));
					break;
				case ChunkTypes.PLTE:
					this.parsePLTE(buffer.subarray((i += 4), (i += length)));
					break;
				case ChunkTypes.tRNS:
					this.parsetRNS(buffer.subarray((i += 4), (i += length)));
					break;
				case ChunkTypes.IDAT:
					this.parseIDAT(buffer.subarray((i += 4), (i += length)));
					break;
				case ChunkTypes.IEND:
					this.parseIEND(buffer.subarray((i += 4), (i += length)));
					break;
				default:
					// Skip uknown chunk
					i += 4 + length;
			}
		}

		if (this.deflatedIDAT.length === 0) {
			throw new Error();
		}

		const inflatedIDAT = zlib.inflateSync(Buffer.concat(this.deflatedIDAT));

		if (this.interlaceMethod === InterlaceMethods.None) {
			this.bitmap = this.decodeImagePass(inflatedIDAT, this.width);
		} else if (this.interlaceMethod === InterlaceMethods.Adam7) {
			this.bitmap = Buffer.alloc(this.height * this.width * 4);

			for (let i = 0, offset = 0; i < 7; i += 1) {
				const pass = Interlacing[i];

				const width = ((this.width - pass.xOffset + pass.xFactor - 1) / pass.xFactor) | 0;
				const height = ((this.height - pass.yOffset + pass.yFactor - 1) / pass.yFactor) | 0;

				if (width === 0 || height === 0) {
					continue;
				}

				const bitsPerPixel = this.channels * this.bitDepth;
				const bytesPerLine = 1 + ((bitsPerPixel * width + 7) >> 3);

				const chunk = inflatedIDAT.subarray(offset, (offset += bytesPerLine * height));

				const image = this.decodeImagePass(chunk, width);
				this.mergeImagePass(image, height, i);
			}
		}
	}

	public static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
	}

	private static verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc32.sum(buffer) === checkSum;
	}

	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorTypes;

	private channels!: Channels;

	public compressionMethod!: CompressionMethod;

	public filterMethod!: FilterMethod;

	public interlaceMethod!: InterlaceMethods;

	public bitmap!: Buffer;

	private parseIHDR(chunk: Buffer): void {
		if (chunk.length !== 13) {
			throw new Error('Bad IHDR length');
		}

		this.width = chunk.readUInt32BE();
		this.height = chunk.readUInt32BE(4);

		if (this.width <= 0 || this.height <= 0) {
			throw new Error('Non-positive dimension');
		}

		this.bitDepth = chunk.readUInt8(8) as BitDepth;

		if (
			this.bitDepth !== 1 &&
			this.bitDepth !== 2 &&
			this.bitDepth !== 4 &&
			this.bitDepth !== 8 &&
			this.bitDepth !== 16
		) {
			throw new Error(`Bad bit depth: ${this.bitDepth as number}`);
		}

		this.colorType = chunk.readUInt8(9) as ColorTypes;

		switch (this.colorType) {
			case ColorTypes.Grayscale:
				this.channels = 1;
				break;
			case ColorTypes.TrueColor:
				if (this.bitDepth !== 8 && this.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 3;
				break;
			case ColorTypes.IndexedColor:
				if (this.bitDepth === 16) {
					throw new Error(
						`Unsupported color type ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 1;
				break;
			case ColorTypes.GrayscaleAlpha:
				if (this.bitDepth !== 8 && this.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 2;
				break;
			case ColorTypes.TrueColorAlpha:
				if (this.bitDepth !== 8 && this.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 4;
				break;
			default:
				throw new Error(`Bad color type ${this.colorType as number}`);
		}

		this.compressionMethod = chunk.readUInt8(10) as CompressionMethod;

		if (this.compressionMethod !== 0) {
			throw new Error(`Unsupported compression method: ${this.compressionMethod as number}`);
		}

		this.filterMethod = chunk.readUInt8(11) as FilterMethod;

		if (this.filterMethod !== 0) {
			throw new Error(`Unsupported filter method: ${this.filterMethod as number}`);
		}

		this.interlaceMethod = chunk.readUInt8(12) as InterlaceMethods;

		if (
			this.interlaceMethod !== InterlaceMethods.None &&
			this.interlaceMethod !== InterlaceMethods.Adam7
		) {
			throw new Error(`Unsupported interlace method: ${this.interlaceMethod as number}`);
		}
	}

	private palette?: Buffer[];

	private parsePLTE(chunk: Buffer): void {
		const paletteEntries = chunk.length / 3;

		if (
			chunk.length % 3 !== 0 ||
			paletteEntries <= 0 ||
			paletteEntries > 256 ||
			paletteEntries > 1 << this.bitDepth
		) {
			throw new Error('Bad PLTE length');
		}

		switch (this.colorType) {
			case ColorTypes.IndexedColor:
				this.palette = [];

				for (let i = 0; i < chunk.length; i += 3) {
					this.palette.push(Buffer.of(chunk[i], chunk[i + 1], chunk[i + 2], 0xff));
				}
				break;
			case ColorTypes.TrueColor:
			case ColorTypes.TrueColorAlpha:
				// Ignore PLTE for color types TrueColor and TrueColorAlpha
				break;
			default:
				throw new Error('PLTE, color type mismatch');
		}
	}

	private transparent?: number[];

	private parsetRNS(chunk: Buffer): void {
		switch (this.colorType) {
			case ColorTypes.Grayscale:
				if (chunk.length !== 2) {
					throw new Error('Bad tRNS length');
				}

				this.transparent = [chunk.readUInt16BE()];

				switch (this.bitDepth) {
					case 1:
						this.transparent[0] *= 0xff;
						break;
					case 2:
						this.transparent[0] *= 0x55;
						break;
					case 4:
						this.transparent[0] *= 0x11;
						break;
					case 16:
						this.transparent[0] = (this.transparent[0] / 0x101 + 0.5) | 0;
						break;
				}
				break;
			case ColorTypes.TrueColor:
				if (chunk.length !== 6) {
					throw new Error('Bad tRNS length');
				}

				this.transparent = [
					chunk.readUInt16BE(0),
					chunk.readUInt16BE(2),
					chunk.readUInt16BE(4),
				];

				if (this.bitDepth === 16) {
					this.transparent[0] = (this.transparent[0] / 0x101 + 0.5) | 0;
					this.transparent[1] = (this.transparent[1] / 0x101 + 0.5) | 0;
					this.transparent[2] = (this.transparent[2] / 0x101 + 0.5) | 0;
				}
				break;
			case ColorTypes.IndexedColor:
				if (!this.palette) {
					throw new Error('Missing palette');
				}

				if (chunk.length > this.palette.length) {
					throw new Error('Bad tRNS length');
				}

				for (let i = 0; i < chunk.length; i += 1) {
					this.palette[i][3] = chunk[i];
				}
				break;
			default:
				throw new Error('tRNS, color type mismatch');
		}
	}

	private deflatedIDAT: Buffer[] = [];

	private parseIDAT(chunk: Buffer): void {
		if (chunk.length !== 0) {
			this.deflatedIDAT.push(chunk);
		}
	}

	private parseIEND(chunk: Buffer): void {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}

	private decodeImagePass(buffer: Buffer, width: number): Buffer {
		const bitsPerPixel = this.channels * this.bitDepth;
		const bytesPerPixel = (bitsPerPixel + 7) >> 3;
		// +1 byte filter type
		const bytesPerLine = 1 + ((bitsPerPixel * width + 7) >> 3);

		const unfiltered = unFilter(buffer, bytesPerPixel, bytesPerLine);

		const convertedData = converter(
			unfiltered,
			this.bitDepth,
			width * this.channels,
			this.colorType !== ColorTypes.IndexedColor,
		);

		const normalizedData = normalize(
			convertedData,
			this.colorType,
			this.transparent,
			this.palette,
		);

		return Buffer.concat(normalizedData);
	}

	private mergeImagePass(image: Buffer, height: number, pass: number): void {
		const p = Interlacing[pass];

		for (let y = 0, s = 0; y < height; y += 1) {
			const dBase = (y * p.yFactor + p.yOffset) * (this.width * 4) + p.xOffset * 4;

			for (let x = 0; x < image.length / height; x += 4) {
				const d = dBase + x * p.xFactor;

				image.subarray(s, (s += 4)).copy(this.bitmap, d);
			}
		}
	}
}
