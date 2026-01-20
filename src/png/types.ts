/**
 * Filter types
 * @see https://www.w3.org/TR/PNG/#9Filter-types
 */
export const enum FilterTypes {
	None = 0,
	Sub = 1,
	Up = 2,
	Average = 3,
	Paeth = 4,
}

export interface InterlaceScan {
	xFactor: number;
	yFactor: number;
	xOffset: number;
	yOffset: number;
}

export type BitDepth = 1 | 2 | 4 | 8 | 16;
export type Channels = 1 | 2 | 3 | 4;

export interface TextData {
	keyword: string;
	text: string;
	languageTag?: string;
	translatedKeyword?: string;
}

export interface Chromaticities {
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
}

export interface PhisicalDimensions {
	pixelPerUnitX: number;
	pixelPerUnitY: number;
	unitSpecifier: 0 | 1;
}

export type SuggestedPalette = Record<string, [number, number, number, number, number][]>;

export interface IccProfile {
	name: string;
	profile: Buffer;
}

interface BaseEncoderOptions {
	width: number;
	height: number;
	bitmap: Buffer;
	filterType?: FilterTypes;
	interlaceMethod?: 0 | 1;
}

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
