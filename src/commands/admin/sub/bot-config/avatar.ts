import { loadImage } from 'canvas';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

export async function avatar(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const attachment = interaction.options.getAttachment('imagem');

	const isValidImage = await loadImage(attachment.proxyURL)
		.then(() => true)
		.catch(() => false);

	if (!isValidImage) {
		interaction.editReply({
			content: t('bot_config.avatar.errors.invalid_image'),
		});
		return;
	}

	try {
		await interaction.client.user.setAvatar(attachment.proxyURL);
	} catch (e) {
		const error = e as Error;
		if (error.message.includes('AVATAR_RATE_LIMIT')) {
			await interaction.editReply({
				content: t('bot_config.avatar.errors.rate_limit'),
			});
		} else {
			await interaction.editReply({
				content: t('bot_config.avatar.errors.unknown_error'),
			});
		}
		return;
	}

	await interaction.editReply({
		content: t('bot_config.avatar.changed'),
		files: [interaction.client.user.displayAvatarURL({ size: 256 })],
	});
}
