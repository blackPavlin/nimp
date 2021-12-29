import { FilterTypeE } from '../types';

/** https://www.w3.org/TR/PNG/#9Filters */
export default class Unfilter {
	constructor(private readonly _bitsPerPixel: number) {}

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} filterType
	 * @returns {Buffer}
	 */
	public recon(chunk: Buffer, filterType: number): Buffer {
		switch (filterType) {
			case FilterTypeE.None:
				this._temporary = this._unFilterNone(chunk);
				break;
			case FilterTypeE.Sub:
				this._temporary = this._unFilterSub(chunk, this._bitsPerPixel);
				break;
			case FilterTypeE.Up:
				this._temporary = this._unFilterUp(chunk, this._temporary);
				break;
			case FilterTypeE.Average:
				this._temporary = this._unFilterAverage(chunk, this._bitsPerPixel, this._temporary);
				break;
			case FilterTypeE.Paeth:
				this._temporary = this._unFilterPaeth(chunk, this._bitsPerPixel, this._temporary);
				break;
			default:
				throw new Error(`Bad filter type ${filterType}`);
		}

		return this._temporary;
	}

	private _temporary: Buffer | undefined;

	/**
	 * Recon(x) = Filt(x)
	 * @param {Buffer} chunk
	 * @returns {Buffer}
	 */
	private _unFilterNone(chunk: Buffer): Buffer {
		return chunk;
	}

	/**
	 * Recon(x) = Filt(x) + Recon(a)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @returns {Buffer}
	 */
	private _unFilterSub(chunk: Buffer, bpp: number): Buffer {
		for (let i = bpp; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + chunk[i - bpp];
		}

		return chunk;
	}

	/**
	 * Recon(x) = Filt(x) + Recon(b)
	 * @param {Buffer} chunk
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _unFilterUp(chunk: Buffer, tmp?: Buffer): Buffer {
		if (!tmp) {
			return chunk;
		}

		for (let i = 0; i < chunk.length; i += 1) {
			chunk[i] = chunk[i] + tmp[i];
		}

		return chunk;
	}

	/**
	 * Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _unFilterAverage(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
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
	}

	/**
	 * Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c))
	 * @param {Buffer} chunk
	 * @param {number} bpp
	 * @param {Buffer} tmp
	 * @returns {Buffer}
	 */
	private _unFilterPaeth(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
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
			chunk[i] = chunk[i] + this._paethPredictor(chunk[i - bpp], tmp[i], tmp[i - bpp]);
		}

		return chunk;
	}

	/**
	 * https://www.w3.org/TR/PNG/#9Filter-type-4-Paeth
	 * @param {number} a
	 * @param {number} b
	 * @param {number} c
	 * @returns {number}
	 */
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
}

/**
 * @see https://www.w3.org/TR/PNG/#9Filters
 * @param buffer {Buffer}
 * @param bitsPerPixel {number}
 * @param bitsPerLine {number}
 * @returns {Buffer[]}
 */
export function unfilter(buffer: Buffer, bitsPerPixel: number, bitsPerLine: number): Buffer[] {
	const chunks: Buffer[] = [];

	for (let i = 0, k = 0; i < buffer.length; i += bitsPerLine, k += 1) {
		const filterType = buffer.readUInt8(i);
		const chunk = buffer.subarray((i += 1), i + bitsPerLine);

		switch (filterType) {
			case FilterTypeE.None:
				chunks.push(unFilterNone(chunk));
				break;
			case FilterTypeE.Sub:
				chunks.push(unFilterSub(chunk, bitsPerPixel));
				break;
			case FilterTypeE.Up:
				chunks.push(unFilterUp(chunk, chunks[k - 1]));
				break;
			case FilterTypeE.Average:
				chunks.push(unFilterAverage(chunk, bitsPerPixel, chunks[k - 1]));
				break;
			case FilterTypeE.Paeth:
				chunks.push(unFilterPaeth(chunk, bitsPerPixel, chunks[k - 1]));
				break;
			default:
				throw new Error(`Bad filter type ${filterType}`);
		}
	}

	return chunks;
}

/**
 * Recon(x) = Filt(x)
 * @param {Buffer} chunk
 * @returns {Buffer}
 */
function unFilterNone(chunk: Buffer): Buffer {
	return chunk;
}

/**
 * Recon(x) = Filt(x) + Recon(a)
 * @param {Buffer} chunk
 * @param {number} bpp
 * @returns {Buffer}
 */
function unFilterSub(chunk: Buffer, bpp: number): Buffer {
	for (let i = bpp; i < chunk.length; i += 1) {
		chunk[i] = chunk[i] + chunk[i - bpp];
	}

	return chunk;
}

/**
 * Recon(x) = Filt(x) + Recon(b)
 * @param {Buffer} chunk
 * @param {Buffer} tmp
 * @returns {Buffer}
 */
function unFilterUp(chunk: Buffer, tmp?: Buffer): Buffer {
	if (!tmp) {
		return chunk;
	}

	for (let i = 0; i < chunk.length; i += 1) {
		chunk[i] = chunk[i] + tmp[i];
	}

	return chunk;
}

/**
 * Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)
 * @param {Buffer} chunk
 * @param {number} bpp
 * @param {Buffer} tmp
 * @returns {Buffer}
 */
function unFilterAverage(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
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
}

/**
 * Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c))
 * @param {Buffer} chunk
 * @param {number} bpp
 * @param {Buffer} tmp
 * @returns {Buffer}
 */
function unFilterPaeth(chunk: Buffer, bpp: number, tmp?: Buffer): Buffer {
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
}

/**
 * @see https://www.w3.org/TR/PNG/#9Filter-type-4-Paeth
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
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
