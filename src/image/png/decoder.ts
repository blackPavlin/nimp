import { PNG } from './png';
import crc32 from '../../hash/crc/crc32';
import { Channels, ChunkTypes, ColorTypes } from '../../png/types';

export class Decoder {
	constructor() {
		// TODO
	}

	private image = new PNG();

	private channels!: Channels;

	public decode(buffer: Buffer): PNG {
		if (!PNG.isPNG(buffer)) {
			throw new Error('Not a PNG');
		}

		for (let i = 8; i < buffer.length; i += 4) {
			const length = buffer.readUInt32BE(i);

			if (
				!this.verifyCheckSum(
					buffer.subarray((i += 4), i + 4 + length),
					buffer.readInt32BE(i + 4 + length),
				)
			) {
				throw new Error('Invalid checksum');
			}

			switch (buffer.readUInt32BE(i)) {
				case ChunkTypes.IHDR:
					this.parseIHDR(buffer.subarray((i += 4), (i += length)));
					break;
				default:
					// Skip uknown chunk
					i += 4 + length;
			}
		}

		return this.image;
	}

	private verifyCheckSum(buffer: Buffer, checkSum: number): boolean {
		return crc32.sum(buffer) === checkSum;
	}

	private parseIHDR(chunk: Buffer): void {
		if (chunk.length !== 13) {
			throw new Error(`Bad IHDR length: ${chunk.length}`);
		}

		this.image.width = chunk.readUInt32BE(0);
		this.image.height = chunk.readUInt32BE(4);
		this.image.bitDepth = chunk.readUInt8(8);
		this.image.colorType = chunk.readUInt8(9);

		switch (this.image.colorType) {
			case ColorTypes.Grayscale:
				this.channels = 1;
				break;
			case ColorTypes.TrueColor:
				if (this.image.bitDepth !== 8 && this.image.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.image.colorType} and bit depth ${this.image.bitDepth}`,
					);
				}
				this.channels = 3;
				break;
			case ColorTypes.IndexedColor:
				if (this.image.bitDepth === 16) {
					throw new Error(
						`Unsupported color type ${this.image.colorType} and bit depth ${this.image.bitDepth}`,
					);
				}
				this.channels = 1;
				break;
			case ColorTypes.GrayscaleAlpha:
				if (this.image.bitDepth !== 8 && this.image.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.image.colorType} and bit depth ${this.image.bitDepth}`,
					);
				}
				this.channels = 2;
				break;
			case ColorTypes.TrueColorAlpha:
				if (this.image.bitDepth !== 8 && this.image.bitDepth !== 16) {
					throw new Error(
						`Unsupported color type ${this.image.colorType} and bit depth ${this.image.bitDepth}`,
					);
				}
				this.channels = 4;
				break;
			default:
				throw new Error(`Bad color type ${this.image.colorType as number}`);
		}

		this.image.compressionMethod = chunk.readUInt8(10);
		this.image.filterMethod = chunk.readUInt8(11);
		this.image.interlaceMethod = chunk.readUInt8(12);
	}
}
