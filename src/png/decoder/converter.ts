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
								((byte >> 7) & 1) * 0xff,
								((byte >> 6) & 1) * 0xff,
								((byte >> 5) & 1) * 0xff,
								((byte >> 4) & 1) * 0xff,
								((byte >> 3) & 1) * 0xff,
								((byte >> 2) & 1) * 0xff,
								((byte >> 1) & 1) * 0xff,
								((byte >> 0) & 1) * 0xff,
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
								((byte >> 6) & 3) * 0x55,
								((byte >> 4) & 3) * 0x55,
								((byte >> 2) & 3) * 0x55,
								((byte >> 0) & 3) * 0x55,
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
						? Buffer.of(((byte >> 4) & 0x0f) * 0x11, (byte & 0x0f) * 0x11)
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
					const byte = chunk.readUInt16BE(k);

					buffer[k * 0.5] = (byte / 0x101 + 0.5) | 0;
				}

				buffers[i] = buffer;
			}
			break;
		default:
			throw new Error(`Bad bit depth: ${bitDepth as number}`);
	}

	return buffers;
}
