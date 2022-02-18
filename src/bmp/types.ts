type ValueOf<T> = T[keyof T];

export type BitsPerPixel = 1 | 4 | 8 | 16 | 24 | 32;

export const CompressionMethods = {
	BI_RGB: 0,
	BI_RLE8: 1,
	BI_RLE4: 2,
	BI_BITFIELDS: 3,
	BI_JPEG: 4,
	BI_PNG: 5,
	BI_ALPHABITFIELDS: 6,
	BI_CMYK: 11,
	BI_CMYKRLE8: 12,
	BI_CMYKRLE4: 13,
} as const;

export type CompressionMethod = ValueOf<typeof CompressionMethods>;
