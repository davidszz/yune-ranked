import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

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
					type: 'SUB_COMMAND',
				},
				{
					name: 'derrotas',
					description: 'Obtem um rank baseado nas derrotas dos usuários',
					type: 'SUB_COMMAND',
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		switch (interaction.options.getSubcommand()) {
			case 'vitorias': {
				wins(interaction, t);
			}
		}
	}
}
