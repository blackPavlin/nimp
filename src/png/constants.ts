import { Buffer } from 'node:buffer';
import type { InterlaceScan } from './types.js';

/**
 * PNG signature
 * @see https://www.w3.org/TR/PNG/#5PNG-file-signature
 */
export const PNG_SIGNATURE = Buffer.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);

/**
 * Chunk types
 * @see https://www.w3.org/TR/PNG/#4Concepts.FormatTypes
 */
export const enum CHUNK_TYPE {
	IHDR = 0x49484452,
	cHRM = 0x6348524d,
	gAMA = 0x67414d41,
	iCCP = 0x69434350,
	sBIT = 0x73424954,
	sRGB = 0x73524742,
	PLTE = 0x504c5445,
	bKGD = 0x624b4744,
	hIST = 0x68495354,
	tRNS = 0x74524e53,
	pHYs = 0x70485973,
	sPLT = 0x73504c54,
	IDAT = 0x49444154,
	tEXt = 0x74455874,
	zTXt = 0x7a545874,
	iTXt = 0x69545874,
	tIME = 0x74494d45,
	eXIf = 0x65584966,
	IEND = 0x49454e44,
}

/**
 * Color types
 * @see https://www.w3.org/TR/PNG/#6Colour-values
 */
export const enum COLOR_TYPE {
	Grayscale = 0,
	TrueColor = 2,
	IndexedColor = 3,
	GrayscaleAlpha = 4,
	TrueColorAlpha = 6,
}

/**
 * Interlace methods
 * @see https://www.w3.org/TR/PNG/#8InterlaceMethods
 */
export const enum INTERLACING {
	None = 0,
	Adam7 = 1,
}

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
