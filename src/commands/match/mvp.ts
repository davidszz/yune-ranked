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

		const match = interaction.client.matches.getByChatChannel(interaction.channelId);
		if (!match?.inGame) {
			await interaction.editReply({
				content: t('mvp.errors.invalid_match_channel'),
			});
			return;
		}

		if (!match.participants.has(interaction.user.id) && !interaction.memberPermissions.has('Administrator')) {
			await interaction.editReply({
				content: t('mvp.errors.no_permission'),
			});
			return;
		}

		const target = interaction.options.getUser('usuário');

		if (!target) {
			if (match.mvpMember) {
				await interaction.editReply({
					content: t('mvp.current_mvp', {
						user: match.mvpMember.toString(),
					}),
				});
			} else {
				await interaction.editReply({
					content: t('mvp.no_mvp'),
				});
			}
			return;
		}

		if (target.bot || !match.participants.has(target.id)) {
			await interaction.editReply({
				content: t('mvp.errors.invalid_user'),
			});
			return;
		}

		if (match.mvpMember?.id === target.id) {
			await interaction.editReply({
				content: t('mvp.errors.same_mvp'),
			});
			return;
		}

		await match.setMvp(target);

		await interaction.editReply({
			content: t('mvp.changed', {
				user: target.toString(),
			}),
		});
	}
}
