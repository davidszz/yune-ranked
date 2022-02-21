import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'ocultar-participantes',
			description: 'Use para ocultar e desocultar o nome dos participantes',
			permissions: ['Administrator'],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const { hideParticipantNames } = await interaction.client.database.guilds.findOne(
			interaction.guildId,
			'hideParticipantNames'
		);
		await interaction.client.database.guilds.update(interaction.guildId, {
			$set: {
				hideParticipantNames: !hideParticipantNames,
			},
		});

		await interaction.editReply({
			content: t('hide_participants.turn', {
				context: hideParticipantNames ? 'off' : 'on',
			}),
		});
	}
}
