/**
 * @see https://www.w3.org/TR/PNG/#9Filter-type-4-Paeth
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
export function paethPredictor(a: number, b: number, c: number): number {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);

	if (pa <= pb && pa <= pc) {
		return a;
	}

	return pb <= pc ? b : c;
}
