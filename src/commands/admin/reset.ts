import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

import { all } from './sub/reset/all';
import { loses } from './sub/reset/loses';
import { rank } from './sub/reset/rank';
import { wins } from './sub/reset/wins';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'resetar',
			description: 'Reseta os dados dos usuários do servidor',
			usage: '<rank/vitorias/derrotas/tudo>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'rank',
					description: 'Reseta o rank dos usuários do servidor',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuario',
							description: '@usuário caso queira resetar um único usuário',
							type: ApplicationCommandOptionType.User,
						},
					],
				},
				{
					name: 'vitorias',
					description: 'Reseta as vitórias dos usuários do servidor',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuário',
							description: '@usuário caso queira resetar um único usuário',
							type: ApplicationCommandOptionType.User,
						},
					],
				},
				{
					name: 'derrotas',
					description: 'Reseta as derrotas dos usuários do servidor',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuário',
							description: '@usuário caso queira resetar um único usuário',
							type: ApplicationCommandOptionType.User,
						},
					],
				},
				{
					name: 'tudo',
					description: 'Reseta todos os dados dos usuários do servidor (não remove a assinatura)',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'usuário',
							description: '@usuário caso queira resetar um único usuário',
							type: ApplicationCommandOptionType.User,
						},
					],
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		switch (interaction.options.getSubcommand()) {
			case 'rank': {
				await rank(interaction, t);
				return;
			}

			case 'vitorias': {
				await wins(interaction, t);
				return;
			}

			case 'derrotas': {
				await loses(interaction, t);
				return;
			}

			case 'tudo': {
				await all(interaction, t);
			}
		}
	}
}
