import { BitDepth } from '../types';

/**
 * Converter 1, 2, 4, 16 bit to 8 bit
 * @param chunks
 * @param bitDepth
 * @param bitsPerLine
 * @returns
 */
export default function bitConverter(
	chunks: Buffer[],
	bitDepth: BitDepth,
	bitsPerLine: number,
	scale: boolean,
): Buffer[] {
	const buffers = new Array<Buffer>(chunks.length);

	switch (bitDepth) {
		case 1:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(bitsPerLine);

				for (let k = 0; k < chunk.length; k += 1) {
					const byte = chunk[k];

					const bytes = scale
						? Buffer.of(
								scale1BitTo8Bit((byte >> 7) & 1),
								scale1BitTo8Bit((byte >> 6) & 1),
								scale1BitTo8Bit((byte >> 5) & 1),
								scale1BitTo8Bit((byte >> 4) & 1),
								scale1BitTo8Bit((byte >> 3) & 1),
								scale1BitTo8Bit((byte >> 2) & 1),
								scale1BitTo8Bit((byte >> 1) & 1),
								scale1BitTo8Bit((byte >> 0) & 1),
						  )
						: Buffer.of(
								(byte >> 7) & 1,
								(byte >> 6) & 1,
								(byte >> 5) & 1,
								(byte >> 4) & 1,
								(byte >> 3) & 1,
								(byte >> 2) & 1,
								(byte >> 1) & 1,
								(byte >> 0) & 1,
						  );

					bytes.copy(buffer, k * 8);
				}

				buffers[i] = buffer;
			}
			break;
		case 2:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(bitsPerLine);

				for (let k = 0; k < chunk.length; k += 1) {
					const byte = chunk[k];

					const bytes = scale
						? Buffer.of(
								scale2BitTo8Bit((byte >> 6) & 3),
								scale2BitTo8Bit((byte >> 4) & 3),
								scale2BitTo8Bit((byte >> 2) & 3),
								scale2BitTo8Bit((byte >> 0) & 3),
						  )
						: Buffer.of((byte >> 6) & 3, (byte >> 4) & 3, (byte >> 2) & 3, (byte >> 0) & 3);

					bytes.copy(buffer, k * 4);
				}

				buffers[i] = buffer;
			}
			break;
		case 4:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(bitsPerLine);

				for (let k = 0; k < chunk.length; k += 1) {
					const byte = chunk[k];

					const bytes = scale
						? Buffer.of(scale4BitTo8Bit((byte >> 4) & 0x0f), scale4BitTo8Bit(byte & 0x0f))
						: Buffer.of((byte >> 4) & 0x0f, byte & 0x0f);

					bytes.copy(buffer, k * 2);
				}

				buffers[i] = buffer;
			}
			break;
		case 8:
			return chunks;
		case 16:
			for (let i = 0; i < chunks.length; i += 1) {
				const chunk = chunks[i];
				const buffer = Buffer.alloc(bitsPerLine);

				for (let k = 0; k < chunk.length; k += 2) {
					const byte = chunk[k];
					const byte2 = chunk[k + 1];

					buffer[k * 0.5] = scale16BitTo8Bit((byte << 8) | byte2);
				}

				buffers[i] = buffer;
			}
			break;
		default:
			throw new Error(`Bad bit depth: ${bitDepth as number}`);
	}

	return buffers;
}

function scale16BitTo8Bit(value: number): number {
	return Math.round((value * 255) / 65535);
}

function scale4BitTo8Bit(value: number): number {
	return Math.round((value * 255) / 15);
}

function scale2BitTo8Bit(value: number): number {
	return Math.round((value * 255) / 3);
}

function scale1BitTo8Bit(value: number): number {
	return Math.round((value * 255) / 1);
}
