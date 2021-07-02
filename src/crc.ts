/**
 * Cyclic Redundancy Check
 * https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix
 */
class CyclicRedundancyCheck {
	/** Table of CRCs of all 8-bit messages */
	private readonly table: number[] = [];

	/** */
	private readonly IEEE = 0xedb88320;

	constructor() {
		for (let n = 0; n < 256; n += 1) {
			let c = n;

			for (let k = 0; k < 8; k += 1) {
				c = c & 1 ? this.IEEE ^ (c >>> 1) : c >>> 1;
			}

			this.table[n] = c;
		}
	}

	/**
	 * Return the CRC of the bytes buf
	 * @param {Buffer} buf
	 */
	public crc32(buf: Buffer): number {
		let crc = 0xffffffff;

		for (let i = 0; i < buf.length; i += 1) {
			crc = this.table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
		}

		return crc ^ 0xffffffff;
	}
}

export default new CyclicRedundancyCheck();
