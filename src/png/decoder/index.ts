import zlib from 'node:zlib';
import { PngSignature, GammaFactor, ChromaticitiesFactor, Interlacing } from '../constants.js';
import {
	ChunkTypes,
	BitDepth,
	Channels,
	ColorTypes,
	TextData,
	Chromaticities,
	PhisicalDimensions,
	SuggestedPalette,
	IccProfile,
	InterlaceMethods,
} from '../types.js';

import unFilter from './unfilter.js';
import converter from './converter.js';
import normalize from './bitmapper.js';

export default class PngDecoder {
	constructor(buffer: Buffer) {
		if (buffer.length < 8 || !PngDecoder.isPNG(buffer)) {
			throw new Error('Not a PNG file');
		}

		for (let offset = 8; offset < buffer.length; offset += 4) {
			const length = buffer.readUInt32BE(offset);
			const chunk = buffer.subarray((offset += 4), (offset += 4 + length));

			switch (chunk.readUInt32BE()) {
				// Critical chunks
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
				// Ancillary chunks
				case ChunkTypes.cHRM:
					this.parsecHRM(chunk.subarray(4));
					break;
				case ChunkTypes.gAMA:
					this.parsegAMA(chunk.subarray(4));
					break;
				case ChunkTypes.iCCP:
					this.parseiCCP(chunk.subarray(4));
					break;
				case ChunkTypes.sBIT:
					this.parsesBIT(chunk.subarray(4));
					break;
				case ChunkTypes.sRGB:
					this.parsesRGB(chunk.subarray(4));
					break;
				case ChunkTypes.bKGD:
					this.parsebKGD(chunk.subarray(4));
					break;
				case ChunkTypes.hIST:
					this.parsehIST(chunk.subarray(4));
					break;
				case ChunkTypes.pHYs:
					this.parsepHYS(chunk.subarray(4));
					break;
				case ChunkTypes.sPLT:
					this.parsesPLT(chunk.subarray(4));
					break;
				case ChunkTypes.tEXt:
					this.parsetEXT(chunk.subarray(4));
					break;
				case ChunkTypes.zTXt:
					this.parsezTXT(chunk.subarray(4));
					break;
				case ChunkTypes.iTXt:
					this.parseiTXT(chunk.subarray(4));
					break;
				case ChunkTypes.tIME:
					this.parsetIME(chunk.subarray(4));
					break;
				default:
					continue;
			}

			if (!PngDecoder.verifyChecksum(chunk, buffer.readUInt32BE(offset))) {
				throw new Error('Invalid checksum');
			}
		}

		// TODO: Add check chunk ordering

		if (this.deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunks');
		}

		const inflatedIDAT = zlib.inflateSync(Buffer.concat(this.deflatedIDAT));

		if (this.interlaceMethod === InterlaceMethods.None) {
			this.bitmap = this.decodeImagePass(inflatedIDAT, this.width);
		} else if (this.interlaceMethod === InterlaceMethods.Adam7) {
			const bitsPerPixel = this.channels * this.bitDepth;

			this.bitmap = Buffer.alloc(this.width * this.height * 4);

			for (let i = 0, offset = 0; i < 7; i += 1) {
				const pass = Interlacing[i];

				const width = ((this.width - pass.xOffset + pass.xFactor - 1) / pass.xFactor) | 0;
				const height = ((this.height - pass.yOffset + pass.yFactor - 1) / pass.yFactor) | 0;

				if (width === 0 || height === 0) {
					continue;
				}

				const bytesPerLine = 1 + ((bitsPerPixel * width + 7) >> 3);

				const chunk = inflatedIDAT.subarray(offset, (offset += bytesPerLine * height));

				const image = this.decodeImagePass(chunk, width);
				this.mergeImagePass(image, height, i);
			}
		}
	}

	private decodeImagePass(inflatedData: Buffer, width: number): Buffer {
		const bitsPerPixel = this.channels * this.bitDepth;
		const bytesPerPixel = (bitsPerPixel + 7) >> 3;
		// +1 byte filter type
		const bytesPerLine = 1 + ((bitsPerPixel * width + 7) >> 3);

		const unfilteredChunks = unFilter(inflatedData, bytesPerPixel, bytesPerLine);

		const convertedData = converter(
			unfilteredChunks,
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

	/**
	 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
	 * @param {Buffer} buffer
	 */
	public static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
	}

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} checksum
	 */
	private static verifyChecksum(chunk: Buffer, checksum: number): boolean {
		return zlib.crc32(chunk) === checksum;
	}

	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorTypes;

	private channels!: Channels;

	public interlaceMethod!: InterlaceMethods;

	public bitmap!: Buffer;

	/**
	 * @see https://www.w3.org/TR/PNG/#11IHDR
	 * @param {Buffer} chunk
	 */
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
						`Unsupported color type: ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 4;
				break;
			default:
				throw new Error(`Bad color type: ${this.colorType as number}`);
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

	public palette?: Buffer[];

	/**
	 * @see https://www.w3.org/TR/PNG/#11PLTE
	 * @param {Buffer} chunk
	 */
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

				// TODO: Use chunk.subarray(i, i + 3);
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

	public chromaticities?: Chromaticities;

	/**
	 * @see https://www.w3.org/TR/PNG/#11cHRM
	 * @param {Buffer} chunk
	 */
	private parsecHRM(chunk: Buffer): void {
		if (chunk.length !== 32) {
			throw new Error('Bad cHRM length');
		}

		this.chromaticities = {
			white: {
				x: chunk.readUInt32BE(0) / ChromaticitiesFactor,
				y: chunk.readUInt32BE(4) / ChromaticitiesFactor,
			},
			red: {
				x: chunk.readUInt32BE(8) / ChromaticitiesFactor,
				y: chunk.readUInt32BE(12) / ChromaticitiesFactor,
			},
			green: {
				x: chunk.readUInt32BE(16) / ChromaticitiesFactor,
				y: chunk.readUInt32BE(20) / ChromaticitiesFactor,
			},
			blue: {
				x: chunk.readUInt32BE(24) / ChromaticitiesFactor,
				y: chunk.readUInt32BE(28) / ChromaticitiesFactor,
			},
		};
	}

	public gamma?: number;

	/**
	 * @see https://www.w3.org/TR/PNG/#11gAMA
	 * @param {Buffer} chunk
	 */
	private parsegAMA(chunk: Buffer): void {
		this.gamma = chunk.readUInt32BE() / GammaFactor;
	}

	public iccProfile?: IccProfile;

	/**
	 * @see https://www.w3.org/TR/PNG/#11iCCP
	 * @param {Buffer} chunk
	 */
	private parseiCCP(chunk: Buffer): void {
		if (this.sRGB) {
			throw new Error();
		}

		const separator = chunk.indexOf(0x00);
		const name = chunk.toString('latin1', 0, separator);

		const compressionMethod = chunk.readUInt8(separator + 1);
		if (compressionMethod !== 0) {
			throw new Error(`Bad compression method iccp: ${compressionMethod}`);
		}

		this.iccProfile = {
			name,
			profile: zlib.inflateSync(chunk.subarray(separator + 2)),
		};
	}

	public physicalDimensions?: PhisicalDimensions;

	/**
	 * @see https://www.w3.org/TR/PNG/#11pHYs
	 * @param {Buffer} chunk
	 */
	private parsepHYS(chunk: Buffer): void {
		if (chunk.length !== 9) {
			throw new Error('Bad pHYs length');
		}

		const pixelPerUnitX = chunk.readUInt32BE(0);
		const pixelPerUnitY = chunk.readUInt32BE(4);
		const unitSpecifier = chunk.readUInt8(8);

		if (unitSpecifier !== 0 && unitSpecifier !== 1) {
			throw new Error('Bad unit specifier');
		}

		this.physicalDimensions = {
			pixelPerUnitX,
			pixelPerUnitY,
			unitSpecifier,
		};
	}

	public suggestedPalette: SuggestedPalette = {};

	/**
	 * @see https://www.w3.org/TR/PNG/#11sPLT
	 * @param {Buffer} chunk
	 */
	private parsesPLT(chunk: Buffer) {
		const separator = chunk.indexOf(0x00);
		const name = chunk.toString('latin1', 0, separator);
		const depth = chunk.readUInt8(separator + 1);

		// TODO: Проверка depth

		const palette: [number, number, number, number, number][] = [];

		if (depth === 8) {
			for (let i = separator + 2; i < chunk.length; i += 6) {
				palette.push([
					chunk.readUInt8(i + 0),
					chunk.readUInt8(i + 1),
					chunk.readUInt8(i + 2),
					chunk.readUInt8(i + 3),
					chunk.readUInt16BE(i + 4),
				]);
			}
		}

		if (depth === 16) {
			for (let i = separator + 2; i < chunk.length; i += 10) {
				palette.push([
					chunk.readUInt16BE(i + 0),
					chunk.readUInt16BE(i + 2),
					chunk.readUInt16BE(i + 4),
					chunk.readUInt16BE(i + 6),
					chunk.readUInt16BE(i + 8),
				]);
			}
		}

		this.suggestedPalette[name] = palette;
	}

	public significantBits?: [number, number, number, number];

	/**
	 * @see https://www.w3.org/TR/PNG/#11sBIT
	 * @param {Buffer} chunk
	 */
	private parsesBIT(chunk: Buffer): void {
		if (this.colorType === ColorTypes.Grayscale) {
			const sBit = chunk.readUInt8();
			this.significantBits = [sBit, sBit, sBit, this.bitDepth];
		}

		if (this.colorType === ColorTypes.TrueColor || this.colorType === ColorTypes.IndexedColor) {
			this.significantBits = [
				chunk.readUInt8(0),
				chunk.readUInt8(1),
				chunk.readUInt8(2),
				this.bitDepth,
			];
		}

		if (this.colorType === ColorTypes.GrayscaleAlpha) {
			const sBit = chunk.readUInt8();
			this.significantBits = [sBit, sBit, sBit, chunk.readUInt8(1)];
		}

		if (this.colorType === ColorTypes.TrueColorAlpha) {
			this.significantBits = [
				chunk.readUInt8(0),
				chunk.readUInt8(1),
				chunk.readUInt8(2),
				chunk.readUInt8(3),
			];
		}
	}

	public sRGB?: number;

	/**
	 * @see https://www.w3.org/TR/PNG/#11sRGB
	 * @param {Buffer} chunk
	 */
	private parsesRGB(chunk: Buffer): void {
		if (this.iccProfile) {
			throw new Error();
		}

		this.sRGB = chunk.readUInt8();
	}

	public background?: [number, number, number, number];

	/**
	 * @see https://www.w3.org/TR/PNG/#11bKGD
	 * @param {Buffer} chunk
	 */
	private parsebKGD(chunk: Buffer): void {
		switch (this.colorType) {
			case ColorTypes.Grayscale:
			case ColorTypes.GrayscaleAlpha:
				this.background = [
					chunk.readUInt16BE(),
					chunk.readUInt16BE(),
					chunk.readUInt16BE(),
					0xff,
				];

				switch (this.bitDepth) {
					case 1:
						this.background[0] *= 0xff;
						this.background[1] *= 0xff;
						this.background[2] *= 0xff;
						break;
					case 2:
						this.background[0] *= 0x55;
						this.background[1] *= 0x55;
						this.background[2] *= 0x55;
						break;
					case 4:
						this.background[0] *= 0x11;
						this.background[1] *= 0x11;
						this.background[2] *= 0x11;
						break;
					case 8:
						// No-op.
						break;
					case 16:
						this.background[0] = (this.background[0] / 0x101 + 0.5) | 0;
						this.background[1] = (this.background[1] / 0x101 + 0.5) | 0;
						this.background[2] = (this.background[2] / 0x101 + 0.5) | 0;
						break;
					default:
						throw new Error();
				}
				break;
			case ColorTypes.TrueColor:
			case ColorTypes.TrueColorAlpha:
				this.background = [
					chunk.readUInt16BE(0),
					chunk.readUInt16BE(2),
					chunk.readUInt16BE(4),
					0xff,
				];

				if (this.bitDepth === 16) {
					this.background[0] = (this.background[0] / 0x101 + 0.5) | 0;
					this.background[1] = (this.background[1] / 0x101 + 0.5) | 0;
					this.background[2] = (this.background[2] / 0x101 + 0.5) | 0;
				}
				break;
			case ColorTypes.IndexedColor:
				if (!this.palette) {
					throw new Error('Missing palette');
				}

				this.background = [
					this.palette[chunk.readUInt8()][0],
					this.palette[chunk.readUInt8()][1],
					this.palette[chunk.readUInt8()][2],
					this.palette[chunk.readUInt8()][3],
				];
				break;
			default:
				throw new Error();
		}
	}

	public histogram: number[] = [];

	/**
	 * @see https://www.w3.org/TR/PNG/#11hIST
	 * @param {Buffer} chunk
	 */
	private parsehIST(chunk: Buffer): void {
		if (!this.palette) {
			throw new Error('Missing palette');
		}

		if (chunk.length % 2 !== 0 || this.palette.length !== chunk.length / 2) {
			throw new Error('Bad histogram length');
		}

		for (let i = 0; i < chunk.length; i += 2) {
			this.histogram.push(chunk.readUInt16BE(i));
		}
	}

	public transparent?: number[];

	/**
	 * @see https://www.w3.org/TR/PNG/#11tRNS
	 * @param {Buffer} chunk
	 */
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

	public time?: number;

	/**
	 * @see https://www.w3.org/TR/PNG/#11tIME
	 * @param {Buffer} chunk
	 */
	private parsetIME(chunk: Buffer): void {
		if (chunk.length !== 7) {
			throw new Error('Bad tIME length');
		}

		this.time = Date.UTC(
			chunk.readUInt16BE(),
			chunk.readUInt8(2),
			chunk.readUInt8(3),
			chunk.readUInt8(4),
			chunk.readUInt8(5),
			chunk.readUInt8(6),
		);
	}

	public text: TextData[] = [];

	/**
	 * @see https://www.w3.org/TR/PNG/#11iTXt
	 * @param {Buffer} chunk
	 */
	private parseiTXT(chunk: Buffer): void {
		const separator1 = chunk.indexOf(0x00);
		const separator2 = chunk.indexOf(0x00, separator1 + 3);
		const separator3 = chunk.indexOf(0x00, separator2 + 2);

		this.text.push({
			keyword: chunk.toString('utf8', 0, separator1),
			languageTag: chunk.subarray(separator1 + 3, separator2).toString('utf8'),
			translatedKeyword: chunk.subarray(separator2 + 1, separator3).toString('utf8'),
			text:
				chunk[separator1 + 1] === 0x00
					? chunk.toString('utf8', separator3 + 1)
					: zlib.inflateSync(chunk.subarray(separator3 + 1)).toString('latin1'),
		});
	}

	/**
	 * @see https://www.w3.org/TR/PNG/#11tEXt
	 * @param {Buffer} chunk
	 */
	private parsetEXT(chunk: Buffer): void {
		const separator = chunk.indexOf(0x00);

		this.text.push({
			keyword: chunk.toString('utf8', 0, separator),
			text: chunk.toString('utf8', separator + 1),
		});
	}

	/**
	 * @see https://www.w3.org/TR/PNG/#11zTXt
	 * @param {Buffer} chunk
	 */
	private parsezTXT(chunk: Buffer): void {
		const separator = chunk.indexOf(0x00);

		this.text.push({
			keyword: chunk.toString('utf8', 0, separator),
			text: zlib.inflateSync(chunk.subarray(separator + 2)).toString('latin1'),
		});
	}

	private deflatedIDAT: Buffer[] = [];

	/**
	 * @see https://www.w3.org/TR/PNG/#11IDAT
	 * @param {Buffer} chunk
	 */
	private parseIDAT(chunk: Buffer): void {
		if (chunk.length !== 0) {
			this.deflatedIDAT.push(chunk);
		}
	}

	/**
	 * @see https://www.w3.org/TR/PNG/#11IEND
	 * @param {Buffer} chunk
	 */
	private parseIEND(chunk: Buffer): void {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}
}
