import { PngSignature } from './constants';
import {
	BitDepth,
	Chromaticities,
	ColorType,
	ColorTypes,
	CompressionMethod,
	FilterMethod,
	IccProfile,
	InterlaceMethod,
	PhisicalDimensions,
	SuggestedPalette,
	TextData,
} from './types';

// type IDAT = {
// 	width: number;
// 	height: number;
// 	bitDepth: BitDepth;
// 	colorType: ColorType;
// 	compressionMethod: CompressionMethod;
// 	filterMethod: FilterMethod;
// 	interlaceMethod: InterlaceMethod;
// };

export default class PNG {
	// constructor(data: IDAT) {
	// 	this.width = data.width;
	// 	this.height = data.height;
	// 	this.bitDepth = data.bitDepth;
	// 	this.colorType = data.colorType;
	// 	this.compressionMethod = data.compressionMethod;
	// 	this.filterMethod = data.filterMethod;
	// 	this.interlaceMethod = data.interlaceMethod;
	// }

	static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
	}

	#width!: number;

	public get width(): number {
		return this.#width;
	}

	protected set width(width: number) {
		if (width <= 0) {
			throw new Error(`Non-positive width: ${width}`);
		}

		this.#width = width;
	}

	#height!: number;

	public get height(): number {
		return this.#height;
	}

	protected set height(height: number) {
		if (height <= 0) {
			throw new Error(`Non-positive height: ${height}`);
		}

		this.#height = height;
	}

	#bitDepth!: BitDepth;

	public get bitDepth(): BitDepth {
		return this.#bitDepth;
	}

	protected set bitDepth(bitDepth: BitDepth) {
		if (bitDepth !== 1 && bitDepth !== 2 && bitDepth !== 4 && bitDepth !== 8 && bitDepth !== 16) {
			throw new Error(`Bad bit depth: ${bitDepth as number}`);
		}

		if (this.#colorType) {
			switch (this.#colorType) {
				case ColorTypes.TrueColor:
				case ColorTypes.GrayscaleAlpha:
				case ColorTypes.TrueColorAlpha:
					if (bitDepth !== 8 && bitDepth !== 16) {
						throw new Error(`Unsupported color type ${this.#colorType} and bit depth ${bitDepth}`);
					}
					break;
				case ColorTypes.IndexedColor:
					if (bitDepth === 16) {
						throw new Error(`Unsupported color type ${this.#colorType} and bit depth ${bitDepth}`);
					}
					break;
			}
		}

		this.#bitDepth = bitDepth;
	}

	#colorType!: ColorType;

	public get colorType(): ColorType {
		return this.#colorType;
	}

	protected set colorType(colorType: ColorType) {
		if (
			colorType !== ColorTypes.Grayscale &&
			colorType !== ColorTypes.TrueColor &&
			colorType !== ColorTypes.IndexedColor &&
			colorType !== ColorTypes.GrayscaleAlpha &&
			colorType !== ColorTypes.TrueColorAlpha
		) {
			throw new Error(`Bad color type: ${colorType as number}`);
		}

		if (this.#bitDepth) {
			switch (colorType) {
				case ColorTypes.TrueColor:
				case ColorTypes.GrayscaleAlpha:
				case ColorTypes.TrueColorAlpha:
					if (this.bitDepth !== 8 && this.#bitDepth !== 16) {
						throw new Error(`Unsupported color type ${colorType} and bit depth ${this.#bitDepth}`);
					}
					break;
				case ColorTypes.IndexedColor:
					if (this.#bitDepth === 16) {
						throw new Error(`Unsupported color type ${colorType} and bit depth ${this.#bitDepth}`);
					}
					break;
			}
		}

		this.#colorType = colorType;
	}

	#compressionMethod!: CompressionMethod;

	public get compressionMethod(): CompressionMethod {
		return this.#compressionMethod;
	}

	protected set compressionMethod(compressionMethod: CompressionMethod) {
		if (compressionMethod !== 0) {
			throw new Error(`Bad compression method: ${compressionMethod as number}`);
		}
	}

	#filterMethod!: FilterMethod;

	public get filterMethod(): FilterMethod {
		return this.#filterMethod;
	}

	protected set filterMethod(filterMethod: FilterMethod) {
		if (filterMethod !== 0) {
			throw new Error(`Bad filter method: ${filterMethod as number}`);
		}

		this.#filterMethod = filterMethod;
	}

	#interlaceMethod!: InterlaceMethod;

	public get interlaceMethod(): InterlaceMethod {
		return this.#interlaceMethod;
	}

	protected set interlaceMethod(interlaceMethod: InterlaceMethod) {
		if (interlaceMethod !== 0 && interlaceMethod !== 1) {
			throw new Error(`Bad interlace method: ${interlaceMethod as number}`);
		}

		this.#interlaceMethod = interlaceMethod;
	}

	#bitmap!: Buffer;

	public get bitmap(): Buffer {
		return this.#bitmap;
	}

	protected set bitmap(bitmap: Buffer) {
		this.#bitmap = bitmap;
	}

	#palette?: Buffer[];

	public get palette(): Buffer[] | undefined {
		return this.#palette;
	}

	protected set palette(palette: Buffer[] | undefined) {
		if (this.colorType === ColorTypes.Grayscale || this.colorType === ColorTypes.GrayscaleAlpha) {
			throw new Error('PLTE, color type mismatch');
		}

		this.#palette = palette;
	}

	#transparent?: number[];

	public get transparent(): number[] | undefined {
		return this.#transparent;
	}

	protected set transparent(transparent: number[] | undefined) {
		if (
			this.colorType === ColorTypes.GrayscaleAlpha ||
			this.colorType === ColorTypes.TrueColorAlpha
		) {
			throw new Error('tRNS, color type mismatch');
		}

		this.#transparent = transparent;
	}

	#chromaticities?: Chromaticities;

	public get chromaticities(): Chromaticities | undefined {
		return this.#chromaticities;
	}

	protected set chromaticities(chromaticities: Chromaticities | undefined) {
		this.#chromaticities = chromaticities;
	}

	#gamma?: number;

	public get gamma(): number | undefined {
		return this.#gamma;
	}

	protected set gamma(gamma: number | undefined) {
		this.#gamma = gamma;
	}

	#iccProfile?: IccProfile;

	public get iccProfile(): IccProfile | undefined {
		return this.#iccProfile;
	}

	protected set iccProfile(iccProfile: IccProfile | undefined) {
		if (iccProfile && this.#sRGB) {
			throw new Error();
		}

		this.#iccProfile = iccProfile;
	}

	#physicalDimensions?: PhisicalDimensions;

	public get physicalDimensions(): PhisicalDimensions | undefined {
		return this.#physicalDimensions;
	}

	protected set physicalDimensions(physicalDimensions: PhisicalDimensions | undefined) {
		this.#physicalDimensions = physicalDimensions;
	}

	#suggestedPalette?: SuggestedPalette;

	public get suggestedPalette(): SuggestedPalette | undefined {
		return this.#suggestedPalette;
	}

	#significantBits?: [number, number, number, number];

	public get significantBits(): [number, number, number, number] | undefined {
		return this.#significantBits;
	}

	protected set significantBits(significantBits: [number, number, number, number] | undefined) {
		this.#significantBits = significantBits;
	}

	#sRGB?: number;

	public get sRGB(): number | undefined {
		return this.#sRGB;
	}

	protected set sRGB(sRGB: number | undefined) {
		if (sRGB && this.#iccProfile) {
			throw new Error();
		}

		this.#sRGB = sRGB;
	}

	#background?: [number, number, number, number];

	public get background(): [number, number, number, number] | undefined {
		return this.#background;
	}

	protected set background(background: [number, number, number, number] | undefined) {
		this.#background = background;
	}

	#histogram?: number[];

	public get histogram(): number[] | undefined {
		return this.#histogram;
	}

	protected set histogram(histogram: number[] | undefined) {
		this.#histogram = histogram;
	}

	#time?: number;

	public get time(): number | undefined {
		return this.#time;
	}

	protected set time(time: number | undefined) {
		this.#time = time;
	}

	#text?: TextData[];

	public get text(): TextData[] | undefined {
		return this.#text;
	}
}
