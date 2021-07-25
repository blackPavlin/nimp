import zlib from 'zlib';
import crc from './crc';
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
	FilterTypeE,
	TextData,
} from './types';

export default class Decoder {
	constructor(file: Buffer) {
		if (!Buffer.isBuffer(file)) {
			throw new Error('Not a buffer');
		}

		this._checkSignature(file);

		for (let i = 8; i < file.length; i += 4) {
			const length = file.readUInt32BE(i);

			if (length > 0x7fffffff) {
				throw new Error('Bad chunk length');
			}

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
				case ChunkTypeE.IDAT:
					this._parseIDAT(chunk);
					break;
				case ChunkTypeE.IEND:
					this._parseIEND(chunk);
					break;
			}
		}

		if (this._deflatedIDAT.length === 0) {
			throw new Error('Missing IDAT chunk');
		}
		// TODO: Добавить проверки

		const inflatedChunks = this._inflateChunks();

		const bitsPerPixel = Math.ceil((this._channels * this.bitDepth) / 8);
		const bitsPerLine = Math.ceil(((this._channels * this.bitDepth) / 8) * this.width);

		this._unFilterPixels(inflatedChunks, bitsPerPixel, bitsPerLine);

		this._decodePixels();
	}

	/**
	 * https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature
	 * @param {Buffer} chunk
	 */
	private _checkSignature(chunk: Buffer): void {
		if (PngHeader.compare(chunk, 0, 8) !== 0) {
			throw new Error('Not a PNG file');
		}
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

		this.bitDepth = chunk.readUInt8(8) as BitDepth;
		this.colorType = chunk.readUInt8(9) as ColorType;

		if (![1, 2, 4, 8, 16].includes(this.bitDepth)) {
			throw new Error(`Bad bit depth ${this.bitDepth}`);
		}

		switch (this.colorType) {
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
				throw new Error(`Bad color type ${this.colorType}`);
		}

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

	public palette: [number, number, number, number][] = [];

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

		// TODO: Имеет смысл сразу преобразовать palette в буфер
		for (let i = 0; i < paletteEntris; i += 1) {
			this.palette.push([chunk[3 * i + 0], chunk[3 * i + 1], chunk[3 * i + 2], 0xff]);
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
				// TODO: Error message
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
	 *
	 */
	private _inflateChunks(): Buffer {
		return zlib.inflateSync(Buffer.concat(this._deflatedIDAT));
	}

	public bitmap!: Buffer;

	private _decodePixels(): void {
		if (this.interlaceMethod === 1) {
			throw new Error('Unsupported interlace method');
		}

		// TODO: Можно вынести в метод
		if (this.bitDepth === 1) {
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const normalized = Buffer.alloc(this.width * this._channels);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 1) {
					const byte = this._unFilteredChunks[i][k];

					const b = Buffer.from([
						(byte >> 7) & 1,
						(byte >> 6) & 1,
						(byte >> 5) & 1,
						(byte >> 4) & 1,
						(byte >> 3) & 1,
						(byte >> 2) & 1,
						(byte >> 1) & 1,
						(byte >> 0) & 1,
					]);

					b.copy(normalized, k * 8);
				}

				this._unFilteredChunks[i] = normalized;
			}
		}

		if (this.bitDepth === 2) {
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const normalized = Buffer.alloc(this.width * this._channels);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 1) {
					const byte = this._unFilteredChunks[i][k];

					const b = Buffer.from([
						(byte >> 6) & 3,
						(byte >> 4) & 3,
						(byte >> 2) & 3,
						(byte >> 0) & 3,
					]);

					b.copy(normalized, k * 4);
				}

				this._unFilteredChunks[i] = normalized;
			}
		}

		if (this.bitDepth === 4) {
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const normalized = Buffer.alloc(this.width * this._channels);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 1) {
					const byte = this._unFilteredChunks[i][k];

					const b = Buffer.from([byte >> 4, byte & 0x0f]);

					b.copy(normalized, k * 2);
				}

				this._unFilteredChunks[i] = normalized;
			}
		}

		if (this.bitDepth === 16) {
			// TODO: Не работает
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const normalized = Buffer.alloc(this.width * this._channels);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 2) {
					const byte = this._unFilteredChunks[i][k];
					const byte2 = this._unFilteredChunks[i][k + 1];

					const b = Buffer.from([(byte << 8) + byte2]);

					b.copy(normalized, k / 2);
				}

				this._unFilteredChunks[i] = normalized;
			}
		}

		if (this.colorType === ColorTypeE.Grayscale) {
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const buff = Buffer.alloc(this.width * 4);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 1) {
					if (this._unFilteredChunks[i][k] === this.transparent[0]) {
						continue;
					}

					Buffer.from([
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k],
						0xff,
					]).copy(buff, k * 4);
				}

				this._unFilteredChunks[i] = buff;
			}
		}

		if (this.colorType === ColorTypeE.TrueColor) {
			const trns =
				this.transparent.length !== 0
					? Buffer.from([this.transparent[0], this.transparent[1], this.transparent[2]])
					: null;

			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const buff = Buffer.alloc(this.width * 4);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 3) {
					if (trns && trns.compare(this._unFilteredChunks[i], k, k + 3) === 0) {
						continue;
					}

					Buffer.from([
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k + 1],
						this._unFilteredChunks[i][k + 2],
						0xff,
					]).copy(buff, (k / 3) * 4);
				}

				this._unFilteredChunks[i] = buff;
			}
		}

		if (this.colorType === ColorTypeE.IndexedColor) {
			if (this.palette.length === 0) {
				// TODO: Error message
				// TODO: Стоит сделать проверку раньше
				throw new Error('Palette not found');
			}

			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const buff = Buffer.alloc(this._unFilteredChunks[i].length * 4);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 1) {
					// TODO: Имеет смысл сразу преобразовать palette в буфер
					Buffer.from(this.palette[this._unFilteredChunks[i][k]]).copy(buff, k * 4);
				}

				this._unFilteredChunks[i] = buff;
			}
		}

		if (this.colorType === ColorTypeE.GrayscaleAlpha) {
			for (let i = 0; i < this._unFilteredChunks.length; i += 1) {
				const buff = Buffer.alloc(this.width * 4);

				for (let k = 0; k < this._unFilteredChunks[i].length; k += 2) {
					Buffer.from([
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k],
						this._unFilteredChunks[i][k + 1],
					]).copy(buff, (k / 2) * 4);
				}

				this._unFilteredChunks[i] = buff;
			}
		}

		this.bitmap = Buffer.concat(this._unFilteredChunks);

		// TODO: Можно сделать раньше
		this._deflatedIDAT = [];
		this._unFilteredChunks = [];
	}

	private _unFilteredChunks: Buffer[] = [];

	/**
	 * https://www.w3.org/TR/PNG/#9Filters
	 * @param {Buffer} chunk
	 * @param {number} bitsPerPixel
	 * @param {number} bitsPerLine
	 */
	private _unFilterPixels(chunk: Buffer, bitsPerPixel: number, bitsPerLine: number): void {
		for (let i = 0; i < chunk.length; i += bitsPerLine) {
			const filterType = chunk.readUInt8(i);
			const line = chunk.subarray((i += 1), i + bitsPerLine);

			switch (filterType) {
				case FilterTypeE.None:
					this._unFilterNone(line);
					break;
				case FilterTypeE.Sub:
					this._unFilterSub(line, bitsPerPixel);
					break;
				case FilterTypeE.Up:
					this._unFilterUp(line);
					break;
				case FilterTypeE.Average:
					this._unFilterAverage(line, bitsPerPixel);
					break;
				case FilterTypeE.Paeth:
					this._unFilterPaeth(line, bitsPerPixel);
					break;
				default:
					throw new Error(`Bad filter type ${filterType}`);
			}
		}
	}

	private _unFilterNone(chunk: Buffer): void {
		this._unFilteredChunks.push(chunk);
	}

	private _unFilterSub(chunk: Buffer, bitsPerPixel: number): void {
		for (let i = bitsPerPixel; i < chunk.length; i += 1) {
			chunk[i] = (chunk[i] + chunk[i - bitsPerPixel]) & 0xff;
		}

		this._unFilteredChunks.push(chunk);
	}

	private _unFilterUp(chunk: Buffer): void {
		if (this._unFilteredChunks.length === 0) {
			this._unFilteredChunks.push(chunk);
		} else {
			for (let i = 0; i < chunk.length; i += 1) {
				chunk[i] = (chunk[i] + this._unFilteredChunks[this._unFilteredChunks.length - 1][i]) & 0xff;
			}

			this._unFilteredChunks.push(chunk);
		}
	}

	private _unFilterAverage(chunk: Buffer, bitsPerPixel: number): void {
		if (this._unFilteredChunks.length === 0) {
			for (let i = bitsPerPixel; i < chunk.length; i += 1) {
				chunk[i] = (chunk[i] + (chunk[i - bitsPerPixel] >> 1)) & 0xff;
			}

			this._unFilteredChunks.push(chunk);
		} else {
			for (let i = 0; i < bitsPerPixel; i += 1) {
				chunk[i] =
					(chunk[i] + (this._unFilteredChunks[this._unFilteredChunks.length - 1][i] >> 1)) & 0xff;
			}

			for (let i = bitsPerPixel; i < chunk.length; i += 1) {
				chunk[i] =
					(chunk[i] +
						((chunk[i - bitsPerPixel] +
							this._unFilteredChunks[this._unFilteredChunks.length - 1][i]) >>
							1)) &
					0xff;
			}

			this._unFilteredChunks.push(chunk);
		}
	}

	private _unFilterPaeth(chunk: Buffer, bitsPerPixel: number): void {
		if (this._unFilteredChunks.length === 0) {
			this._unFilterSub(chunk, bitsPerPixel);
		} else {
			for (let i = 0; i < bitsPerPixel; i += 1) {
				chunk[i] = (chunk[i] + this._unFilteredChunks[this._unFilteredChunks.length - 1][i]) & 0xff;
			}

			for (let i = bitsPerPixel; i < chunk.length; i += 1) {
				chunk[i] =
					(chunk[i] +
						this._paethPredictor(
							chunk[i - bitsPerPixel],
							this._unFilteredChunks[this._unFilteredChunks.length - 1][i],
							this._unFilteredChunks[this._unFilteredChunks.length - 1][i - bitsPerPixel],
						)) &
					0xff;
			}

			this._unFilteredChunks.push(chunk);
		}
	}

	private _paethPredictor(a: number, b: number, c: number): number {
		const p = a + b - c;
		const pa = Math.abs(p - a);
		const pb = Math.abs(p - b);
		const pc = Math.abs(p - c);

		if (pa <= pb && pa <= pc) {
			return a;
		} else if (pb <= pc) {
			return b;
		} else {
			return c;
		}
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
