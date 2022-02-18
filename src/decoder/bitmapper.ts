import { ColorType, ColorTypes } from '../types';

export default function normalize(
	chunks: Buffer[],
	colotType: ColorType,
	transparent?: number[],
	palette?: Buffer[],
): Buffer[] {
	const buffers = new Array<Buffer>(chunks.length);

	switch (colotType) {
		case ColorTypes.Grayscale:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(chunk.length * 4);

				for (let k = 0, j = 0; k < buffer.length; k += 4, j += 1) {
					if (transparent && chunk[j] === transparent[0]) {
						continue;
					}

					buffer[k + 0] = chunk[j];
					buffer[k + 1] = chunk[j];
					buffer[k + 2] = chunk[j];
					buffer[k + 3] = 0xff;
				}

				buffers[i] = buffer;
			}
			break;
		case ColorTypes.TrueColor:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc((chunk.length / 3) * 4);

				for (let k = 0, j = 0; k < buffer.length; k += 4, j += 3) {
					if (
						transparent &&
						chunk[j] === transparent[0] &&
						chunk[j + 1] === transparent[1] &&
						chunk[j + 2] === transparent[2]
					) {
						continue;
					}

					buffer[k + 0] = chunk[j + 0];
					buffer[k + 1] = chunk[j + 1];
					buffer[k + 2] = chunk[j + 2];
					buffer[k + 3] = 0xff;
				}

				buffers[i] = buffer;
			}
			break;
		case ColorTypes.IndexedColor:
			if (!palette) {
				throw new Error('Missing palette');
			}

			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(chunk.length * 4);

				for (let k = 0, j = 0; k < buffer.length; k += 4, j += 1) {
					const paletteEntries = palette[chunk[j]];

					if (!paletteEntries) {
						throw new Error('Missing palette entries');
					}

					buffer[k + 0] = paletteEntries[0];
					buffer[k + 1] = paletteEntries[1];
					buffer[k + 2] = paletteEntries[2];
					buffer[k + 3] = paletteEntries[3];
				}

				buffers[i] = buffer;
			}
			break;
		case ColorTypes.GrayscaleAlpha:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(chunk.length * 2);

				for (let k = 0, j = 0; k < buffer.length; k += 4, j += 2) {
					buffer[k + 0] = chunk[j + 0];
					buffer[k + 1] = chunk[j + 0];
					buffer[k + 2] = chunk[j + 0];
					buffer[k + 3] = chunk[j + 1];
				}

				buffers[i] = buffer;
			}
			break;
		case ColorTypes.TrueColorAlpha:
			return chunks;
		default:
			throw new Error(`Bad color type: ${colotType as string}`);
	}

	return buffers;
}
