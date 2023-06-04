import { PngSignature } from './constants';
import {
	BitDepth,
	Chromaticities,
	ColorTypes,
	IccProfile,
	InterlaceMethods,
	PhisicalDimensions,
	SuggestedPalette,
	TextData,
} from './types';

export default class PNG {
	public static isPNG(buffer: Buffer): boolean {
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

	public set bitDepth(bitDepth: number) {
		if (
			bitDepth !== 1 &&
			bitDepth !== 2 &&
			bitDepth !== 4 &&
			bitDepth !== 8 &&
			bitDepth !== 16
		) {
			throw new Error(`Bad bit depth: ${bitDepth}`);
		}

		this.#bitDepth = bitDepth;
	}

	#colorType!: ColorTypes;

	public get colorType(): ColorTypes {
		return this.#colorType;
	}

	public set colorType(colorType: number) {
		if (
			colorType !== ColorTypes.Grayscale &&
			colorType !== ColorTypes.TrueColor &&
			colorType !== ColorTypes.IndexedColor &&
			colorType !== ColorTypes.GrayscaleAlpha &&
			colorType !== ColorTypes.TrueColorAlpha
		) {
			throw new Error(`Bad color type: ${colorType}`);
		}

		this.#colorType = colorType;
	}

	#compressionMethod: 0 = 0;

	public get compressionMethod(): 0 {
		return this.#compressionMethod;
	}

	#filterMethod: 0 = 0;

	public get filterMethod(): 0 {
		return this.#filterMethod;
	}

	#interlaceMethod!: InterlaceMethods;

	public get interlaceMethod(): InterlaceMethods {
		return this.#interlaceMethod;
	}

	public set interlaceMethod(interlaceMethod: number) {
		if (
			interlaceMethod !== InterlaceMethods.None &&
			interlaceMethod !== InterlaceMethods.Adam7
		) {
			throw new Error(`Bad interlace method: ${interlaceMethod}`);
		}

		this.#interlaceMethod = interlaceMethod;
	}

	#palette?: Buffer[];

	public get palette(): Buffer[] | undefined {
		return this.#palette;
	}

	public set palette(palette: Buffer[] | undefined) {
		if (
			(palette && this.colorType === ColorTypes.Grayscale) ||
			this.colorType === ColorTypes.GrayscaleAlpha
		) {
			throw new Error('PLTE, color type mismatch');
		}

		this.#palette = palette;
	}

	#transparent?: number[];

	public get transparent(): number[] | undefined {
		return this.#transparent;
	}

	public set transparent(transparent: number[] | undefined) {
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
