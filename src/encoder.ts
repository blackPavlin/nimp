// import zlib from 'zlib';
// import { PngHeader, ChunkTypeE, ColorTypeE, FilterTypeE } from './types';
// import crc from './crc';

// interface EncodePNGOptions {
// 	width: number;
// 	height: number;
// 	bitDepth?: 1 | 2 | 4 | 8 | 16;
// 	colorType?: 0 | 2 | 3 | 4 | 6;
// 	interlaceMethod?: 0 | 1;
// 	filterType?: 0 | 1 | 2 | 3 | 4;
// 	bitmap: Buffer;
// }

// export default class Encoder {
// 	private width!: number;

// 	private height!: number;

// 	private bitDepth!: 1 | 2 | 4 | 8 | 16;

// 	private colorType!: 0 | 2 | 3 | 4 | 6;

// 	private compressionMethod = 0;

// 	private filterMethod = 0;

// 	private interlaceMethod!: 0 | 1;

// 	private alpha = false;

// 	private colors!: number;

// 	private filterType!: 0 | 1 | 2 | 3 | 4;

// 	private imageChunks: Buffer[] = [];

// 	constructor(options: EncodePNGOptions) {
// 		if (options.width <= 0 || options.height <= 0) {
// 			throw Error('Non-positive dimension');
// 		}

// 		this.width = options.width;
// 		this.height = options.height;

// 		this.bitDepth = options.bitDepth || 8;

// 		if (![1, 2, 4, 8, 16].includes(this.bitDepth)) {
// 			throw Error('Bad bit depth');
// 		}

// 		this.colorType = options.colorType || 6;

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

// 	private encodeChunk(chunk: Buffer): void {
// 		const buf = Buffer.alloc(chunk.length + 8);

// 		buf.writeInt32BE(chunk.length, 0); // write length
// 		chunk.copy(buf, 4); // write chunk
// 		buf.writeInt32BE(crc.crc32(chunk), buf.length - 4); // write crc

// 		this.imageChunks.push(buf);
// 	}

// 	private encodeIHDR(): void {
// 		const chunk = Buffer.alloc(17);

// 		chunk.writeUInt32BE(ChunkType.IHDR, 0); // write chunk type
// 		chunk.writeUInt32BE(this.width, 4); // write width
// 		chunk.writeUInt32BE(this.height, 8); // write height
// 		chunk.writeUInt8(this.bitDepth, 12); // write bitDepth
// 		chunk.writeUInt8(this.colorType, 13); // write colorType
// 		chunk.writeUInt8(this.compressionMethod, 14); // write compressionMethod
// 		chunk.writeUInt8(this.filterMethod, 15); // write filterMethod
// 		chunk.writeUInt8(this.interlaceMethod, 16); // write interlaceMethod

// 		this.encodeChunk(chunk);
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

// 	private filterNone(): void {}

// 	private filterSub(): void {}

// 	private filterUp(): void {}

// 	private filterAverage(): void {}

// 	private filterPaeth(): void {}

// 	private encodeIEND(): void {
// 		const chunk = Buffer.alloc(4);

// 		chunk.writeUInt32BE(ChunkType.IEND, 0);

// 		this.encodeChunk(chunk);
// 	}
// }
