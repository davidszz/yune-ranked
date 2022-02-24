import { loadImage } from 'canvas';
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { deleteImageByHash, uploadImage } from '@services/UploadService';
import { BaseCanvas } from '@structures/canvas/BaseCanvas';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'banner',
			description: 'Altera o banner do seu perfil',
			usage: '[imagem]',
			subscribersOnly: true,
			options: [
				{
					name: 'imagem',
					description: 'Selecione uma imagem para defini-la como banner do seu perfil',
					type: ApplicationCommandOptionType.Attachment,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const image = interaction.options.getAttachment('imagem');
		if (!image) {
			const { bannerUrl, bannerDeleteHash } = await interaction.client.database.members.findOne(
				interaction.member,
				'bannerUrl bannerDeleteHash'
			);

			const currentBannerIsValid = bannerUrl
				? await loadImage(bannerUrl)
						.then(() => true)
						.catch(() => false)
				: false;

			if (!currentBannerIsValid) {
				if (bannerUrl) {
					try {
						await deleteImageByHash(bannerDeleteHash);
					} catch {
						// Nothing
					}

					await interaction.client.database.members.update(interaction.member, {
						$unset: {
							bannerUrl: '',
							bannerDeleteHash: '',
						},
					});
				}

				await interaction.editReply({
					content: t('banner.errors.dont_have'),
				});
				return;
			}

			await interaction.editReply({
				content: t('banner.current'),
				files: [
					{
						name: 'banner.png',
						attachment: bannerUrl,
					},
				],
			});
			return;
		}

		const img = await loadImage(image.proxyURL).catch<null>(() => null);

		if (!img) {
			await interaction.editReply({
				content: t('banner.errors.invalid_image'),
			});
			return;
		}

		const canvas = new BaseCanvas(null, 1200, 300);
		canvas.drawImage({
			image: img,
			x: 0,
			y: 0,
			width: 1200,
			height: 300,
			keepProportion: true,
		});

		const buffer = canvas.toBuffer();
		const uploaded = await uploadImage({ image: buffer }).catch((err) => {
			Logger.error(err);
		});

		if (uploaded && uploaded.success) {
			const { bannerDeleteHash } = await interaction.client.database.members.findOne(
				interaction.member,
				'bannerDeleteHash'
			);
			if (bannerDeleteHash) {
				try {
					await deleteImageByHash(bannerDeleteHash);
				} catch {
					// Nothing
				}
			}

			const { link, deletehash } = uploaded.data;
			await interaction.client.database.members.update(interaction.member, {
				$set: {
					bannerUrl: link,
					bannerDeleteHash: deletehash,
				},
			});

			await interaction.editReply({
				content: t('banner.changed'),
				files: [
					{
						name: 'banner.png',
						attachment: buffer,
					},
				],
			});
		} else {
			await interaction.editReply({
				content: t('banner.errors.unknown_error'),
			});
		}
	}
}
