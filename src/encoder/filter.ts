import { FilterTypeE } from '../types';

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
			case FilterTypeE.None:
				this._temporary = this._filterNone(chunk);
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
}
