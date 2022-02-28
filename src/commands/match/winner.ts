import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'vencedor',
			description: 'Define um time como vencedor da partida',
			showInMatchHelp: true,
			subscribersOnly: true,
			usage: '[time]',
			options: [
				{
					name: 'time',
					description: 'Escolha o time vencedor da partida',
					type: ApplicationCommandOptionType.String,
					choices: [
						{
							name: 'Time Azul',
							value: 'blue',
						},
						{
							name: 'Time Vermelho',
							value: 'red',
						},
					],
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const match = interaction.client.matches.getByChatChannel(interaction.channelId);
		if (!match?.inGame) {
			await interaction.editReply({
				content: t('winner.errors.invalid_match_channel'),
			});
			return;
		}

		if (!match.participants.has(interaction.user.id) && !interaction.memberPermissions.has('Administrator')) {
			await interaction.editReply({
				content: t('winner.errors.no_permission'),
			});
			return;
		}

		const winner = interaction.options.getString('time');
		if (!winner) {
			if (match.teams.some((x) => x.win)) {
				await interaction.editReply({
					content: t('winner.current_winner', {
						current_winner: t(`winner.teams.${match.teams.find((x) => x.win).id === TeamId.Blue ? 'blue' : 'red'}`),
					}),
				});
			} else {
				await interaction.editReply({
					content: t('winner.no_winner'),
				});
			}
			return;
		}

		const winnerId = winner === 'blue' ? TeamId.Blue : TeamId.Red;
		if (match.teams.find((x) => x.win)?.id === winnerId) {
			await interaction.editReply({
				content: t('winner.errors.same_winner'),
			});
			return;
		}

		await match.setTeamWinner(winnerId);

		await interaction.editReply({
			content: t('winner.changed', {
				winner: t(`winner.teams.${winner}`),
			}),
		});
	}
}
