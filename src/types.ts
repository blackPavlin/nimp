/**
 * PNG signature
 * https://www.w3.org/TR/PNG/#5PNG-file-signature
 */
export const PngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Chunk types
 * https://www.w3.org/TR/PNG/#4Concepts.FormatTypes
 */
export enum ChunkTypeE {
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
	IEND = 0x49454e44,
}

export type BitDepth = 1 | 2 | 4 | 8 | 16;
export type ColorType = 0 | 2 | 3 | 4 | 6;
export type CompressionMethod = 0;
export type FilterMethod = 0;
export type InterlaceMethod = 0 | 1;
export type Channels = 1 | 2 | 3 | 4;

/**
 * Colour types
 * https://www.w3.org/TR/PNG/#6Colour-values
 */
export enum ColorTypeE {
	Grayscale = 0,
	TrueColor = 2,
	IndexedColor = 3,
	GrayscaleAlpha = 4,
	TrueColorAlpha = 6,
}

/**
 * Filter types
 * https://www.w3.org/TR/PNG/#9Filter-types
 */
export enum FilterTypeE {
	None = 0,
	Sub = 1,
	Up = 2,
	Average = 3,
	Paeth = 4,
}

export type TextData = {
	keyword: string;
	text: string;
	languageTag?: string;
	translatedKeyword?: string;
};
