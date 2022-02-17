import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { finalizeMatch } from '@functions/match/finalize-match';
import { Command } from '@structures/Command';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { MatchStatus } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'finalize',
			description: 'Finaliza uma partida',
			showInMatchHelp: true,
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

		const matchData = await interaction.client.database.matches.findOneAndPopulate(
			{
				status: MatchStatus.IN_GAME,
				...(matchId ? { matchId } : { 'channels.chat': interaction.channelId }),
			},
			{
				path: 'participants.member',
				select: 'mmr rank pdl wins loses',
			}
		);

		if (!matchData?._id) {
			if (matchId) {
				interaction.editReply({
					content: t('finalize.errors.not_found'),
				});
			} else {
				interaction.editReply({
					content: t('finalize.errors.invalid_match_channel'),
				});
			}
			return;
		}

		const participant = (id: string) => matchData.participants.find((x) => x.userId === id);
		if (!interaction.memberPermissions.has('ADMINISTRATOR') && !participant(interaction.user.id)?.isCaptain) {
			interaction.editReply({
				content: t('finalize.errors.no_permission'),
			});
			return;
		}

		if (!matchData.participants.some((x) => x.mvp)) {
			interaction.editReply({
				content: t('finalize.errors.no_mvp'),
			});
			return;
		}

		if (!matchData.teams.some((x) => x.win)) {
			interaction.editReply({
				content: t('finalize.errors.no_team_winner'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('YELLOW')
			.setTitle(t('finalize.embeds.confirmation.title'))
			.setDescription(t('finalize.embeds.confirmation.description'))
			.addFields([
				{
					name: t('finalize.embeds.confirmation.fields.team_winner.name'),
					value: t('finalize.embeds.confirmation.fields.team_winner.values.team', {
						context: matchData.teams.find((x) => x.win).teamId.toLowerCase(),
					}),
					inline: true,
				},
				{
					name: t('finalize.embeds.confirmation.fields.mvp_player'),
					value: `<@!${matchData.participants.find((x) => x.mvp).userId}>`,
					inline: true,
				},
			]);

		const confirmation = new ConfirmationEmbed({
			author: interaction.user,
			target: interaction,
			embed: confirmationEmbed,
			locale: interaction.guildLocale ?? 'pt-BR',
		});

		if (await confirmation.awaitConfirmation(60000)) {
			await interaction.channel.sendTyping().catch(() => {
				// Nothing
			});

			await finalizeMatch({ client: interaction.client, match: matchData });

			const chat = interaction.guild.channels.cache.get(matchData.channels.chat);
			if (chat && chat.isText()) {
				const finalizedEmbed = new YuneEmbed()
					.setColor('YELLOW')
					.setTitle(t('finalize.embeds.finalized.title'))
					.setDescription(t('finalize.embeds.finalized.description'));

				await chat.send({
					content: '@here',
					embeds: [finalizedEmbed],
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
			}

			if (interaction.channelId !== matchData.channels.chat) {
				interaction.channel.send({
					content: t('finalize.finalized', {
						author: interaction.user.toString(),
						match_id: matchData.matchId,
					}),
				});
			}
		}
	}
}
