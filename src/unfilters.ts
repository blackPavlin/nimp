/**
 * Reconstruction Functions
 * https://www.w3.org/TR/PNG/#9Filters
 */
import { FilterTypeE } from './types';

export default {
	/**
	 * Recon(x) = Filt(x)
	 * @param {Buffer} chunk
	 * @returns {Buffer}
	 */
	[FilterTypeE.None]: (chunk: Buffer): Buffer => chunk,

	/**
	 * Recon(x) = Filt(x) + Recon(a)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @returns {Buffer}
	 */
	[FilterTypeE.Sub]: (chunk: Buffer, bpp: number): Buffer => {
		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + chunk[i - bpp];
		}

		return chunk;
	},

	/**
	 * Recon(x) = Filt(x) + Recon(b)
	 * @param {Buffer} chunk
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	[FilterTypeE.Up]: (chunk: Buffer, tmp?: Buffer): Buffer => {
		if (!tmp) {
			return chunk;
		}

		for (let i = 0; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + tmp[i];
		}

		return chunk;
	},

	/**
	 * Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	[FilterTypeE.Average]: (chunk: Buffer, bpp: number, tmp?: Buffer): Buffer => {
		if (!tmp) {
			for (let i = bpp; i < chunk.length; i += 1) {
				chunk[i] = chunk[i] + (chunk[i - bpp] >> 1);
			}

			return chunk;
		}

		for (let i = 0; i < bpp; i += 1) {
			chunk[i] = chunk[i] + (tmp[i] >> 1);
		}

		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + ((chunk[i - bpp] + tmp[i]) >> 1);
		}

		return chunk;
	},

	/**
	 * Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c))
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	[FilterTypeE.Paeth]: (chunk: Buffer, bpp: number, tmp?: Buffer): Buffer => {
		if (!tmp) {
			for (let i = bpp; i < chunk.length; i += 1) {
				chunk[i] = chunk[i] + chunk[i - bpp];
			}

			return chunk;
		}

		for (let i = 0; i < bpp; i += 1) {
			chunk[i] = chunk[i] + tmp[i];
		}

		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + paethPredictor(chunk[i - bpp], tmp[i], tmp[i - bpp]);
		}

		return chunk;
	},
};

/**
 * https://www.w3.org/TR/PNG/#9Filter-type-4-Paeth
 */
function paethPredictor(a: number, b: number, c: number): number {
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
