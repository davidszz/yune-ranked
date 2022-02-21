import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'set-avatar',
			description: 'Altere o avatar do bot',
			permissions: ['Administrator'],
			options: [
				{
					name: 'imagem',
					description: 'Nova imagem do bot',
					type: ApplicationCommandOptionType.Attachment,
					required: true,
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();
	}
}
