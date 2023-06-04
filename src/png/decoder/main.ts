import zlib from 'node:zlib';
import crc32 from '../../hash/crc32.js';
import { PngSignature, Interlacing } from '../constants.js';

import {
	BitDepth,
	Channels,
	ChunkTypes,
	ColorTypes,
	FilterTypes,
	InterlaceMethods,
} from '../types.js';
import paethPredictor from '../paeth.js';

export default class Decoder {
	constructor(buffer: Buffer) {
		if (buffer.length < 8 || !Decoder.isPNG(buffer)) {
			throw new Error('Not a PNG file');
		}

		for (let offset = 8; offset < buffer.length; offset += 4) {
			const length = buffer.readUInt32BE(offset);
			const chunk = buffer.subarray((offset += 4), (offset += 4 + length));

			switch (chunk.readUInt32BE()) {
				case ChunkTypes.IHDR:
					this.parseIHDR(chunk.subarray(4));
					break;
				case ChunkTypes.PLTE:
					this.parsePLTE(chunk.subarray(4));
					break;
				case ChunkTypes.tRNS:
					this.parsetRNS(chunk.subarray(4));
					break;
				case ChunkTypes.IDAT:
					this.parseIDAT(chunk.subarray(4));
					break;
				case ChunkTypes.IEND:
					this.parseIEND(chunk.subarray(4));
					break;
				default:
					continue;
			}

			if (!Decoder.verifyChecksum(chunk, buffer.readInt32BE(offset))) {
				throw new Error('Invalid checksum');
			}
		}

		if (this.deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunks');
		}

		const inflatedIDAT = zlib.inflateSync(Buffer.concat(this.deflatedIDAT));

		if (this.interlaceMethod === InterlaceMethods.None) {
			this.bitmap = this.decodeImagePass(inflatedIDAT, this.width, this.height);
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

				const image = this.decodeImagePass(chunk, width, height);
				this.mergeImagePass(image, height, i);
			}
		}
	}

	public static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
	}

	private static verifyChecksum(chunk: Buffer, checksum: number): boolean {
		return crc32.sum(chunk) === checksum;
	}

	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorTypes;

	private channels!: Channels;

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

		if (chunk.readUInt8(10) !== 0) {
			throw new Error(`Unsupported compression method: ${chunk.readUInt8(10)}`);
		}

		if (chunk.readUInt8(11) !== 0) {
			throw new Error(`Unsupported filter method: ${chunk.readUInt8(11)}`);
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
			throw new Error(`Bad PLTE length: ${chunk.length}`);
		}

		switch (this.colorType) {
			case ColorTypes.IndexedColor:
				this.palette = new Array<Buffer>(paletteEntries);
				for (let i = 0, k = 0; i < chunk.length; i += 3, k += 1) {
					this.palette[k] = Buffer.of(chunk[i], chunk[i + 1], chunk[i + 2], 0xff);
				}
				break;
			case ColorTypes.TrueColor:
			case ColorTypes.TrueColorAlpha:
				// Ignore PLTE for color types TrueColor and TrueColorAlpha
				break;
			default:
				throw new Error(`PLTE, color type (${this.colorType}) mismatch`);
		}
	}

	private transparent?: number[];

	private parsetRNS(chunk: Buffer): void {
		switch (this.colorType) {
			case ColorTypes.Grayscale:
				if (chunk.length !== 2) {
					throw new Error(`Bad tRNS length: ${chunk.length}`);
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
					// case 16:
					// 	this.transparent[0] = (this.transparent[0] / 0x101 + 0.5) | 0;
					// 	break;
				}
				break;
			case ColorTypes.TrueColor:
				if (chunk.length !== 6) {
					throw new Error(`Bad tRNS length: ${chunk.length}`);
				}

				this.transparent = [
					chunk.readUInt16BE(0),
					chunk.readUInt16BE(2),
					chunk.readUInt16BE(4),
				];

				// if (this.bitDepth === 16) {
				// 	this.transparent[0] = (this.transparent[0] / 0x101 + 0.5) | 0;
				// 	this.transparent[1] = (this.transparent[1] / 0x101 + 0.5) | 0;
				// 	this.transparent[2] = (this.transparent[2] / 0x101 + 0.5) | 0;
				// }
				break;
			case ColorTypes.IndexedColor:
				if (!this.palette) {
					throw new Error(`Missing palette for color type ${this.colorType}`);
				}
				if (chunk.length > this.palette.length) {
					throw new Error(`Bad tRNS length: ${chunk.length}`);
				}
				for (let i = 0; i < chunk.length; i += 1) {
					this.palette[i][3] = chunk[i];
				}
				break;
			default:
				throw new Error(`tRNS, color type (${this.colorType}) mismatch`);
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
			throw new Error(`Bad IEND length: ${chunk.length}`);
		}
	}

	private decodeImagePass(buffer: Buffer, width: number, height: number): Buffer {
		const bitsPerPixel = this.channels * this.bitDepth;
		const bytesPerPixel = (bitsPerPixel + 7) >> 3;
		// +1 byte filter type
		const bytesPerLine = 1 + ((bitsPerPixel * width + 7) >> 3);

		const unfiltered = this.unfilter(buffer, bytesPerLine, bytesPerPixel);
		const scaled = this.scaleBitDepth(unfiltered, width, height);
		return this.convertToRGBA(scaled, width, height);
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

	private unfilter(buffer: Buffer, bytesPerLine: number, bytesPerPixel: number): Buffer {
		const width = bytesPerLine - 1;
		const height = buffer.length / bytesPerLine;
		const chunk = Buffer.alloc(width * height, 0x00);
		const previousLine = Buffer.alloc(width, 0x00);

		for (let y = 0, offset = 0; y < height; y += 1, offset += bytesPerLine) {
			const line = buffer.subarray(offset + 1, offset + bytesPerLine);
			const type = buffer.readUInt8(offset);

			switch (type) {
				case FilterTypes.None:
					// No-op
					break;
				case FilterTypes.Sub:
					for (let i = bytesPerPixel; i < line.length; i += 1) {
						line[i] += line[i - bytesPerPixel];
					}
					break;
				case FilterTypes.Up:
					for (let i = 0; i < line.length; i += 1) {
						line[i] += previousLine[i];
					}
					break;
				case FilterTypes.Average:
					for (let i = 0; i < bytesPerPixel; i += 1) {
						line[i] += previousLine[i] >> 1;
					}
					for (let i = bytesPerPixel; i < line.length; i += 1) {
						line[i] += (line[i - bytesPerPixel] + previousLine[i]) >> 1;
					}
					break;
				case FilterTypes.Paeth:
					for (let i = 0; i < bytesPerPixel; i += 1) {
						line[i] += previousLine[i];
					}
					for (let i = bytesPerPixel; i < line.length; i += 1) {
						line[i] += paethPredictor(
							line[i - bytesPerPixel],
							previousLine[i],
							previousLine[i - bytesPerPixel],
						);
					}
					break;
				default:
					throw new Error(`Bad filter type: ${type}`);
			}

			line.copy(chunk, y * width);
			line.copy(previousLine, 0);
		}

		return chunk;
	}

	private scaleBitDepth(buffer: Buffer, width: number, heigth: number): Buffer {
		if (this.bitDepth === 8) {
			return buffer;
		}

		const bitsPerPixel = this.channels * this.bitDepth;
		const bytesPerLine = (bitsPerPixel * width + 7) >> 3;

		const chunk = Buffer.alloc(width * this.channels * heigth, 0x00);

		switch (this.bitDepth) {
			case 1:
				for (let i = 0, offset = 0; i < heigth; i += 1, offset += width * this.channels) {
					const line = buffer.subarray(i * bytesPerLine, i * bytesPerLine + bytesPerLine);

					for (let k = 0, j = 0; k < line.length; k += 1, j += 8) {
						const byte = line[k];

						const bytes = Buffer.of(
							(byte >> 7) & 1,
							(byte >> 6) & 1,
							(byte >> 5) & 1,
							(byte >> 4) & 1,
							(byte >> 3) & 1,
							(byte >> 2) & 1,
							(byte >> 1) & 1,
							(byte >> 0) & 1,
						);

						bytes.copy(chunk, offset + j);
					}
				}

				if (this.colorType !== ColorTypes.IndexedColor) {
					for (let i = 0; i < chunk.length; i += 1) {
						chunk[i] *= 0xff;
					}
				}
				break;
			case 2:
				for (let i = 0; i < heigth; i += 1) {
					for (
						let i = 0, offset = 0;
						i < heigth;
						i += 1, offset += width * this.channels
					) {
						const line = buffer.subarray(
							i * bytesPerLine,
							i * bytesPerLine + bytesPerLine,
						);

						for (let k = 0, j = 0; k < line.length; k += 1, j += 4) {
							const byte = line[k];

							const bytes = Buffer.of(
								(byte >> 6) & 3,
								(byte >> 4) & 3,
								(byte >> 2) & 3,
								(byte >> 0) & 3,
							);

							bytes.copy(chunk, offset + j);
						}
					}
				}

				if (this.colorType !== ColorTypes.IndexedColor) {
					for (let i = 0; i < chunk.length; i += 1) {
						chunk[i] *= 0x55;
					}
				}
				break;
			case 4:
				for (let i = 0; i < heigth; i += 1) {
					for (
						let i = 0, offset = 0;
						i < heigth;
						i += 1, offset += width * this.channels
					) {
						const line = buffer.subarray(
							i * bytesPerLine,
							i * bytesPerLine + bytesPerLine,
						);

						for (let k = 0, j = 0; k < line.length; k += 1, j += 2) {
							const byte = line[k];

							const bytes = Buffer.of((byte >> 4) & 0x0f, byte & 0x0f);

							bytes.copy(chunk, offset + j);
						}
					}
				}

				if (this.colorType !== ColorTypes.IndexedColor) {
					for (let i = 0; i < chunk.length; i += 1) {
						chunk[i] *= 0x11;
					}
				}
				break;
			case 16:
				for (let i = 0, k = 0; i < buffer.length; i += 2, k += 1) {
					const byte = buffer.readUInt16BE(i);
					chunk[k] = (byte / 0x101 + 0.5) | 0;
				}
				break;
			default:
				throw new Error(`Bad bit depth: ${this.bitDepth as number}`);
		}

		return chunk;
	}

	private convertToRGBA(buffer: Buffer, width: number, heigth: number): Buffer {
		if (this.colorType === ColorTypes.TrueColorAlpha) {
			return buffer;
		}

		const chunk = Buffer.alloc(width * 4 * heigth, 0x00);

		switch (this.colorType) {
			case ColorTypes.Grayscale:
				for (let i = 0, k = 0; i < buffer.length; i += 1, k += 4) {
					if (this.transparent && this.transparent[0] === buffer[i]) {
						continue;
					}

					chunk[k + 0] = buffer[i];
					chunk[k + 1] = buffer[i];
					chunk[k + 2] = buffer[i];
					chunk[k + 3] = 0xff;
				}
				break;
			case ColorTypes.TrueColor:
				for (let i = 0, k = 0; i < buffer.length; i += 3, k += 4) {
					if (
						this.transparent &&
						this.transparent[0] === buffer[i + 0] &&
						this.transparent[1] === buffer[i + 1] &&
						this.transparent[2] === buffer[i + 2]
					) {
						continue;
					}

					chunk[k + 0] = buffer[i + 0];
					chunk[k + 1] = buffer[i + 1];
					chunk[k + 2] = buffer[i + 2];
					chunk[k + 3] = 0xff;
				}
				break;
			case ColorTypes.IndexedColor:
				if (!this.palette) {
					throw new Error(`Missing palette for color type: ${this.colorType}`);
				}
				for (let i = 0, k = 0; i < buffer.length; i += 1, k += 4) {
					const paletteEntry = this.palette[buffer[i]];
					if (!paletteEntry) {
						throw new Error(`Missing patelle entry for index: ${buffer[i]}`);
					}

					chunk[k + 0] = paletteEntry[0];
					chunk[k + 1] = paletteEntry[1];
					chunk[k + 2] = paletteEntry[2];
					chunk[k + 3] = paletteEntry[3];
				}
				break;
			case ColorTypes.GrayscaleAlpha:
				for (let i = 0, k = 0; i < buffer.length; i += 2, k += 4) {
					chunk[k + 0] = buffer[i + 0];
					chunk[k + 1] = buffer[i + 0];
					chunk[k + 2] = buffer[i + 0];
					chunk[k + 3] = buffer[i + 1];
				}
				break;
			default:
				throw new Error(`Bad color type: ${this.colorType as number}`);
		}

		return chunk;
	}
}
