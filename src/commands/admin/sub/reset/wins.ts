import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';

export async function wins(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
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
			wins: 0,
		},
	};

	if (!target) {
		const query = {
			guildId: interaction.guildId,
			wins: {
				$gt: 0,
			},
		};
		const resetCount = await interaction.client.database.members.findMany(query, '_id', { returnCount: true });

		if (resetCount < 1) {
			await interaction.editReply({
				content: t('reset.wins.errors.no_members'),
			});
			return;
		}

		const confirmationEmbed = new YuneEmbed()
			.setColor('Yellow')
			.setTitle(t('reset.wins.embeds.confirmation.title'))
			.setDescription(
				t('reset.wins.embeds.confirmation.description', {
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
				content: t('reset.wins.success_all', {
					user: interaction.user.toString(),
					total: resetCount,
				}),
			});
		}
		return;
	}

	const targetData = await interaction.client.database.members.findOne(targetMember, 'wins');
	if (!targetData.wins) {
		await interaction.editReply({
			content: t('reset.wins.errors.already_reset'),
		});
		return;
	}

	await interaction.client.database.members.update(targetMember, updateEntity);

	await interaction.editReply({
		content: t('reset.wins.success', {
			target: target.toString(),
		}),
	});
}
