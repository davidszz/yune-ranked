import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

export class YuneEmbed extends MessageEmbed {
	constructor(data?: MessageEmbed | MessageEmbedOptions) {
		super(data);
		this.setColor('#0084FF');
	}

	setDescription(...description: any[]): this {
		return super.setDescription(description.flat().join('\n'));
	}

	addDescription(...description: any[]): this {
		return this.setDescription([this.description ?? '', ...description]);
	}
}
