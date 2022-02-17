import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { MatchStatus } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'finalize',
			description: 'Finaliza uma partida',
			options: [
				{
					name: 'partida',
					description: 'Forneça o ID da partida para finaliza-la',
					type: 'INTEGER',
					minValue: 1,
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		const matchId = interaction.options.getInteger('partida');

		await interaction.deferReply();

		if (matchId) {
			return;
		}

		const matchData = await interaction.client.database.matches.findOneAndPopulate(
			{
				status: MatchStatus.IN_GAME,
				'channels.chat': interaction.channelId,
			},
			{
				path: 'participants.member',
				select: 'mmr rank pdl wins loses',
			}
		);

		if (!matchData?._id) {
			interaction.editReply({
				content: t('finalize.errors.invalid_match_channel'),
			});
			return;
		}

		const participant = (id: string) => matchData.participants.find((x) => x.userId === id);
		if (!interaction.memberPermissions.has('ADMINISTRATOR') && !participant(interaction.user.id)?.isCaptain) {
			interaction.editReply({
				content: t('finalize.errors.no_permission'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('YELLOW')
			.setTitle(t('finalize.embeds.confirmation.title'))
			.setDescription(t('finalize.embeds.confirmation.description'));

		const confirmation = new ConfirmationEmbed({
			author: interaction.user,
			target: interaction,
			embed: confirmationEmbed,
			locale: interaction.guildLocale ?? 'pt-BR',
		});

		if (await confirmation.awaitConfirmation(60000)) {
			interaction.client.database.matches.finalizeMatch({
				client: interaction.client,
				match: matchData,
			});
		}
	}
}
