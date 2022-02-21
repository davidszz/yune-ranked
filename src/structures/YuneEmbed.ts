import type { APIEmbed } from 'discord-api-types/v9';
import { Colors as DiscordColors, Embed, EmbedData } from 'discord.js';

import { Colors } from '@utils/Colors';

export class YuneEmbed extends Embed {
	constructor(data?: APIEmbed | EmbedData) {
		super(data);
		this.setColor('Yune');
	}

	setColor(color: keyof typeof DiscordColors | keyof typeof Colors): this;
	setColor(color: string | number | [number, number, number]): this;
	setColor(color: string | number | [number, number, number]) {
		const colors = { ...DiscordColors, ...Colors };
		if (typeof color === 'string') {
			return super.setColor(colors[color] ?? parseInt(color.replace('#', ''), 16));
		}
		return super.setColor(color);
	}

	setDescription(...description: string[]): this {
		return super.setDescription(description.join('\n'));
	}

	addDescription(...description: string[]): this {
		return this.setDescription(this.description ?? '', ...description);
	}
}
