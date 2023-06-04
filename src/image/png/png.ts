import { Image } from '../image';
import { PngSignature } from '../../png/constants';
import { BitDepth, ColorTypes, InterlaceMethods } from '../../png/types';

export class PNG extends Image {
	public static isPNG(buffer: Buffer): boolean {
		return PngSignature.compare(buffer, 0, 8) === 0;
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

	#compressionMethod!: 0;

	public get compressionMethod(): 0 {
		return this.#compressionMethod;
	}

	#filterMethod!: 0;

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
}
