export type Image = {
	bitmap: Buffer;
	width: number;
	height: number;
};

export default class ImageManipulation {
	constructor({ bitmap, width, height }: Image) {
		if (width <= 0 || height <= 0) {
			throw new Error('');
		}

		if (bitmap.length !== width * height * 4) {
			throw new Error('');
		}

		this.bitmap = bitmap;
		this.width = width;
		this.height = height;
	}

	private bitmap!: Buffer;

	get getBitmap(): Buffer {
		return this.bitmap;
	}

	private width!: number;

	get getWidth(): number {
		return this.width;
	}

	private height!: number;

	get getHeight(): number {
		return this.height;
	}

	public crop(x: number, y: number, w: number, h: number): this {
		if (x < 0 || y < 0 || w > this.width || h > this.height) {
			throw new Error('');
		}

		const buff = Buffer.alloc(w * h * 4);

		for (let i = 0; i < h; i += 1) {
			// TODO:
			this.bitmap.copy(buff, 0);
		}

		this.bitmap = buff;
		this.width = w;
		this.height = h;

		return this;
	}

	public async save(): Promise<void> {}
}
