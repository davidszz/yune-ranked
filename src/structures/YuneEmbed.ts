import type { APIEmbed } from 'discord-api-types/v9';
import { Embed, EmbedData } from 'discord.js';

export class YuneEmbed extends Embed {
	constructor(data?: APIEmbed | EmbedData) {
		super(data);
		super.setColor(0x0084ff);
	}

	setDescription(...description: any[]): this {
		return super.setDescription(description.flat().join('\n'));
	}

	addDescription(...description: any[]): this {
		return this.setDescription([this.description ?? '', ...description]);
	}
}
