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
} from '../types';

import Unfilter from './unfilter';
import converter from './converter';
import bitmapper from './bitmapper';

export default class Decoder {
	constructor(file: Buffer) {
		if (!Buffer.isBuffer(file)) {
			throw new Error('Not a buffer');
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
			this._verifyChecksum(
				file.subarray(i + 4, i + 4 + 4 + length),
				file.readInt32BE(i + 4 + 4 + length),
			);

			const type = file.readUInt32BE((i += 4));
			const chunk = file.subarray((i += 4), (i += length));

			switch (type) {
				case ChunkTypeE.IHDR:
					this._parseIHDR(chunk);
					break;
				case ChunkTypeE.gAMA:
					this._parseGAMA(chunk);
					break;
				case ChunkTypeE.PLTE:
					this._parsePLTE(chunk);
					break;
				case ChunkTypeE.tRNS:
					this._parseTRNS(chunk);
					break;
				case ChunkTypeE.IDAT:
					this._parseIDAT(chunk);
					break;
				case ChunkTypeE.IEND:
					this._parseIEND(chunk);
					break;
			}

			// TODO: Добавить параметр, нужно ли декодировать ancillary chunks
			switch (type) {
				case ChunkTypeE.tIME:
					this._parseTIME(chunk);
					break;
				case ChunkTypeE.iTXt:
					this._parseITXT(chunk);
					break;
				case ChunkTypeE.tEXt:
					this._parseTEXT(chunk);
					break;
				case ChunkTypeE.zTXt:
					this._parseZTXT(chunk);
					break;
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

		const bitsPerPixel = Math.ceil((this._channels * this.bitDepth) / 8);
		const bitsPerLine = Math.ceil(((this._channels * this.bitDepth) / 8) * this.width);

		this.bitmap = Buffer.alloc(this.width * this.height * 4);
		const unfilter = new Unfilter(bitsPerPixel);

		for (let i = 0, k = 0; i < inflatedChunks.length; i += bitsPerLine, k += this.width * 4) {
			const filterType = inflatedChunks.readUInt8(i);
			const chunk = inflatedChunks.subarray((i += 1), i + bitsPerLine);

			const unfiltered = unfilter.recon(chunk, filterType);
			const normilized = converter[this.bitDepth](unfiltered, this.width * this._channels);

			switch (this.colorType) {
				case ColorTypeE.Grayscale:
					bitmapper[ColorTypeE.Grayscale](normilized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypeE.TrueColor:
					bitmapper[ColorTypeE.TrueColor](normilized, this.transparent).copy(this.bitmap, k);
					break;
				case ColorTypeE.IndexedColor:
					bitmapper[ColorTypeE.IndexedColor](normilized, this.palette).copy(this.bitmap, k);
					break;
				case ColorTypeE.GrayscaleAlpha:
					bitmapper[ColorTypeE.GrayscaleAlpha](normilized).copy(this.bitmap, k);
					break;
				case ColorTypeE.TrueColorAlpha:
					bitmapper[ColorTypeE.TrueColorAlpha](normilized).copy(this.bitmap, k);
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
	private _verifyChecksum(chunk: Buffer, checkSum: number): void {
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

		const paletteEntris = chunk.length / 3;

		if (chunk.length % 3 !== 0 || paletteEntris > 256 || paletteEntris > 2 ** this.bitDepth) {
			throw new Error('Bad PLTE length');
		}

		for (let i = 0; i < chunk.length; i += 3) {
			this.palette.push(Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]));
		}
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
