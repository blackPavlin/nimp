import { FilterTypes } from '../types';

/**
 * @see https://www.w3.org/TR/PNG/#9Filters
 * @param buffer {Buffer}
 * @param bitsPerPixel {number}
 * @param bitsPerLine {number}
 * @returns {Buffer[]}
 */
export default function unFilter(
	buffer: Buffer,
	bitsPerPixel: number,
	bitsPerLine: number,
): Buffer[] {
	const chunks: Buffer[] = [];

	for (let i = 0, k = 0; i < buffer.length; i += bitsPerLine, k += 1) {
		const filterType = buffer.readUInt8(i);
		const chunk = buffer.subarray((i += 1), i + bitsPerLine);

		switch (filterType) {
			case FilterTypes.None:
				chunks.push(unFilterNone(chunk));
				break;
			case FilterTypes.Sub:
				chunks.push(unFilterSub(chunk, bitsPerPixel));
				break;
			case FilterTypes.Up:
				chunks.push(unFilterUp(chunk, chunks[k - 1]));
				break;
			case FilterTypes.Average:
				chunks.push(unFilterAverage(chunk, bitsPerPixel, chunks[k - 1]));
				break;
			case FilterTypes.Paeth:
				chunks.push(unFilterPaeth(chunk, bitsPerPixel, chunks[k - 1]));
				break;
			default:
				throw new Error(`Bad filter type: ${filterType}`);
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

// export function u(
// 	buffer: Buffer,
// 	height: number,
// 	bitsPerPixel: number,
// 	bitsPerLine: number,
// ): Buffer {
// 	const buff = Buffer.alloc(buffer.length - height);

// 	for (let i = 0, k = 0; i < buffer.length; i += bitsPerLine, k += bitsPerLine) {
// 		const filterType = buffer.readUInt8((i += 1));

// 		switch (filterType) {
// 			case FilterTypes.None:
// 				buff.copy(buffer, k);
// 				break;
// 			case FilterTypes.Sub:
// 				buff[k] = buffer[i];

// 				for (let j = bitsPerPixel; j < bitsPerLine; j += 1) {
// 					buff[k + j] = buffer[i + j] + buff[k + j - bitsPerPixel];
// 				}
// 				break;
// 			case FilterTypes.Up:
// 				if (k === 0) {
// 					buff.copy(buffer, k);
// 				} else {
// 					for (let j = 0; j < bitsPerLine; j += 1) {
// 						buff[k + j] = buffer[i + j] + buff[k - bitsPerLine + j];
// 					}
// 				}
// 				break;
// 			case FilterTypes.Average:
// 				if (k === 0) {

// 				} else {

// 				}
// 				break;
// 			case FilterTypes.Paeth:
// 				break;
// 			default:
// 				throw new Error(`Bad filter type: ${filterType}`);
// 		}
// 	}

// 	return buff;
// }
