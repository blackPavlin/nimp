import zlib, { ZlibOptions } from 'zlib';
import crc from '../crc';
import {
	PngHeader,
	ChunkTypeE,
	BitDepth,
	ColorType,
	CompressionMethod,
	FilterMethod,
	InterlaceMethod,
	Channels,
	ColorTypeE,
	TextData,
	Chromaticities,
	PhisicalDimensions,
	SuggestedPalette,
} from '../types';

import unFilter from './unfilter';
import converter from './converter';
import bitmapper from './bitmapper';

export default class Decoder {
	constructor(file: Buffer) {
		if (!Buffer.isBuffer(file)) {
			throw new TypeError('Not a buffer');
		}

		if (!Decoder.isPNG(file)) {
			throw new Error('Not a PNG file');
		}

		for (let i = 8; i < file.length; i += 4) {
			const length = file.readUInt32BE(i);

			if (length > 0x7fffffff) {
				throw new Error('Bad chunk length');
			}

			// TODO: Добавить параметр пропускать проверку контрольных сумм
			Decoder.verifyChecksum(
				file.subarray(i + 4, i + 4 + 4 + length),
				file.readInt32BE(i + 4 + 4 + length),
			);

			const type = file.readUInt32BE((i += 4));
			const chunk = file.subarray((i += 4), (i += length));

			// TODO: Добавить параметр, нужно ли декодировать ancillary chunks
			switch (type) {
				case ChunkTypeE.IHDR:
					this._parseIHDR(chunk);
					break;
				case ChunkTypeE.PLTE:
					this._parsePLTE(chunk);
					break;
				case ChunkTypeE.IDAT:
					this._parseIDAT(chunk);
					break;
				case ChunkTypeE.IEND:
					this._parseIEND(chunk);
					break;
				case ChunkTypeE.cHRM:
					this._parseCHRM(chunk);
					break;
				case ChunkTypeE.gAMA:
					this._parseGAMA(chunk);
					break;
				case ChunkTypeE.iCCP:
					this._parseICCP(chunk);
					break;
				case ChunkTypeE.sBIT:
					this._parseSBIT(chunk);
					break;
				case ChunkTypeE.bKGD:
					this._parseBKGD(chunk);
					break;
				case ChunkTypeE.hIST:
					this._parseHIST(chunk);
					break;
				case ChunkTypeE.tRNS:
					this._parseTRNS(chunk);
					break;
				case ChunkTypeE.pHYs:
					this._parsePHYs(chunk);
					break;
				case ChunkTypeE.sPLT:
					this._parseSPLT(chunk);
					break;
				case ChunkTypeE.tEXt:
					this._parseTEXT(chunk);
					break;
				case ChunkTypeE.zTXt:
					this._parseZTXT(chunk);
					break;
				case ChunkTypeE.iTXt:
					this._parseITXT(chunk);
					break;
				case ChunkTypeE.tIME:
					this._parseTIME(chunk);
					break;
				default:
					console.log(type);
			}
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
				case ColorTypeE.Grayscale:
					bitmapper[ColorTypeE.Grayscale](normalized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypeE.TrueColor:
					bitmapper[ColorTypeE.TrueColor](normalized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypeE.IndexedColor:
					bitmapper[ColorTypeE.IndexedColor](normalized, this.palette).copy(this.bitmap, k);
					break;
				case ColorTypeE.GrayscaleAlpha:
					bitmapper[ColorTypeE.GrayscaleAlpha](normalized).copy(this.bitmap, k);
					break;
				case ColorTypeE.TrueColorAlpha:
					bitmapper[ColorTypeE.TrueColorAlpha](normalized).copy(this.bitmap, k);
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
	static verifyChecksum(chunk: Buffer, checkSum: number): void {
		if (crc.crc32(chunk) !== checkSum) {
			throw new Error('Invalid checksum');
		}
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
			case ColorTypeE.Grayscale:
				this._channels = 1;
				break;
			case ColorTypeE.TrueColor:
				this._channels = 3;
				break;
			case ColorTypeE.IndexedColor:
				this._channels = 1;
				break;
			case ColorTypeE.GrayscaleAlpha:
				this._channels = 2;
				break;
			case ColorTypeE.TrueColorAlpha:
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
		if (this.colorType === ColorTypeE.Grayscale || this.colorType === ColorTypeE.GrayscaleAlpha) {
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

	public chromaticities!: Chromaticities;

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

	public gamma!: number;

	/**
	 * https://www.w3.org/TR/PNG/#11gAMA
	 * @param {Buffer} chunk
	 */
	private _parseGAMA(chunk: Buffer): void {
		// TODO: Вынести 100000 в константы
		this.gamma = chunk.readUInt32BE() / 100000;
	}

	private _parseICCP(chunk: Buffer): void {
		throw new Error('iccp');
	}

	public physicalDimensions!: PhisicalDimensions;

	/**
	 * https://www.w3.org/TR/PNG/#11pHYs
	 * @param chunk
	 */
	private _parsePHYs(chunk: Buffer): void {
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

	public significantBits!: [number, number, number, number];

	/**
	 * https://www.w3.org/TR/PNG/#11sBIT
	 * @param chunk
	 */
	private _parseSBIT(chunk: Buffer): void {
		if (this.colorType === ColorTypeE.Grayscale) {
			const sBit = chunk.readUInt8();
			this.significantBits = [sBit, sBit, sBit, this.bitDepth];
		}

		if (this.colorType === ColorTypeE.TrueColor || this.colorType === ColorTypeE.IndexedColor) {
			this.significantBits = [
				chunk.readUInt8(0),
				chunk.readUInt8(1),
				chunk.readUInt8(2),
				this.bitDepth,
			];
		}

		if (this.colorType === ColorTypeE.GrayscaleAlpha) {
			const sBit = chunk.readUInt8();
			this.significantBits = [sBit, sBit, sBit, chunk.readUInt8(1)];
		}

		if (this.colorType === ColorTypeE.TrueColorAlpha) {
			this.significantBits = [
				chunk.readUInt8(0),
				chunk.readUInt8(1),
				chunk.readUInt8(2),
				chunk.readUInt8(3),
			];
		}
	}

	public background!: [number, number, number, number];

	/**
	 * https://www.w3.org/TR/PNG/#11bKGD
	 * @param chunk
	 */
	private _parseBKGD(chunk: Buffer): void {
		if (this.colorType === ColorTypeE.Grayscale || this.colorType === ColorTypeE.GrayscaleAlpha) {}

		if (this.colorType === ColorTypeE.TrueColor || this.colorType === ColorTypeE.TrueColorAlpha) {}

		if (this.colorType === ColorTypeE.IndexedColor) {
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
			this.colorType === ColorTypeE.GrayscaleAlpha ||
			this.colorType === ColorTypeE.TrueColorAlpha
		) {
			throw new Error('tRNS, color type mismatch');
		}

		if (this.colorType === ColorTypeE.Grayscale) {
			if (chunk.length !== 2) {
				throw new Error('Bad tRNS length');
			}

			this.transparent = [chunk.readUInt16BE(0)];
		}

		if (this.colorType === ColorTypeE.TrueColor) {
			if (chunk.length !== 6) {
				throw new Error('Bad tRNS length');
			}

			this.transparent = [chunk.readUInt16BE(0), chunk.readUInt16BE(2), chunk.readUInt16BE(4)];
		}

		if (this.colorType === ColorTypeE.IndexedColor) {
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

	public time: number | undefined;

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
