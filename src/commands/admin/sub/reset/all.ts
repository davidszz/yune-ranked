import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';

export async function all(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
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
			content: t('reset.errors.invalid_member'),
		});
		return;
	}

	const updateEntity = {
		$unset: {
			loses: 0,
			wins: 0,
			pdl: 0,
			rank: 0,
		},
	};

	if (!target) {
		const query = {
			guildId: interaction.guildId,
			$or: [{ loses: { $gt: 0 } }, { wins: { $gt: 0 } }, { rank: { $gt: 0 } }, { pdl: { $gt: 0 } }],
		};

		const resetCount = await interaction.client.database.members.findMany(query, '_id', { returnCount: true });

		if (resetCount < 1) {
			await interaction.editReply({
				content: t('reset.all.errors.no_members'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('Yellow')
			.setTitle(t('reset.all.embeds.confirmation.title'))
			.setDescription(
				t('reset.all.embeds.confirmation.description', {
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
				content: t('reset.all.success_all', {
					user: interaction.user.toString(),
					total: resetCount,
				}),
			});
		}
		return;
	}

	const targetData = await interaction.client.database.members.findOne(targetMember, 'rank pdl wins loses');
	if (!targetData.rank && !targetData.pdl && !targetData.wins && !targetData.loses) {
		await interaction.editReply({
			content: t('reset.all.errors.already_reset'),
		});
		return;
	}

	await interaction.client.database.members.update(targetMember, updateEntity);

	await interaction.editReply({
		content: t('reset.all.success', {
			target: target.toString(),
		}),
	});
}
