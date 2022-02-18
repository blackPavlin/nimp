/**
 * Cyclic Redundancy Check
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix
 */
class CyclicRedundancyCheck {
	/** Table of CRCs of all 8-bit messages */
	private readonly table = new Array<number>(256);

	/** Predefined polynomials */
	private readonly polynomials = {
		IEEE: 0xedb88320,
	};

	constructor() {
		for (let i = 0; i < 256; i += 1) {
			let crc = i;

			for (let j = 0; j < 8; j += 1) {
				crc = (crc & 1) === 1 ? this.polynomials.IEEE ^ (crc >>> 1) : crc >>> 1;
			}

			this.table[i] = crc;
		}
	}

	/**
	 * Return the CRC of the bytes buf
	 * @param {Buffer} buffer
	 */
	public crc32(buffer: Buffer): number {
		let crc = 0xffffffff;

		for (let i = 0; i < buffer.length; i += 1) {
			crc = this.table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
		}

		return crc ^ 0xffffffff;
	}
}

export default new CyclicRedundancyCheck();
