/**
 * PNG signature
 * https://www.w3.org/TR/PNG/#5PNG-file-signature
 */
export const PngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

type ValueeOf<T> = T[keyof T];

/**
 * Chunk types
 * https://www.w3.org/TR/PNG/#4Concepts.FormatTypes
 */
export const ChunkTypeE = {
	IHDR: 0x49484452,
	cHRM: 0x6348524d,
	gAMA: 0x67414d41,
	iCCP: 0x69434350,
	sBIT: 0x73424954,
	sRGB: 0x73524742,
	PLTE: 0x504c5445,
	bKGD: 0x624b4744,
	hIST: 0x68495354,
	tRNS: 0x74524e53,
	pHYs: 0x70485973,
	sPLT: 0x73504c54,
	IDAT: 0x49444154,
	tEXt: 0x74455874,
	zTXt: 0x7a545874,
	iTXt: 0x69545874,
	tIME: 0x74494d45,
	IEND: 0x49454e44,
} as const;

/**
 * Colour types
 * https://www.w3.org/TR/PNG/#6Colour-values
 */
export const ColorTypeE = {
	Grayscale: 0,
	TrueColor: 2,
	IndexedColor: 3,
	GrayscaleAlpha: 4,
	TrueColorAlpha: 6,
} as const;

/**
 * Filter types
 * https://www.w3.org/TR/PNG/#9Filter-types
 */
export const FilterTypeE = {
	None: 0,
	Sub: 1,
	Up: 2,
	Average: 3,
	Paeth: 4,
} as const;

export type BitDepth = 1 | 2 | 4 | 8 | 16;
export type ColorType = ValueeOf<typeof ColorTypeE>;
export type CompressionMethod = 0;
export type FilterMethod = 0;
export type FilterType = ValueeOf<typeof FilterTypeE>;
export type InterlaceMethod = 0 | 1;
export type Channels = 1 | 2 | 3 | 4;

export type TextData = {
	keyword: string;
	text: string;
	languageTag?: string;
	translatedKeyword?: string;
};

type BaseEncoderOptions = {
	width: number;
	height: number;
	bitmap: Buffer;
	filterType?: FilterType;
	interlaceMethod?: 0 | 1;
};

type EncodeGrayscaleOptios = BaseEncoderOptions & {
	colorType: 0;
	bitDepth?: 1 | 2 | 4 | 8 | 16;
};

type EncodeTrueColorOptions = BaseEncoderOptions & {
	colorType: 2;
	bitDepth?: 8 | 16;
};

type EncodeIndexedColorOptions = BaseEncoderOptions & {
	colorType: 3;
	bitDepth?: 1 | 2 | 4 | 8;
};

type EncodeGrayscaleAlphaOptions = BaseEncoderOptions & {
	colorType: 4;
	bitDepth?: 8 | 16;
};

type EncodeTrueColorAlpha = BaseEncoderOptions & {
	colorType: 6;
	bitDepth?: 8 | 16;
};

export type EncodePNGOptions =
	| EncodeGrayscaleOptios
	| EncodeTrueColorOptions
	| EncodeIndexedColorOptions
	| EncodeGrayscaleAlphaOptions
	| EncodeTrueColorAlpha;
