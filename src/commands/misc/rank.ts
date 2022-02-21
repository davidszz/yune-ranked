import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

import { loses } from './sub/rank/loses';
import { wins } from './sub/rank/wins';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'rank',
			description: 'Obtem um rank de usuários',
			usage: '<vitorias|derrotas>',
			showInMatchHelp: true,
			options: [
				{
					name: 'vitorias',
					description: 'Obtem um rank baseado nas vitórias dos usuários',
					type: ApplicationCommandOptionType.Subcommand,
				},
				{
					name: 'derrotas',
					description: 'Obtem um rank baseado nas derrotas dos usuários',
					type: ApplicationCommandOptionType.Subcommand,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		switch (interaction.options.getSubcommand()) {
			case 'vitorias': {
				await wins(interaction, t);
				return;
			}

			case 'derrotas': {
				await loses(interaction, t);
			}
		}
	}
}
