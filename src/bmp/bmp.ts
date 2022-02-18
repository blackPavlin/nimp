import { BmpSignature } from './constants';

export default class BMP {
	public static isBMP(buffer: Buffer): boolean {
		return BmpSignature.compare(buffer, 0, 2) === 0;
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
}
