import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { MatchStatus } from '@utils/MatchStatus';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'mvp',
			description: 'Define o jogador MVP da partida',
			usage: '[usuário]',
			showInMatchHelp: true,
			subscribersOnly: true,
			options: [
				{
					name: 'usuário',
					description: '@usuário que foi o jogador MVP da partida',
					type: ApplicationCommandOptionType.User,
				},
			],
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
			'participants'
		);

		if (!matchData?._id) {
			await interaction.editReply({
				content: t('mvp.errors.invalid_match_channel'),
			});
			return;
		}

		if (
			!matchData.participants.some((x) => x.userId === interaction.user.id) &&
			!interaction.memberPermissions.has('Administrator')
		) {
			await interaction.editReply({
				content: t('mvp.errors.no_permission'),
			});
			return;
		}

		const target = interaction.options.getUser('usuário');
		const currentMvp = matchData.participants.find((x) => x.mvp);

		if (!target) {
			if (currentMvp) {
				await interaction.editReply({
					content: t('mvp.current_mvp', {
						user: `<@!${currentMvp.userId}>`,
					}),
				});
			} else {
				await interaction.editReply({
					content: t('mvp.no_mvp'),
				});
			}
			return;
		}

		if (target.bot || !matchData.participants.some((x) => x.userId === target.id)) {
			await interaction.editReply({
				content: t('mvp.errors.invalid_user'),
			});
			return;
		}

		if (currentMvp?.userId === target.id) {
			await interaction.editReply({
				content: t('mvp.errors.same_mvp'),
			});
			return;
		}

		await interaction.client.database.matches.update(matchData._id, {
			$set: {
				participants: matchData.participants.map((x) => ({
					...x,
					mvp: x.userId === target.id,
				})),
			},
		});

		await interaction.editReply({
			content: t('mvp.changed', {
				user: target.toString(),
			}),
		});
	}
}
