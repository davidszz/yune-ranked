import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { SURRENDER_VOTES_PERCENTAGE } from '@utils/Constants';
import { MatchStatus } from '@utils/MatchStatus';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'desistir',
			description: 'Vote para desistir da partida atual e cancela-la',
			showInMatchHelp: true,
			subscribersOnly: true,
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const matchData = await interaction.client.database.matches.findOne(
			{
				guildId: interaction.guildId,
				status: MatchStatus.InGame,
				'channels.chat': interaction.channelId,
			},
			'surrenderVotes participants channels'
		);

		if (!matchData?._id) {
			interaction.editReply({
				content: t('surrender.errors.invalid_match_channel'),
			});
			return;
		}

		if (!matchData.participants.some((x) => x.userId === interaction.user.id)) {
			interaction.editReply({
				content: t('surrender.errors.only_participants'),
			});
			return;
		}

		if (matchData.surrenderVotes?.includes(interaction.user.id)) {
			interaction.editReply({
				content: t('surrender.errors.already_voted'),
			});
			return;
		}

		const totalVotes = (matchData.surrenderVotes?.length ?? 0) + 1;
		const requiredVotes = Math.ceil(matchData.participants.length * SURRENDER_VOTES_PERCENTAGE);

		if (totalVotes >= requiredVotes) {
			await interaction.client.database.matches.deleteOne(matchData._id);
			await interaction.editReply({
				content: t('surrender.last_vote', {
					user: interaction.user.tag,
					percentage: Math.round(SURRENDER_VOTES_PERCENTAGE * 100),
				}),
			});

			const canceledEmbed = new YuneEmbed()
				.setColor('Red')
				.setTitle(t('surrender.embeds.canceled.title'))
				.setDescription(
					t('surrender.embeds.canceled.description', {
						percentage: Math.round(SURRENDER_VOTES_PERCENTAGE * 100),
						required_votes: requiredVotes,
					})
				);

			await interaction.channel.send({
				embeds: [canceledEmbed],
			});

			setTimeout(async () => {
				const categoryId = matchData.channels.category;
				const channelIds = [...Object.values(matchData.channels).filter((x) => x !== categoryId), categoryId];

				for (const channelId of channelIds) {
					try {
						await interaction.guild.channels.cache.get(channelId)?.delete();
					} catch (err) {
						// Nothing
					}
				}
			}, 10000);
			return;
		}

		await interaction.client.database.matches.update(matchData._id, {
			$addToSet: {
				surrenderVotes: interaction.user.id,
			},
		});

		interaction.editReply({
			content: t('surrender.voted', {
				user: interaction.user.toString(),
				votes: totalVotes,
				required_votes: requiredVotes,
			}),
		});
	}
}
