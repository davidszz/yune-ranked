import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

import { add } from './sub/pdl/add';
import { remove } from './sub/pdl/remove';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'pdl',
			description: 'Gerêncie os pontos dos membros do servidor',
			usage: '<add/remove> <usuario> <quantidaed>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'add',
					description: 'Adiciona pontos em um membro',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuario',
							description: '@menção ou ID do usuário',
							type: ApplicationCommandOptionType.User,
							required: true,
						},
						{
							name: 'quantidade',
							description: 'Quantidade de pontos a ser adicionada',
							type: ApplicationCommandOptionType.Integer,
							minValue: 1,
							maxValue: 5000,
							required: true,
						},
					],
				},
				{
					name: 'remove',
					description: 'Remove pontos de um membro do servidor',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuario',
							description: '@menção ou ID do usuário',
							type: ApplicationCommandOptionType.User,
							required: true,
						},
						{
							name: 'quantidade',
							description: 'Quantidade de pontos a ser removida',
							type: ApplicationCommandOptionType.Integer,
							minValue: 1,
							maxValue: 5000,
							required: true,
						},
					],
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()) {
			case 'add': {
				await add(interaction, t);
				return;
			}

			case 'remove': {
				await remove(interaction, t);
			}
		}
	}
}
