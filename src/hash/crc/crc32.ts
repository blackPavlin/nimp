/**
 * Cyclic Redundancy Check
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix
 */
class Crc32 {
	constructor() {
		this.makeTable();
	}

	private readonly table = new Array<number>(256);

	private makeTable(): void {
		for (let n = 0; n < 256; n += 1) {
			let c = n;

			for (let k = 0; k < 8; k += 1) {
				c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
			}

			this.table[n] = c;
		}
	}

	public sum(buffer: Buffer): number {
		let crc = 0xffffffff;

		for (const byte of buffer) {
			crc = this.table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
		}

		return crc ^ 0xffffffff;
	}
}

export default new Crc32();
