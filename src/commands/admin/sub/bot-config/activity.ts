import { ActivityType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

export async function activity(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const type = interaction.options.getInteger('tipo');
	const name = interaction.options.getString('nome').trim();
	const url = interaction.options.getString('url');

	if (name.length < 1 || name.length > 300) {
		await interaction.editReply({
			content: t('bot_config.activity.errors.invalid_length'),
		});
		return;
	}

	const presence = interaction.client.user.setPresence({
		activities: [
			{
				name,
				type,
				url,
			},
		],
	});

	await interaction.client.database.clients.update(interaction.client.user.id, {
		$set: {
			'presence.activities': [
				{
					name: presence.activities[0].name,
					type: presence.activities[0].type,
					url: presence.activities[0].url ?? undefined,
				},
			],
		},
	});

	await interaction.editReply({
		content: t('bot_config.activity.changed', {
			context: type === ActivityType.Streaming ? 'streaming' : null,
		}),
	});
}
