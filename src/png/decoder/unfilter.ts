import { FilterTypes } from '../types.js';
import paethPredictor from '../paeth.js';

/*
	Recon(x) = Filt(x)
	Recon(x) = Filt(x) + Recon(a)
	Recon(x) = Filt(x) + Recon(b)
	Recon(x) = Filt(x) + floor((Recon(a) + Recon(b)) / 2)
	Recon(x) = Filt(x) + PaethPredictor(Recon(a), Recon(b), Recon(c))
*/

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
	const lines = new Array<Buffer>(buffer.length / bytesPerLine);
	let previousLine = Buffer.alloc(bytesPerLine - 1);

	for (let y = 0, offset = 0; offset < buffer.length; y += 1, offset += bytesPerLine) {
		const line = buffer.subarray(offset + 1, offset + bytesPerLine);

		switch (buffer.readUInt8(offset)) {
			case FilterTypes.None:
				// No-op
				break;
			case FilterTypes.Sub:
				for (let i = bytesPerPixel; i < line.length; i += 1) {
					line[i] += line[i - bytesPerPixel];
				}
				break;
			case FilterTypes.Up:
				for (let i = 0; i < line.length; i += 1) {
					line[i] += previousLine[i];
				}
				break;
			case FilterTypes.Average:
				for (let i = 0; i < bytesPerPixel; i += 1) {
					line[i] += previousLine[i] >> 1;
				}

				for (let i = bytesPerPixel; i < line.length; i += 1) {
					line[i] += (line[i - bytesPerPixel] + previousLine[i]) >> 1;
				}
				break;
			case FilterTypes.Paeth:
				for (let i = 0; i < bytesPerPixel; i += 1) {
					line[i] += previousLine[i];
				}

				for (let i = bytesPerPixel; i < line.length; i += 1) {
					line[i] += paethPredictor(
						line[i - bytesPerPixel],
						previousLine[i],
						previousLine[i - bytesPerPixel],
					);
				}
				break;
			default:
				throw new Error('Bad filter type');
		}

		lines[y] = line;
		previousLine = line;
	}

	return lines;
}
