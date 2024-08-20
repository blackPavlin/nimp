import type { InterlaceScan } from './types.js';

/**
 * PNG signature
 * @see https://www.w3.org/TR/PNG/#5PNG-file-signature
 */
export const PngSignature = Buffer.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);

export const GammaFactor = 100000;

export const ChromaticitiesFactor = 100000;

export const Interlacing: InterlaceScan[] = [
	{ xFactor: 8, yFactor: 8, xOffset: 0, yOffset: 0 },
	{ xFactor: 8, yFactor: 8, xOffset: 4, yOffset: 0 },
	{ xFactor: 4, yFactor: 8, xOffset: 0, yOffset: 4 },
	{ xFactor: 4, yFactor: 4, xOffset: 2, yOffset: 0 },
	{ xFactor: 2, yFactor: 4, xOffset: 0, yOffset: 2 },
	{ xFactor: 2, yFactor: 2, xOffset: 1, yOffset: 0 },
	{ xFactor: 1, yFactor: 2, xOffset: 0, yOffset: 1 },
];
