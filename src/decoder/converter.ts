/**
 * Converter 1, 2, 4, 16 bit to 8 bit
 */
export default {
	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} bpl
	 * @returns {Buffer}
	 */
	1: (chunk: Buffer, bpl: number): Buffer => {
		const buff = Buffer.alloc(bpl);

		for (let i = 0; i < chunk.length; i += 1) {
			const byte = chunk[i];

			const bytes = Buffer.from([
				(byte >> 7) & 1,
				(byte >> 6) & 1,
				(byte >> 5) & 1,
				(byte >> 4) & 1,
				(byte >> 3) & 1,
				(byte >> 2) & 1,
				(byte >> 1) & 1,
				(byte >> 0) & 1,
			]);

			bytes.copy(buff, i * 8);
		}

		return buff;
	},

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} bpl
	 * @returns {Buffer}
	 */
	2: (chunk: Buffer, bpl: number): Buffer => {
		const buff = Buffer.alloc(bpl);

		for (let i = 0; i < chunk.length; i += 1) {
			const byte = chunk[i];

			const bytes = Buffer.from([
				(byte >> 6) & 3,
				(byte >> 4) & 3,
				(byte >> 2) & 3,
				(byte >> 0) & 3,
			]);

			bytes.copy(buff, i * 4);
		}

		return buff;
	},

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} bpl
	 * @returns {Buffer}
	 */
	4: (chunk: Buffer, bpl: number): Buffer => {
		const buff = Buffer.alloc(bpl);

		for (let i = 0; i < chunk.length; i += 1) {
			const byte = chunk[i];

			const bytes = Buffer.from([byte >> 4, byte & 0x0f]);

			bytes.copy(buff, i * 2);
		}

		return buff;
	},

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} bpl
	 * @returns {Buffer}
	 */
	8: (chunk: Buffer, bpl: number): Buffer => chunk,

	/**
	 *
	 * @param {Buffer} chunk
	 * @param {number} bpl
	 * @returns {Buffer}
	 */
	16: (chunk: Buffer, bpl: number): Buffer => {
		const buff = Buffer.alloc(bpl);

		for (let i = 0; i < chunk.length; i += 2) {
			const byte = chunk[i];
			const byte2 = chunk[i + 1];

			const bytes = Buffer.from([(byte << 8) + byte2]);

			bytes.copy(buff, i * 0.5);
		}

		return buff;
	},
};
