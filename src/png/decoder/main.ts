import zlib from 'zlib';
import crc from '../crc';
import { PngSignature, Interlacing } from '../constants';

import converter from './converter';
import normalize from './bitmapper';

import {
	BitDepth,
	Channels,
	ChunkTypes,
	ColorType,
	ColorTypes,
	CompressionMethod,
	FilterMethod,
	InterlaceMethod,
	InterlaceMethods,
} from '../types';
import unFilter from './unfilter';

export default class Decoder {
	constructor(buffer: Buffer) {
		if (!Decoder.isPNG(buffer)) {
			throw new Error();
		}

		for (let i = 8; i < buffer.length; i += 4) {
			const length = buffer.readUInt32BE(i);

			if (length > 0x7fffffff) {
				throw new Error(`Bad chunk length: ${length}`);
			}

			if (
				!Decoder.verifyCheckSum(
					buffer.subarray((i += 4), i + 4 + length),
					buffer.readInt32BE(i + 4 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			const type = buffer.readUInt32BE(i);

			switch (type) {
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
		this.deflatedIDAT.length = 0;

		if (this.interlaceMethod === InterlaceMethods.None) {
			this.bitmap = this.decodeImagePass(inflatedIDAT, this.width);
		} else if (this.interlaceMethod === InterlaceMethods.Adam7) {
			this.bitmap = Buffer.alloc(this.height * this.height * this.channels);

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

				const chunks = new Array<Buffer>();
				for (let i = 0; i < (bytesPerLine - 1) * height; i += bytesPerLine - 1) {
					chunks.push(image.subarray(i, i + (bytesPerLine - 1)));
				}

				const convertedData = converter(
					chunks,
					this.bitDepth,
					width * this.channels,
					this.colorType !== ColorTypes.IndexedColor,
				);

				this.mergeImagePass(Buffer.concat(convertedData), width, height, i);
			}
		}

		const chunks = new Array<Buffer>();
		for (let i = 0; i < this.bitmap.length; i += this.width * this.channels) {
			chunks.push(this.bitmap.subarray(i, i + this.width * this.channels));
		}

		const normalizedData = normalize(chunks, this.colorType, this.transparent, this.palette);

		this.bitmap = Buffer.concat(normalizedData);
	}

	public static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
	}

	private static verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc.crc32(buffer) === checkSum;
	}

	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorType;

	private channels!: Channels;

	public compressionMethod!: CompressionMethod;

	public filterMethod!: FilterMethod;

	public interlaceMethod!: InterlaceMethod;

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

		this.colorType = chunk.readUInt8(9) as ColorType;

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

		this.interlaceMethod = chunk.readUInt8(12) as InterlaceMethod;

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
		const image = Buffer.concat(unfiltered);

		return image;
	}

	private mergeImagePass(image: Buffer, width: number, height: number, pass: number): void {
		const p = Interlacing[pass];

		const bitsPerPixel = this.channels * this.bitDepth;
		let bytesPerPixel = (bitsPerPixel + 7) >> 3;

		if (this.bitDepth > 8) {
			bytesPerPixel /= 2;
		}

		for (let y = 0, s = 0; y < height; y += 1) {
			const dBase =
				(y * p.yFactor + p.yOffset) * (this.width * bytesPerPixel) +
				p.xOffset * bytesPerPixel;

			for (let x = 0; x < width; x += 1) {
				const d = dBase + x * p.xFactor * bytesPerPixel;

				image.subarray(s, (s += bytesPerPixel)).copy(this.bitmap, d);
			}
		}
	}
}
