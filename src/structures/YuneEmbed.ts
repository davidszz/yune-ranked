import type { APIEmbed } from 'discord-api-types/v9';
import { Embed, EmbedData } from 'discord.js';

export class YuneEmbed extends Embed {
	constructor(data?: APIEmbed | EmbedData) {
		super(data);
		super.setColor(0x0084ff);
	}

	setDescription(...description: string[]): this {
		return super.setDescription(description.join('\n'));
	}

	addDescription(...description: string[]): this {
		return this.setDescription(this.description ?? '', ...description);
	}
}
