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

		const match = this.client.matches.cache.find(
			(x) => x.status === MatchStatus.InGame && x.channels.chat?.id === interaction.channelId
		);

		if (!match) {
			await interaction.editReply({
				content: t('surrender.errors.invalid_match_channel'),
			});
			return;
		}

		if (!match.participants.has(interaction.user.id)) {
			await interaction.editReply({
				content: t('surrender.errors.only_participants'),
			});
			return;
		}

		if (match.surrenderVotes?.has(interaction.user.id)) {
			await interaction.editReply({
				content: t('surrender.errors.already_voted'),
			});
			return;
		}

		const totalVotes = match.surrenderVotes.size + 1;
		const requiredVotes = Math.ceil(match.participants.size * SURRENDER_VOTES_PERCENTAGE);

		if (totalVotes >= requiredVotes) {
			await match.delete();
			this.client.emit('matchCanceled', match);

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
				await match.deleteChannels();
			}, 10000);
			return;
		}

		await match.addSurrenderVote(interaction.user.id);

		await interaction.editReply({
			content: t('surrender.voted', {
				user: interaction.user.toString(),
				votes: totalVotes,
				required_votes: requiredVotes,
			}),
		});
	}
}
