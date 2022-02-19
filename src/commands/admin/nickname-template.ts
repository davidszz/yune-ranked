import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'nickname-template',
			description: 'Defina como ficará o nick dos usuários junto com o rank',
			permissions: ['ADMINISTRATOR'],
			usage: '[modelo]',
			options: [
				{
					name: 'modelo',
					description: 'Modelo do nickname. Exemplo: #{rank} - {username}',
					type: 'STRING',
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const template = interaction.options.getString('modelo');
		if (!template) {
			const { nicknameTemplate } = await interaction.client.database.guilds.findOne(
				interaction.guildId,
				'nicknameTemplate'
			);
			await interaction.editReply({
				content: t('nickname_template.current', {
					template: nicknameTemplate,
					example: nicknameTemplate
						.replace(/{rank}/g, '1')
						.replace(/{username}/g, interaction.member.displayName ?? interaction.user.username)
						.slice(0, 32),
				}),
			});
			return;
		}

		if (!template.trim().length) {
			await interaction.editReply({
				content: t('nickname_template.errors.invalid_template'),
			});
			return;
		}

		if (template.length > 32) {
			await interaction.editReply({
				content: t('nickname_template.errors.max_length'),
			});
			return;
		}

		await interaction.client.database.guilds.update(interaction.guildId, {
			$set: {
				nicknameTemplate: template,
			},
		});

		await interaction.editReply({
			content: t('nickname_template.changed', {
				template,
				example: template
					.replace(/{rank}/g, '1')
					.replace(/{username}/g, interaction.member.displayName ?? interaction.user.username)
					.slice(0, 32),
			}),
		});
	}
}
