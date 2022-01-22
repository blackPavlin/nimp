import zlib, { ZlibOptions } from 'zlib';
import crc from '../crc';
import {
	PngHeader,
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
} from '../types';

import unFilter from './unfilter';
import converter from './converter';
import bitmapper from './bitmapper';

type DecoderOptions = {
	checkCrc?: boolean; // Default true
	skipAncillary?: boolean; // Default false
};

export default class Decoder {
	private readonly mainChunkMapping: Record<number, ((chunk: Buffer) => void) | undefined> = {
		[ChunkTypes.IHDR]: this._parseIHDR.bind(this),
		[ChunkTypes.PLTE]: this._parsePLTE.bind(this),
		[ChunkTypes.IDAT]: this._parseIDAT.bind(this),
		[ChunkTypes.IEND]: this._parseIEND.bind(this),
	};

	private readonly acillaryChunkMapping: Record<number, ((chunk: Buffer) => void) | undefined> = {
		[ChunkTypes.cHRM]: this._parseCHRM.bind(this),
		[ChunkTypes.gAMA]: this._parseGAMA.bind(this),
		[ChunkTypes.iCCP]: this._parseICCP.bind(this),
		[ChunkTypes.sBIT]: this._parseSBIT.bind(this),
		[ChunkTypes.sRGB]: this._parseSRGB.bind(this),
		[ChunkTypes.bKGD]: this._parseBKGD.bind(this),
		[ChunkTypes.hIST]: this._parseHIST.bind(this),
		[ChunkTypes.tRNS]: this._parseTRNS.bind(this),
		[ChunkTypes.pHYs]: this._parsePHYS.bind(this),
		[ChunkTypes.sPLT]: this._parseSPLT.bind(this),
		[ChunkTypes.tEXt]: this._parseTEXT.bind(this),
		[ChunkTypes.zTXt]: this._parseZTXT.bind(this),
		[ChunkTypes.iTXt]: this._parseITXT.bind(this),
		[ChunkTypes.tIME]: this._parseTIME.bind(this),
		[ChunkTypes.eXIf]: this._parseEXIF.bind(this),
	};

	constructor(file: Buffer, options: DecoderOptions = {}) {
		if (!Buffer.isBuffer(file)) {
			throw new TypeError('Not a buffer');
		}

		if (!Decoder.isPNG(file)) {
			throw new Error('Not a PNG file');
		}

		const checkCrc = options.checkCrc ?? true;
		const skipAncillary = options.skipAncillary ?? false;

		const chunkMapping = {
			...this.mainChunkMapping,
			...(skipAncillary ? {} : this.acillaryChunkMapping),
		};

		for (let i = 8; i < file.length; i += 4) {
			const length = file.readUInt32BE(i);

			if (length > 0x7fffffff) {
				throw new Error('Bad chunk length');
			}

			if (
				checkCrc &&
				!Decoder.verifyCheckSum(
					file.subarray(i + 4, i + 4 + 4 + length),
					file.readInt32BE(i + 4 + 4 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			const type = file.readUInt32BE((i += 4));

			const handler = chunkMapping[type];
			if (!handler) {
				i += 4 + length;
				continue;
			}

			const chunk = file.subarray((i += 4), (i += length));
			handler(chunk);
		}

		if (this._deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunk');
		}
		// TODO: Добавить проверку последовательности чанков
		// TODO: Добавить проверки

		if (this.interlaceMethod === 1) {
			throw new Error('Unsupported interlace method');
		}

		const inflatedChunks = this._inflateChunks();
		this._deflatedIDAT = [];

		const bitsPerPixel = this._channels * this.bitDepth;
		const bytesPerPixel = bitsPerPixel >> 3 || 1;
		// TODO: Переписать
		const bytesPerLine = Math.ceil(((this._channels * this.bitDepth) / 8) * this.width);

		this.bitmap = Buffer.alloc(this.width * this.height * 4);
		const unfilteredChunks = unFilter(inflatedChunks, bytesPerPixel, bytesPerLine);

		for (let i = 0, k = 0; i < unfilteredChunks.length; i += 1, k += this.width * 4) {
			const normalized = converter[this.bitDepth](unfilteredChunks[i], this.width * this._channels);

			switch (this.colorType) {
				case ColorTypes.Grayscale:
					bitmapper[ColorTypes.Grayscale](normalized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypes.TrueColor:
					bitmapper[ColorTypes.TrueColor](normalized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypes.IndexedColor:
					bitmapper[ColorTypes.IndexedColor](normalized, this.palette).copy(this.bitmap, k);
					break;
				case ColorTypes.GrayscaleAlpha:
					bitmapper[ColorTypes.GrayscaleAlpha](normalized).copy(this.bitmap, k);
					break;
				case ColorTypes.TrueColorAlpha:
					bitmapper[ColorTypes.TrueColorAlpha](normalized).copy(this.bitmap, k);
					break;
				default:
					throw new Error('Bad color type');
			}
		}
	}

	/**
	 * https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
	 * @param {Buffer} buff
	 */
	static isPNG(buff: Buffer): boolean {
		if (buff.length < 8) {
			return false;
		}

		return PngHeader.compare(buff, 0, 8) === 0;
	}

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} checkSum
	 */
	static verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc.crc32(buffer) === checkSum;
	}

	public width!: number;

	public height!: number;

	public bitDepth!: BitDepth;

	public colorType!: ColorType;

	private _channels!: Channels;

	public compressionMethod!: CompressionMethod;

	public filterMethod!: FilterMethod;

	public interlaceMethod!: InterlaceMethod;

	public bitmap!: Buffer;

	/**
	 * https://www.w3.org/TR/PNG/#11IHDR
	 * @param {Buffer} chunk
	 */
	private _parseIHDR(chunk: Buffer): void {
		if (chunk.length !== 13) {
			throw new Error('Bad IHDR length');
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
			case ColorTypes.Grayscale:
				this._channels = 1;
				break;
			case ColorTypes.TrueColor:
				this._channels = 3;
				break;
			case ColorTypes.IndexedColor:
				this._channels = 1;
				break;
			case ColorTypes.GrayscaleAlpha:
				this._channels = 2;
				break;
			case ColorTypes.TrueColorAlpha:
				this._channels = 4;
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

	public palette: Buffer[] = [];

	/**
	 * https://www.w3.org/TR/PNG/#11PLTE
	 * @param {Buffer} chunk
	 */
	private _parsePLTE(chunk: Buffer): void {
		if (this.colorType === ColorTypes.Grayscale || this.colorType === ColorTypes.GrayscaleAlpha) {
			throw new Error('PLTE, color type mismatch');
		}

		const paletteEntries = chunk.length / 3;

		if (chunk.length % 3 !== 0 || paletteEntries > 256 || paletteEntries > 2 ** this.bitDepth) {
			throw new Error('Bad PLTE length');
		}

		for (let i = 0; i < chunk.length; i += 3) {
			this.palette.push(Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]));
		}
	}

	public chromaticities?: Chromaticities;

	/**
	 * https://www.w3.org/TR/PNG/#11cHRM
	 * @param chunk
	 */
	private _parseCHRM(chunk: Buffer): void {
		if (chunk.length !== 32) {
			throw new Error('Bad cHRM length');
		}

		// TODO: Вынести 10000 в константы
		this.chromaticities = {
			white: {
				x: chunk.readUInt32BE(0) / 100000,
				y: chunk.readUInt32BE(4) / 100000,
			},
			red: {
				x: chunk.readUInt32BE(8) / 100000,
				y: chunk.readUInt32BE(12) / 100000,
			},
			green: {
				x: chunk.readUInt32BE(16) / 100000,
				y: chunk.readUInt32BE(20) / 100000,
			},
			blue: {
				x: chunk.readUInt32BE(24) / 100000,
				y: chunk.readUInt32BE(28) / 100000,
			},
		};
	}

	public gamma?: number;

	/**
	 * https://www.w3.org/TR/PNG/#11gAMA
	 * @param {Buffer} chunk
	 */
	private _parseGAMA(chunk: Buffer): void {
		// TODO: Вынести 100000 в константы
		this.gamma = chunk.readUInt32BE() / 100000;
	}

	public iccProfile?: IccProfile;

	/**
	 * https://www.w3.org/TR/PNG/#11iCCP
	 * @param chunk
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
	 * https://www.w3.org/TR/PNG/#11pHYs
	 * @param chunk
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
	 * https://www.w3.org/TR/PNG/#11sPLT
	 * @param chunk
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
	 * https://www.w3.org/TR/PNG/#11sBIT
	 * @param chunk
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
	 * https://www.w3.org/TR/PNG/#11sRGB
	 * @param chunk
	 */
	private _parseSRGB(chunk: Buffer): void {
		if (this.iccProfile) {
			throw new Error();
		}

		this.sRGB = chunk.readUInt8();
	}

	public background?: [number, number, number, number];

	/**
	 * https://www.w3.org/TR/PNG/#11bKGD
	 * @param chunk
	 */
	private _parseBKGD(chunk: Buffer): void {
		if (this.colorType === ColorTypes.Grayscale || this.colorType === ColorTypes.GrayscaleAlpha) {
		}

		if (this.colorType === ColorTypes.TrueColor || this.colorType === ColorTypes.TrueColorAlpha) {
		}

		if (this.colorType === ColorTypes.IndexedColor) {
			if (!this.palette.length) {
				throw new Error('Missing palette');
			}
		}
	}

	public histogram: number[] = [];

	/**
	 * https://www.w3.org/TR/PNG/#11hIST
	 * @param chunk
	 */
	private _parseHIST(chunk: Buffer): void {
		if (this.palette.length === 0) {
			throw new Error('Missing palette');
		}

		if (chunk.length % 2 !== 0 || this.palette.length !== chunk.length / 2) {
			throw new Error('Bad histogram length');
		}

		for (let i = 0; i < chunk.length; i += 2) {
			this.histogram.push(chunk.readUInt16BE(i));
		}
	}

	public transparent: number[] = [];

	/**
	 * https://www.w3.org/TR/PNG/#11tRNS
	 * @param {Buffer} chunk
	 */
	private _parseTRNS(chunk: Buffer): void {
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
			if (this.palette.length === 0) {
				throw new Error('Palette not found');
			}

			if (chunk.length > this.palette.length) {
				throw new Error('Bad tRNS length');
			}

			for (let i = 0; i < chunk.length; i += 1) {
				this.palette[i][3] = chunk[i];
			}
		}
	}

	public time?: number;

	/**
	 * https://www.w3.org/TR/PNG/#11tIME
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
	 * https://www.w3.org/TR/PNG/#11iTXt
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
	 * https://www.w3.org/TR/PNG/#11tEXt
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
	 * https://www.w3.org/TR/PNG/#11zTXt
	 * @param {Buffer} chunk
	 */
	private _parseZTXT(chunk: Buffer): void {
		const separator = chunk.indexOf(0x00);

		this.text.push({
			keyword: chunk.toString('utf8', 0, separator),
			text: zlib.inflateSync(chunk.subarray(separator + 2)).toString('latin1'),
		});
	}

	private _parseEXIF(chunk: Buffer): void {
		console.log('eXIf');
	}

	private _deflatedIDAT: Buffer[] = [];

	/**
	 * https://www.w3.org/TR/PNG/#11IDAT
	 * @param {Buffer} chunk
	 */
	private _parseIDAT(chunk: Buffer): void {
		this._deflatedIDAT.push(chunk);
	}

	/**
	 * @param {ZlibOptions} options
	 * @returns {Buffer}
	 */
	private _inflateChunks(options?: ZlibOptions): Buffer {
		return zlib.inflateSync(Buffer.concat(this._deflatedIDAT), options);
	}

	/**
	 * https://www.w3.org/TR/PNG/#11IEND
	 * @param {Buffer} chunk
	 */
	private _parseIEND(chunk: Buffer): void {
		if (chunk.length !== 0) {
			throw new Error('Bad IEND length');
		}
	}
}
