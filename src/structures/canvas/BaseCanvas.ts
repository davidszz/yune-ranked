import { Canvas, CanvasRenderingContext2D, loadImage, Image } from 'canvas';
import type { TFunction } from 'i18next';

interface IDrawImageOptions {
	image: string | Buffer | Image;
	x: number;
	y: number;
	width?: number;
	height?: number;
	keepProportion?: boolean;
}

interface IDrawRoundedImageOptions {
	image: string | Image;
	x: number;
	y: number;
	size: number;
	radius?: number;
}

export interface BaseCanvas {
	build(): Buffer | Promise<Buffer>;
}

export class BaseCanvas<T = unknown> extends Canvas {
	ctx: CanvasRenderingContext2D;
	data: T;

	constructor(public t: TFunction, width: number, height: number, type?: 'image' | 'pdf' | 'svg') {
		super(width, height, type);
		this.ctx = this.getContext('2d');
	}

	drawImage(options: IDrawImageOptions & { image: Image }): void;
	drawImage(options: IDrawImageOptions): Promise<void>;
	async drawImage(options: IDrawImageOptions) {
		const { x, y, width, height, keepProportion } = options;

		const image = options.image instanceof Image ? options.image : await this.loadImage(options.image);
		if (keepProportion && width && height) {
			this.ctx.save();
			this.ctx.rect(x, y, width, height);
			this.ctx.clip();

			let w = width;
			let h = (width / image.width) * image.height;

			if (h < height) {
				h = height;
				w = (height / image.height) * image.width;
			}

			this.ctx.drawImage(image, x - (w - width) / 2, y - (h - height) / 2, w, h);
			this.ctx.restore();
		} else {
			this.ctx.drawImage(image, x, y, width ?? image.width, height ?? image.height);
		}
	}

	drawRoundedImage(options: IDrawRoundedImageOptions & { image: Image }): void;
	drawRoundedImage(options: IDrawRoundedImageOptions & { image: string }): Promise<void>;
	async drawRoundedImage(options: IDrawRoundedImageOptions) {
		const { x, y, size, radius = 100, image } = options;
		this.roundRect({
			x,
			y,
			width: size,
			height: size,
			radius: (radius / 100) * size,
		});

		this.ctx.fill();

		this.ctx.save();
		this.ctx.clip();
		this.ctx.drawImage(typeof image === 'string' ? await this.loadImage(image) : image, x, y, size, size);
		this.ctx.restore();
	}

	roundRect(options: { x: number; y: number; width: number; height: number; radius: number }) {
		const { x, y, height, width, radius } = options;

		let r = radius;
		if (width < 2 * r) r = width / 2;
		if (height < 2 * r) r = height / 2;

		this.ctx.beginPath();
		this.ctx.moveTo(x + r, y);
		this.ctx.arcTo(x + width, y, x + width, y + height, r);
		this.ctx.arcTo(x + width, y + height, x, y + height, r);
		this.ctx.arcTo(x, y + height, x, y, r);
		this.ctx.arcTo(x, y, x + width, y, r);
		this.ctx.closePath();
	}

	async loadImage(src: string | Buffer, options?: any) {
		return loadImage(src, options).catch<null>(() => null);
	}

	createCanvas(width: number, height: number, type?: 'image' | 'pdf' | 'svg') {
		return new BaseCanvas(this.t, width, height, type);
	}

	setFont(font: string) {
		this.ctx.font = `${font}, "Symbols"`;
	}

	measureText(text: string) {
		const measure = this.ctx.measureText(text);
		return {
			width: measure.width,
			height: measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent,
			left: measure.actualBoundingBoxLeft,
			right: measure.actualBoundingBoxRight,
			top: measure.actualBoundingBoxAscent,
			bottom: measure.actualBoundingBoxDescent,
			text,
		};
	}

	fillText(options: {
		text: string;
		x: number;
		y: number;
		verticalAlign?: 'middle' | 'top' | 'bottom';
		maxWidth?: number;
	}) {
		const { text, x, y, verticalAlign, maxWidth } = options;

		if (verticalAlign) {
			const measure = this.measureText(options.text);
			switch (verticalAlign) {
				case 'top': {
					this.ctx.fillText(text, x, y + measure.height, maxWidth);
					break;
				}

				case 'middle': {
					this.ctx.fillText(text, x, y + measure.height / 2, maxWidth);
					break;
				}

				default:
					this.ctx.fillText(text, x, y, maxWidth);
					break;
			}
		} else {
			this.ctx.fillText(text, x, y, maxWidth);
		}

		return this.measureText(text);
	}
}
