import { FilterTypes } from '../types';
import paethPredictor from './paeth';

/**
 * @see https://www.w3.org/TR/PNG/#9Filters
 * @param buffer {Buffer}
 * @param bytesPerPixel {number}
 * @param bytesPerLine {number}
 * @returns {Buffer[]}
 */
export default function unFilter(
	buffer: Buffer,
	bytesPerPixel: number,
	bytesPerLine: number,
): Buffer[] {
	const chunks: Buffer[] = [];

	for (let i = 0, k = 0; i < buffer.length; i += bytesPerLine, k += 1) {
		const filterType = buffer.readUInt8(i);
		const chunk = buffer.subarray((i += 1), i + bytesPerLine);

		switch (filterType) {
			case FilterTypes.None:
				chunks.push(unFilterNone(chunk));
				break;
			case FilterTypes.Sub:
				chunks.push(unFilterSub(chunk, bytesPerPixel));
				break;
			case FilterTypes.Up:
				chunks.push(unFilterUp(chunk, chunks[k - 1]));
				break;
			case FilterTypes.Average:
				chunks.push(unFilterAverage(chunk, bytesPerPixel, chunks[k - 1]));
				break;
			case FilterTypes.Paeth:
				chunks.push(unFilterPaeth(chunk, bytesPerPixel, chunks[k - 1]));
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
		chunk[i] += chunk[i - bpp];
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
		chunk[i] += tmp[i];
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
			chunk[i] += chunk[i - bpp] >> 1;
		}

		return chunk;
	}

	for (let i = 0; i < bpp; i += 1) {
		chunk[i] += tmp[i] >> 1;
	}

	for (let i = bpp; i < chunk.length; i += 1) {
		chunk[i] += (chunk[i - bpp] + tmp[i]) >> 1;
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
			chunk[i] += chunk[i - bpp];
		}

		return chunk;
	}

	for (let i = 0; i < bpp; i += 1) {
		chunk[i] += tmp[i];
	}

	for (let i = bpp; i < chunk.length; i += 1) {
		chunk[i] += paethPredictor(chunk[i - bpp], tmp[i], tmp[i - bpp]);
	}

	return chunk;
}
