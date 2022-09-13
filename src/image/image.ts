export class Image {
	#width!: number;

	public get width(): number {
		return this.#width;
	}

	public set width(width: number) {
		if (width <= 0) {
			throw new Error(`Non-positive width: ${width}`);
		}

		this.#width = width;
	}

	#height!: number;

	public get height(): number {
		return this.#height;
	}

	public set height(height: number) {
		if (height <= 0) {
			throw new Error(`Non-positive height: ${height}`);
		}

		this.#height = height;
	}

	#bitmap!: Buffer;

	public get bitmap(): Buffer {
		return this.#bitmap;
	}

	public set bitmap(bitmap: Buffer) {
		this.#bitmap = bitmap;
	}
}
