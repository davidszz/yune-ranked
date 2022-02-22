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

	const targetMember = target ? await interaction.guild.members.fetch(target.id).catch<null>(() => null) : null;
	if (target && !targetMember) {
		await interaction.editReply({
			content: t('common.errors.not_a_member'),
		});
		return;
	}

	const updateEntity = {
		$unset: {
			rank: 0,
			pdl: 0,
			mmr: 0,
		},
	};

	if (!target) {
		const query = {
			guildId: interaction.guildId,
			$or: [{ rank: { $gt: 0 } }, { pdl: { $gt: 0 } }, { mmr: { $gt: 0 } }],
		};
		const resetCount = await interaction.client.database.members.findMany(query, '_id', { returnCount: true });

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
			await interaction.client.database.members.updateMany(query, updateEntity);

			await interaction.channel.send({
				content: t('reset.rank.success_all', {
					user: interaction.user.toString(),
					total: resetCount,
				}),
			});
		}
		return;
	}

	const targetData = await interaction.client.database.members.findOne(targetMember, 'rank pdl');
	if (!targetData.rank && targetData.pdl < 1 && targetData.mmr < 1) {
		await interaction.editReply({
			content: t('reset.rank.errors.already_reset'),
		});
		return;
	}

	await interaction.client.database.members.update(targetMember, updateEntity);

	await interaction.editReply({
		content: t('reset.rank.success', {
			target: target.toString(),
		}),
	});
}
