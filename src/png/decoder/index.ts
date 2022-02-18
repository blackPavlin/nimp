import zlib from 'zlib';
import { PngSignature, GammaFactor, ChromaticitiesFactor } from '../constants';
import crc from '../crc';
import {
	ChunkTypes,
	BitDepth,
	ColorType,
	CompressionMethod,
	FilterMethod,
	InterlaceMethod,
	Channels,
	ColorTypes,
	TextData,
	Chromaticities,
	PhisicalDimensions,
	SuggestedPalette,
	IccProfile,
	InterlaceMethods,
} from '../types';

import unFilter from './unfilter';
import converter from './converter';
import normalize from './bitmapper';

export default class Decoder {
	private readonly chunkMapping: Record<number, ((chunk: Buffer) => void) | undefined> = {
		// Critical chunks
		[ChunkTypes.IHDR]: this._parseIHDR.bind(this),
		[ChunkTypes.PLTE]: this._parsePLTE.bind(this),
		[ChunkTypes.tRNS]: this._parseTRNS.bind(this),
		[ChunkTypes.IDAT]: this._parseIDAT.bind(this),
		[ChunkTypes.IEND]: this._parseIEND.bind(this),
		// Ancillary chunks
		[ChunkTypes.cHRM]: this._parseCHRM.bind(this),
		[ChunkTypes.gAMA]: this._parseGAMA.bind(this),
		[ChunkTypes.iCCP]: this._parseICCP.bind(this),
		[ChunkTypes.sBIT]: this._parseSBIT.bind(this),
		[ChunkTypes.sRGB]: this._parseSRGB.bind(this),
		[ChunkTypes.bKGD]: this._parseBKGD.bind(this),
		[ChunkTypes.hIST]: this._parseHIST.bind(this),
		[ChunkTypes.pHYs]: this._parsePHYS.bind(this),
		[ChunkTypes.sPLT]: this._parseSPLT.bind(this),
		[ChunkTypes.tEXt]: this._parseTEXT.bind(this),
		[ChunkTypes.zTXt]: this._parseZTXT.bind(this),
		[ChunkTypes.iTXt]: this._parseITXT.bind(this),
		[ChunkTypes.tIME]: this._parseTIME.bind(this),
	};

	constructor(file: Buffer) {
		if (!Decoder.isPNG(file)) {
			throw new Error('Not a PNG file');
		}

		for (let i = 8; i < file.length; i += 4) {
			const length = file.readUInt32BE(i);

			if (length > 0x7fffffff) {
				throw new Error('Bad chunk length');
			}

			if (
				!Decoder.verifyCheckSum(
					file.subarray(i + 4, i + 8 + length),
					file.readInt32BE(i + 8 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			const type = file.readUInt32BE((i += 4));

			const handler = this.chunkMapping[type];
			if (!handler) {
				i += 4 + length;
				continue;
			}

			const chunk = file.subarray((i += 4), (i += length));
			handler(chunk);
		}

		// TODO: Добавить проверку последовательности чанков
		// TODO: Добавить проверки

		this.decodeImageData();
	}

	private decodeImageData(): void {
		if (this._deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunk');
		}

		if (this.interlaceMethod === 1) {
			throw new Error('Unsupported interlace method');
		}

		const inflatedData = zlib.inflateSync(Buffer.concat(this._deflatedIDAT));
		this._deflatedIDAT = [];

		const bitsPerPixel = this.channels * this.bitDepth;
		const bytesPerPixel = (bitsPerPixel + 7) >> 3;
		// + 1
		const bytesPerLine = 1 + ((bitsPerPixel * this.width + 7) >> 3);

		const unfilteredChunks = unFilter(inflatedData, bytesPerPixel, bytesPerLine);
		const convertedData = converter(
			unfilteredChunks,
			this.bitDepth,
			this.width * this.channels,
			this.colorType !== ColorTypes.IndexedColor,
		);
		const normalizedData = normalize(convertedData, this.colorType, this.transparent, this.palette);

		this.bitmap = Buffer.concat(normalizedData);
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
	 * @param {number} checkSum
	 */
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

	/**
	 * @see https://www.w3.org/TR/PNG/#11IHDR
	 * @param {Buffer} chunk
	 */
	private _parseIHDR(chunk: Buffer): void {
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
						`Unsupported color type: ${this.colorType} and bit depth ${this.bitDepth}`,
					);
				}
				this.channels = 4;
				break;
			default:
				throw new Error(`Bad color type: ${this.colorType as number}`);
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

	public palette?: Buffer[];

	/**
	 * @see https://www.w3.org/TR/PNG/#11PLTE
	 * @param {Buffer} chunk
	 */
	private _parsePLTE(chunk: Buffer): void {
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
	private _parseCHRM(chunk: Buffer): void {
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
	private _parseGAMA(chunk: Buffer): void {
		this.gamma = chunk.readUInt32BE() / GammaFactor;
	}

	public iccProfile?: IccProfile;

	/**
	 * @see https://www.w3.org/TR/PNG/#11iCCP
	 * @param {Buffer} chunk
	 */
	private _parseICCP(chunk: Buffer): void {
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
	private _parsePHYS(chunk: Buffer): void {
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
	private _parseSPLT(chunk: Buffer) {
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
	private _parseSBIT(chunk: Buffer): void {
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
	private _parseSRGB(chunk: Buffer): void {
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
	private _parseBKGD(chunk: Buffer): void {
		switch (this.colorType) {
			case ColorTypes.Grayscale:
			case ColorTypes.GrayscaleAlpha:
				this.background = [chunk.readUInt16BE(), chunk.readUInt16BE(), chunk.readUInt16BE(), 0xff];

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
	private _parseHIST(chunk: Buffer): void {
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
	private _parseTRNS(chunk: Buffer): void {
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

				this.transparent = [chunk.readUInt16BE(0), chunk.readUInt16BE(2), chunk.readUInt16BE(4)];

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
	private _parseTIME(chunk: Buffer): void {
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
	private _parseITXT(chunk: Buffer): void {
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
	private _parseTEXT(chunk: Buffer): void {
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
	private _parseZTXT(chunk: Buffer): void {
		const separator = chunk.indexOf(0x00);

		this.text.push({
			keyword: chunk.toString('utf8', 0, separator),
			text: zlib.inflateSync(chunk.subarray(separator + 2)).toString('latin1'),
		});
	}

	private _deflatedIDAT: Buffer[] = [];

	/**
	 * @see https://www.w3.org/TR/PNG/#11IDAT
	 * @param {Buffer} chunk
	 */
	private _parseIDAT(chunk: Buffer): void {
		this._deflatedIDAT.push(chunk);
	}

	/**
	 * @see https://www.w3.org/TR/PNG/#11IEND
	 * @param {Buffer} chunk
	 */
	private _parseIEND(chunk: Buffer): void {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}
}
