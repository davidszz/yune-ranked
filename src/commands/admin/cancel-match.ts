import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { CreateUrl, MatchStatus } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'cancelar-partida',
			description: 'Cancele uma partida rapidamente sem os votos dos participantes',
			usage: '<partida>',
			permissions: ['ADMINISTRATOR'],
			options: [
				{
					name: 'partida',
					description: 'Forneça o ID da partida',
					type: 'INTEGER',
					minValue: 1,
					required: true,
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply({
			ephemeral: true,
		});

		const matchId = interaction.options.getInteger('partida');
		const matchData = await interaction.client.database.matches.findOne(
			{
				status: MatchStatus.IN_GAME,
				matchId,
			},
			'_id channels'
		);

		if (!matchData?._id) {
			interaction.editReply({
				content: t('cancel_match.errors.not_found'),
			});
			return;
		}

		const matchUrl = CreateUrl.channel({ guildId: interaction.guildId, channelId: matchData.channels.chat });
		const confirmationEmbed = new YuneEmbed()
			.setColor('YELLOW')
			.setTitle(t('cancel_match.embeds.confirmation.title'))
			.setDescription(
				t('cancel_match.embeds.confirmation.description', {
					match_id: matchId,
					match_url: matchUrl,
				})
			);

		const confirmation = new ConfirmationEmbed({
			author: interaction.user,
			target: interaction,
			embed: confirmationEmbed,
			locale: interaction.guildLocale ?? 'pt-BR',
		});

		if (await confirmation.awaitConfirmation()) {
			await interaction.client.database.matches.deleteOne(matchData._id);
			const categoryId = matchData.channels.category;
			const channelIds = [...Object.values(matchData.channels).filter((x) => x !== categoryId), categoryId];

			for (const channelId of channelIds) {
				try {
					await interaction.guild.channels.cache.get(channelId)?.delete();
				} catch (err) {
					// Nothing
				}
			}

			interaction.editReply({
				content: t('cancel_match.canceled', {
					match_id: matchId,
				}),
				embeds: [],
				components: [],
			});
		} else {
			interaction.editReply({
				content: t('cancel_match.confirmation_canceled', {
					match_id: matchId,
					match_url: matchUrl,
				}),
				embeds: [],
				components: [],
			});
		}
	}
}
