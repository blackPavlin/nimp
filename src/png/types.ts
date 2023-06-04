/**
 * Chunk types
 * @see https://www.w3.org/TR/PNG/#4Concepts.FormatTypes
 */
export enum ChunkTypes {
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
 * Colour types
 * @see https://www.w3.org/TR/PNG/#6Colour-values
 */
export enum ColorTypes {
	Grayscale = 0,
	TrueColor = 2,
	IndexedColor = 3,
	GrayscaleAlpha = 4,
	TrueColorAlpha = 6,
}

/**
 * Filter types
 * @see https://www.w3.org/TR/PNG/#9Filter-types
 */
export enum FilterTypes {
	None = 0,
	Sub = 1,
	Up = 2,
	Average = 3,
	Paeth = 4,
}

/**
 * Interlace methods
 * @see https://www.w3.org/TR/PNG/#8InterlaceMethods
 */
export enum InterlaceMethods {
	None = 0,
	Adam7 = 1,
}

export type InterlaceScan = {
	xFactor: number;
	yFactor: number;
	xOffset: number;
	yOffset: number;
};

export type BitDepth = 1 | 2 | 4 | 8 | 16;
export type Channels = 1 | 2 | 3 | 4;

export type TextData = {
	keyword: string;
	text: string;
	languageTag?: string;
	translatedKeyword?: string;
};

export type Chromaticities = {
	white: {
		x: number;
		y: number;
	};
	red: {
		x: number;
		y: number;
	};
	green: {
		x: number;
		y: number;
	};
	blue: {
		x: number;
		y: number;
	};
};

export type PhisicalDimensions = {
	pixelPerUnitX: number;
	pixelPerUnitY: number;
	unitSpecifier: 0 | 1;
};

export type SuggestedPalette = Record<string, [number, number, number, number, number][]>;

export type IccProfile = {
	name: string;
	profile: Buffer;
};

type BaseEncoderOptions = {
	width: number;
	height: number;
	bitmap: Buffer;
	filterType?: FilterTypes;
	interlaceMethod?: 0 | 1;
};

type EncodeGrayscaleOptios = BaseEncoderOptions & {
	colorType: 0;
	bitDepth?: BitDepth;
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
