import zlib, { ZlibOptions } from 'node:zlib';
import { PngSignature } from '../constants.js';
import { CyclicRedundancyCheck } from '../../hash/crc32.js';
import {
	EncodePNGOptions,
	BitDepth,
	ColorTypes,
	Channels,
	ChunkTypes,
	FilterTypes,
	InterlaceMethods,
} from '../types.js';
import Filter from './filter.js';

export class E {
	constructor(options: EncodePNGOptions) {
		if (options.width <= 0 || options.height <= 0) {
			throw new Error('Non-positive dimension');
		}

		this._width = options.width;
		this._height = options.height;

		const bitDepth = options.bitDepth ?? 8;
		if (![1, 2, 4, 8, 16].includes(bitDepth)) {
			throw new Error(`Bad bit depth ${bitDepth}`);
		}

		const colorType = options.colorType ?? 6;
		if (![0, 2, 3, 4, 6].includes(colorType)) {
			throw new Error(`Bad color type ${colorType}`);
		}

		if ([2, 4, 6].includes(colorType) && ![8, 16].includes(bitDepth)) {
			throw new Error(`Unsupported bit depth ${bitDepth}, color type ${colorType}`);
		}

		if (colorType === 3 && bitDepth === 16) {
			throw new Error(`Unsupported bit depth ${bitDepth}, color type ${colorType}`);
		}

		this._bitDepth = bitDepth;
		this._colorType = colorType;

		const filterType = options.filterType ?? 0;
		if (![0, 1, 2, 3, 4].includes(filterType)) {
			throw new Error(`Bad filter type ${filterType}`);
		}

		this._fitlerType = filterType;

		const interlaceMethod = options.interlaceMethod ?? 0;
		if (interlaceMethod !== 0 && interlaceMethod !== 1) {
			throw new Error('Bad interlace method');
		}

		const bitmap = options.bitmap;
		if (bitmap.length === 0) {
			throw new Error('Bitmap is empty');
		}

		const bitsPerPixel = Math.ceil((this._channels * this._bitDepth) / 8);
		const bitsPerLine = Math.ceil(((this._channels * this._bitDepth) / 8) * this._width);

		const filter = new Filter(bitsPerPixel);
		for (let i = 0; i < bitmap.length; i += this._width * 4) {}
	}

	private readonly _width!: number;

	private readonly _height!: number;

	private readonly _bitDepth!: BitDepth;

	private readonly _colorType!: ColorTypes;

	private readonly _fitlerType!: FilterTypes;

	private readonly _compressionMethod = 0;

	private readonly _filterMethod = 0;

	private readonly _interlaceMethod!: InterlaceMethods;

	private readonly _channels!: Channels;

	private readonly _chunks: Buffer[] = [];

	private _encodeHeader(): void {
		this._chunks.push(PngSignature);
	}

	private _encodeIHDR(): void {
		const buff = Buffer.alloc(13);

		buff.writeUInt32BE(this._width, 0); // write width
		buff.writeUInt32BE(this._height, 4); // write height
		buff.writeUInt8(this._bitDepth, 8); // write bitDepth
		buff.writeUInt8(this._colorType, 9); // write colorType
		buff.writeUInt8(this._compressionMethod, 10); // write compressionMethod
		buff.writeUInt8(this._filterMethod, 11); // write filterMethod
		buff.writeUInt8(this._interlaceMethod, 12); // write interlaceMethod

		this._encodeChunk(ChunkTypes.IHDR, buff);
	}

	private _encodeIDAT(chunk: Buffer): void {
		this._encodeChunk(ChunkTypes.IDAT, chunk);
	}

	private _encodeIEND(): void {
		const buff = Buffer.alloc(0);

		this._encodeChunk(ChunkTypes.IEND, buff);
	}

	private _encodeChunk(type: ChunkTypes, chunk: Buffer): void {
		const buff = Buffer.alloc(chunk.length + 12);

		buff.writeInt32BE(chunk.length, 0); // write length
		buff.writeInt32BE(type, 4); // write type
		chunk.copy(buff, 8); // write chunk
		buff.writeInt32BE(
			CyclicRedundancyCheck.sum32(buff.subarray(4, buff.length - 4)),
			buff.length - 4,
		); // write crc

		this._chunks.push(buff);
	}

	// private _deflateChunks(options?: ZlibOptions): Buffer {
	// 	return zlib.deflateSync(Buffer.concat(this._inflatedIDAT), options);
	// }
}

export default class Encoder {
	constructor(options: EncodePNGOptions) {
		if (options.width <= 0 || options.height <= 0) {
			throw new Error('Non-positive dimension');
		}

		this._width = options.width;
		this._height = options.height;

		switch (options.colorType) {
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
				throw new Error('Bad color type');
		}

		// TODO: Добавить проверки
		this._bitDepth = options.bitDepth ?? 8;
		this._colorType = options.colorType;

		this._interlaceMethod = options.interlaceMethod ?? 0;
	}

	private readonly _width!: number;

	private readonly _height!: number;

	private readonly _bitDepth!: BitDepth;

	private readonly _colorType!: ColorTypes;

	private readonly _compressionMethod = 0;

	private readonly _filterMethod = 0;

	private readonly _interlaceMethod!: 0 | 1;

	private readonly _channels!: Channels;

	private _encodeChunk(chunk: Buffer): Buffer {
		const buff = Buffer.alloc(chunk.length + 8);

		buff.writeInt32BE(chunk.length, 0); // write length
		chunk.copy(buff, 4); // write chunk
		buff.writeInt32BE(CyclicRedundancyCheck.sum32(chunk), buff.length - 4); // write crc

		return buff;
	}

	private _encodeIHDR(): Buffer {
		const chunk = Buffer.alloc(17);

		chunk.writeUInt32BE(ChunkTypes.IHDR, 0); // write chunk type
		chunk.writeUInt32BE(this._width, 4); // write width
		chunk.writeUInt32BE(this._height, 8); // write height
		chunk.writeUInt8(this._bitDepth, 12); // write bitDepth
		chunk.writeUInt8(this._colorType, 13); // write colorType
		chunk.writeUInt8(this._compressionMethod, 14); // write compressionMethod
		chunk.writeUInt8(this._filterMethod, 15); // write filterMethod
		chunk.writeUInt8(this._interlaceMethod, 16); // write interlaceMethod

		return this._encodeChunk(chunk);
	}

	private _encodeIDAT() {}

	private _inflatedIDAT: Buffer[] = [];

	private _deflateChunks(options?: ZlibOptions): Buffer {
		return zlib.deflateSync(Buffer.concat(this._inflatedIDAT), options);
	}

	private _encodeIEND(): Buffer {
		const chunk = Buffer.alloc(4);

		chunk.writeUInt32BE(ChunkTypes.IEND, 0);

		return this._encodeChunk(chunk);
	}
}

// export default class Encoder {

// 	private imageChunks: Buffer[] = [];

// 	constructor(options: EncodePNGOptions) {

// 		switch (this.colorType) {
// 			case ColorTypeE.Grayscale:
// 				this.colors = 1;
// 				break;
// 			case ColorTypeE.TrueColor:
// 				this.colors = 3;
// 				break;
// 			case ColorTypeE.IndexedColour:
// 				this.colors = 1;
// 				break;
// 			case ColorTypeE.GrayscaleAlpha:
// 				this.colors = 2;
// 				this.alpha = true;
// 				break;
// 			case ColorTypeE.TrueColorAlpha:
// 				this.colors = 4;
// 				this.alpha = true;
// 				break;
// 			default:
// 				throw Error('Bad color type');
// 		}

// 		if ([2, 4, 6].includes(this.colorType) && ![8, 16].includes(this.bitDepth)) {
// 			throw Error(`Unsupported bit depth ${this.bitDepth}, color type ${this.colorType}`);
// 		}

// 		if (this.colorType === 3 && this.bitDepth === 16) {
// 			throw Error(`Unsupported bit depth ${this.bitDepth}, color type ${this.colorType}`);
// 		}

// 		this.filterType = options.filterType || 0;

// 		if (this.filterType < 0 || this.filterType > 4) {
// 			throw Error('Bad filter type');
// 		}

// 		this.encodeHeader();
// 		this.encodeIHDR();
// 		this.encodeIDAT(options.bitmap);
// 		this.encodeIEND();
// 	}

// 	private encodeHeader(): void {
// 		this.imageChunks.push(pngSignature);
// 	}

// 	private encodeIDAT(bitmap: Buffer): void {
// 		const bytesPerLine = 4 * this.width;
// 		const filteredChunks: Buffer[] = [];

// 		for (let i = 0; i < bitmap.length; i += bytesPerLine) {
// 			const chunk = Buffer.alloc(bytesPerLine + 1);

// 			chunk.writeUInt8(this.filterType, 0);

// 			switch (this.filterType) {
// 				case FilterType.None:
// 					this.filterNone();
// 					break;
// 				case FilterType.Sub:
// 					this.filterSub();
// 					break;
// 				case FilterType.Up:
// 					this.filterUp();
// 					break;
// 				case FilterType.Average:
// 					this.filterAverage();
// 					break;
// 				case FilterType.Paeth:
// 					this.filterPaeth();
// 					break;
// 				default:
// 					throw Error('Bad filter type');
// 			}
// 		}

// 		const inflatedChunk = zlib.deflateSync(Buffer.concat(filteredChunks), {
// 			level: 9,
// 			strategy: 3,
// 		});

// 		// for (let i = 0; i < inflatedChunk.length / 0x7fffffff; i += 0x7fffffff) {
// 		//     const chunk = Buffer.alloc(1);

// 		//     chunk.writeUInt32BE(ChunkType.IDAT),
// 		//     inflatedChunk.subarray(i, i+ 1).copy(chunk);

// 		//     this.encodeChunk(chunk);
// 		// }
// 	}
// }
