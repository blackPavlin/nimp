import { ColorTypeE } from '../types';

export default {
	[ColorTypeE.Grayscale]: (chunk: Buffer, transperent: number[]): Buffer => {
		const buff = Buffer.alloc(chunk.length * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 1, k += 4) {
			if (transperent.length && chunk[i] === transperent[0]) {
				// TODO: Не работает
				// Buffer.from([chunk[i], chunk[i], chunk[i], 0x00]).copy(buff, k);

				continue;
			}

			Buffer.from([chunk[i], chunk[i], chunk[i], 0xff]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypeE.TrueColor]: (chunk: Buffer, transparent: number[]): Buffer => {
		const buff = Buffer.alloc((chunk.length / 3) * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 3, k += 4) {
			if (
				transparent.length &&
				chunk[i] === transparent[0] &&
				chunk[i + 1] === transparent[1] &&
				chunk[i + 2] === transparent[2]
			) {
				// TODO: Не работает
				// Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0x00]).copy(buff, k);

				continue;
			}

			Buffer.from([chunk[i], chunk[i + 1], chunk[i + 2], 0xff]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypeE.IndexedColor]: (chunk: Buffer, palette: Buffer[]): Buffer => {
		const buff = Buffer.alloc(chunk.length * 4);

		for (let i = 0, k = 0; i < chunk.length; i += 1, k += 4) {
			const patelleEntry = palette[chunk[i]];

			if (!patelleEntry) {
				throw new Error('Missing palette entry');
			}

			patelleEntry.copy(buff, k);
		}

		return buff;
	},

	[ColorTypeE.GrayscaleAlpha]: (chunk: Buffer): Buffer => {
		const buff = Buffer.alloc(chunk.length * 2);

		for (let i = 0, k = 0; i < chunk.length; i += 2, k += 4) {
			Buffer.from([chunk[i], chunk[i], chunk[i], chunk[i + 1]]).copy(buff, k);
		}

		return buff;
	},

	[ColorTypeE.TrueColorAlpha]: (chunk: Buffer): Buffer => chunk,
};
