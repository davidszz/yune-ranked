import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { MatchStatus } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'ajuda',
			description: 'Obtem uma lista com todos os comandos do bot',
			showInMatchHelp: true,
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const paginated = new PaginatedEmbed({
			author: interaction.user,
			target: interaction,
			values: [
				{ id: 1, value: 'aa' },
				{ id: 2, value: 'bb' },
			],
			locale: interaction.guildLocale,
			limit: 1,
			createRow(data, index) {
				return `${index + 1} - (${data.id}) ${data.value}`;
			},
			rollback: true,
		});

		await paginated.paginate();
		return;

		const matchData = await interaction.client.database.matches.findOne({
			status: MatchStatus.IN_GAME,
			'channels.chat': interaction.channelId,
		});

		if (matchData?._id) {
		}
	}
}
