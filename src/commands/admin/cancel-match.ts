import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { CreateUrl } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'cancelar-partida',
			description: 'Cancele uma partida rapidamente sem os votos dos participantes',
			usage: '<partida>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'partida',
					description: 'Forneça o ID da partida',
					type: ApplicationCommandOptionType.Integer,
					minValue: 1,
					required: true,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply({
			ephemeral: true,
		});

		const matchId = interaction.options.getInteger('partida');
		const match = interaction.client.matches.cache.get(matchId);

		if (!match?.inGame) {
			await interaction.editReply({
				content: t('cancel_match.errors.not_found'),
			});
			return;
		}

		const matchUrl = CreateUrl.channel({ guildId: interaction.guildId, channelId: match.channels.chat.id });
		const confirmationEmbed = new YuneEmbed()
			.setColor('Yellow')
			.setTitle(t('cancel_match.embeds.confirmation.title'))
			.setDescription(
				t('cancel_match.embeds.confirmation.description', {
					match_id: matchId,
					match_url: matchUrl,
				})
			);

		const confirmation = new ConfirmationEmbed({
			users: [interaction.user],
			target: interaction,
			embed: confirmationEmbed,
			t,
		});

		const confirmed = await confirmation.awaitConfirmation().catch(() => false);

		if (confirmed) {
			await match.delete();
			await match.deleteChannels();

			await interaction.editReply({
				content: t('cancel_match.canceled', {
					match_id: matchId,
				}),
				embeds: [],
				components: [],
			});
		} else {
			await interaction.editReply({
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
