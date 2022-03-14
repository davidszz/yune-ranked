import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { finalizeMatch } from '@functions/match/finalizeMatch';
import { Command } from '@structures/Command';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'finalizar',
			description: 'Finaliza uma partida',
			usage: '[partida]',
			showInMatchHelp: true,
			subscribersOnly: true,
			options: [
				{
					name: 'partida',
					description: 'Forneça o ID da partida para finaliza-la',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		const matchId = interaction.options.getInteger('partida');

		await interaction.deferReply();

		const matchData = await interaction.client.database.matches.findOneAndPopulate(
			{
				guildId: interaction.guildId,
				status: MatchStatus.InGame,
				...(matchId ? { matchId } : { 'channels.chat': interaction.channelId }),
			},
			{
				path: 'participants.member',
				select: 'mmr rank pdl wins loses',
			}
		);

		if (!matchData?._id) {
			if (matchId) {
				await interaction.editReply({
					content: t('finalize.errors.not_found'),
				});
			} else {
				await interaction.editReply({
					content: t('finalize.errors.invalid_match_channel'),
				});
			}
			return;
		}

		const participant = (id: string) => matchData.participants.find((x) => x.userId === id);
		if (!interaction.memberPermissions.has('Administrator') && !participant(interaction.user.id)?.isCaptain) {
			await interaction.editReply({
				content: t('finalize.errors.no_permission'),
			});
			return;
		}

		if (!matchData.participants.some((x) => x.mvp)) {
			await interaction.editReply({
				content: t('finalize.errors.no_mvp'),
			});
			return;
		}

		if (!matchData.teams.some((x) => x.win)) {
			await interaction.editReply({
				content: t('finalize.errors.no_team_winner'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('Yellow')
			.setTitle(t('finalize.embeds.confirmation.title'))
			.setDescription(t('finalize.embeds.confirmation.description'))
			.addFields(
				{
					name: t('finalize.embeds.confirmation.fields.team_winner.name'),
					value: t('finalize.embeds.confirmation.fields.team_winner.values.team', {
						context: matchData.teams.find((x) => x.win).teamId === TeamId.Blue ? 'blue' : 'red',
					}),
					inline: true,
				},
				{
					name: t('finalize.embeds.confirmation.fields.mvp_player'),
					value: `<@!${matchData.participants.find((x) => x.mvp).userId}>`,
					inline: true,
				}
			);

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

			await finalizeMatch({ client: interaction.client, matchData });

			const chat = interaction.guild.channels.cache.get(matchData.channels.chat);
			if (chat && chat.isText()) {
				const finalizedEmbed = new YuneEmbed()
					.setColor('Yellow')
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
				await interaction.channel.send({
					content: t('finalize.finalized', {
						author: interaction.user.toString(),
						match_id: matchData.matchId,
					}),
				});
			}
		}
	}
}
