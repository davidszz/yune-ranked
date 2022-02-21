import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

export async function username(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const username = interaction.options.getString('nome').trim();

	if (username.length < 2 || username.length > 32) {
		interaction.editReply({
			content: t('bot_config.username.errors.invalid_length'),
		});
		return;
	}

	try {
		await interaction.client.user.setUsername(username);
	} catch (e) {
		const error = e as Error;

		if (error.message.includes('USERNAME_TOO_MANY_USERS')) {
			await interaction.editReply({
				content: t('bot_config.username.errors.too_many_users'),
			});
		} else if (error.message.includes('USERNAME_RATE_LIMIT')) {
			await interaction.editReply({
				content: t('bot_config.username.errors.rate_limit'),
			});
		} else {
			await interaction.editReply({
				content: t('bot_config.username.errors.unknown_error'),
			});
		}
		return;
	}

	await interaction.editReply({
		content: t('bot_config.username.changed', {
			username,
		}),
	});
}
