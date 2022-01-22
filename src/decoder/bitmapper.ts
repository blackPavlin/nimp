import { ColorTypes } from '../types';

export default {
	[ColorTypes.Grayscale]: (chunk: Buffer, transparent: number[]): Buffer => {
		const buff = Buffer.alloc(chunk.length * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 1, k += 4) {
			if (transparent.length && chunk[i] === transparent[0]) {
				// TODO: Не так работает
				// Buffer.from([chunk[i], chunk[i], chunk[i], 0x00]).copy(buff, k);

				continue;
			}

			Buffer.from([chunk[i], chunk[i], chunk[i], 0xff]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypes.TrueColor]: (chunk: Buffer, transparent: number[]): Buffer => {
		const buff = Buffer.alloc((chunk.length / 3) * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 3, k += 4) {
			if (
				transparent.length &&
				chunk[i] === transparent[0] &&
				chunk[i + 1] === transparent[1] &&
				chunk[i + 2] === transparent[2]
			) {
				// TODO: Не так работает
				// Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0x00]).copy(buff, k);

				continue;
			}

			Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypes.IndexedColor]: (chunk: Buffer, palette: Buffer[]): Buffer => {
		const buff = Buffer.alloc(chunk.length * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 1, k += 4) {
			const paletteEntries = palette[chunk[i]];

			if (!paletteEntries) {
				throw new Error('Missing palette entry');
			}

			paletteEntries.copy(buff, k);
		}

		return buff;
	},

	[ColorTypes.GrayscaleAlpha]: (chunk: Buffer): Buffer => {
		const buff = Buffer.alloc(chunk.length * 2);

		for (let i = 0, k = 0; i < chunk.length; i += 2, k += 4) {
			Buffer.from([chunk[i], chunk[i], chunk[i], chunk[i + 1]]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypes.TrueColorAlpha]: (chunk: Buffer): Buffer => chunk,
};
