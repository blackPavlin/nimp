import { FilterTypes } from '../types.js';
import paethPredictor from '../paeth.js';

/** https://www.w3.org/TR/PNG/#9Filters */
export default class Filter {
	constructor(private readonly _bitsPerPixel: number) {}

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} filterType
	 * @returns {Buffer}
	 */
	public filt(chunk: Buffer, filterType: number): Buffer {
		switch (filterType) {
			case FilterTypes.None:
				this._temporary = this._filterNone(chunk);
				break;
			case FilterTypes.Sub:
				this._temporary = this._filterSub(chunk, this._bitsPerPixel);
				break;
			case FilterTypes.Up:
				this._temporary = this._filterUp(chunk, this._temporary);
				break;
			case FilterTypes.Average:
				this._temporary = this._filterAverage(chunk, this._bitsPerPixel, this._temporary);
				break;
			case FilterTypes.Paeth:
				this._temporary = this._filterPaeth(chunk, this._bitsPerPixel, this._temporary);
				break;
			default:
				throw new Error(`Bad filter type ${filterType}`);
		}

		return this._temporary;
	}

	private _temporary: Buffer | undefined;

	/**
	 * Filt(x) = Orig(x)
	 * @param {Buffer} chunk
	 * @returns {Buffer}
	 */
	private _filterNone(chunk: Buffer): Buffer {
		return chunk;
	}

	/**
	 * Filt(x) = Orig(x) - Orig(a)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @returns {Buffer}
	 */
	private _filterSub(chunk: Buffer, bpp: number): Buffer {
		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] - chunk[i - bpp];
		}

		return chunk;
	}

	/**
	 * Filt(x) = Orig(x) - Orig(b)
	 * @param {Buffer} chunk
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _filterUp(chunk: Buffer, tmp?: Buffer): Buffer {
		if (!tmp) {
			return chunk;
		}

		for (let i = 0; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] - tmp[i];
		}

		return chunk;
	}

	/**
	 * Filt(x) = Orig(x) - floor((Orig(a) + Orig(b)) / 2)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _filterAverage(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
		if (!tmp) {
			for (let i = bpp; i < chunk.length; i += 1) {
				chunk[i] = chunk[i] - (chunk[i - bpp] >> 1);
			}

			return chunk;
		}

		for (let i = 0; i < bpp; i += 1) {
			chunk[i] = chunk[i] - (tmp[i] >> 1);
		}

		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] - ((chunk[i - bpp] + tmp[i]) >> 1);
		}

		return chunk;
	}

	/**
	 * Filt(x) = Orig(x) - PaethPredictor(Orig(a), Orig(b), Orig(c))
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _filterPaeth(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
		if (!tmp) {
			for (let i = bpp; i < chunk.length; i += 1) {
				chunk[i] = chunk[i] - chunk[i - bpp];
			}

			return chunk;
		}

		for (let i = 0; i < bpp; i += 1) {
			chunk[i] = chunk[i] - tmp[i];
		}

		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] - paethPredictor(chunk[i - bpp], tmp[i], tmp[i - bpp]);
		}

		return chunk;
	}
}
