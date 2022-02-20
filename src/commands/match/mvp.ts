import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { MatchStatus } from '@utils/Constants';

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
					type: 'USER',
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const matchData = await interaction.client.database.matches.findOne(
			{
				guildId: interaction.guildId,
				status: MatchStatus.IN_GAME,
				'channels.chat': interaction.channelId,
			},
			'participants'
		);

		if (!matchData?._id) {
			interaction.editReply({
				content: t('mvp.errors.invalid_match_channel'),
			});
			return;
		}

		if (
			!matchData.participants.some((x) => x.userId === interaction.user.id) &&
			!interaction.memberPermissions.has('ADMINISTRATOR')
		) {
			interaction.editReply({
				content: t('mvp.errors.no_permission'),
			});
			return;
		}

		const target = interaction.options.getUser('usuário');
		const currentMvp = matchData.participants.find((x) => x.mvp);

		if (!target) {
			if (currentMvp) {
				interaction.editReply({
					content: t('mvp.current_mvp', {
						user: `<@!${currentMvp.userId}>`,
					}),
				});
			} else {
				interaction.editReply({
					content: t('mvp.no_mvp'),
				});
			}
			return;
		}

		if (target.bot || !matchData.participants.some((x) => x.userId === target.id)) {
			interaction.editReply({
				content: t('mvp.errors.invalid_user'),
			});
			return;
		}

		if (currentMvp?.userId === target.id) {
			interaction.editReply({
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

		interaction.editReply({
			content: t('mvp.changed', {
				user: target.toString(),
			}),
		});
	}
}
