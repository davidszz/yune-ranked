import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';

export async function rank(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const target = interaction.options.getUser('usuario');

	if (target?.bot) {
		await interaction.editReply({
			content: t('common.errors.cannot_be_a_bot'),
		});
		return;
	}

	if (target && (await interaction.guild.members.fetch(target.id).catch(() => false)) === false) {
		await interaction.editReply({
			content: t('reset.errors.invalid_member'),
		});
		return;
	}

	if (!target) {
		const resetCount = await interaction.client.database.members.findMany(
			{
				guildId: interaction.guildId,
				$or: [{ rank: { $gt: 0 } }, { pdl: { $gt: 0 } }],
			},
			'_id',
			{ returnCount: true }
		);

		if (resetCount < 1) {
			await interaction.editReply({
				content: t('reset.rank.errors.no_members'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('Yellow')
			.setTitle(t('reset.rank.embeds.confirmation.title'))
			.setDescription(
				t('reset.rank.embeds.confirmation.description', {
					total: resetCount,
				})
			);

		const confirmation = new ConfirmationEmbed({
			author: interaction.user,
			target: interaction,
			embed: confirmationEmbed,
			locale: interaction.guildLocale ?? 'pt-BR',
		});

		if (await confirmation.awaitConfirmation()) {
			await interaction.client.database.members.updateMany(
				{
					guildId: interaction.guildId,
					$or: [{ rank: { $gt: 0 } }, { pdl: { $gt: 0 } }],
				},
				{
					$unset: {
						rank: 0,
						pdl: 0,
					},
				}
			);

			await interaction.followUp({
				content: t('reset.rank.success_all', {
					total: resetCount,
				}),
			});
			return;
		}

		const targetData = await interaction.client.database.members.findOne(
			{ userId: target.id, guildId: interaction.guildId },
			'rank pdl'
		);
		if (!targetData.rank && !targetData.pdl) {
			await interaction.editReply({
				content: t('reset.rank.errors.already_reset'),
			});
			return;
		}

		await interaction.client.database.members.update(
			{ userId: target.id, guildId: interaction.guildId },
			{
				$unset: {
					rank: 0,
					pdl: 0,
				},
			}
		);

		await interaction.editReply({
			content: t('reset.rank.success', {
				target: target.toString(),
			}),
		});
	}
}
