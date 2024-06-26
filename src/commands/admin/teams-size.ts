import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'tamanho-equipes',
			description: 'Define o tamanho padrão das equipes nas partidas',
			usage: '<tamanho>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'tamanho',
					description: 'Tamanho de cada equipe',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 10,
					required: true,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const size = interaction.options.getInteger('tamanho');
		await interaction.client.database.guilds.update(interaction.guildId, {
			$set: {
				teamSize: size,
			},
		});

		await interaction.editReply({
			content: t('teams_size.changed', { size }),
		});
	}
}
