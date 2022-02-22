import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { updateNicknames } from '@functions/match/update-nicknames';
import { updateRankRole } from '@functions/member/update-rank-role';
import { Ranks } from '@utils/Ranks';
import { UserRank } from '@utils/UserRank';

export async function add(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const amount = interaction.options.getInteger('quantidade');
	const target = interaction.options.getMember('usuario');

	if (!target) {
		await interaction.editReply({
			content: t('common.erros.not_a_member'),
		});
		return;
	}

	if (target.user.bot) {
		await interaction.editReply({
			content: t('common.errors.cannot_be_a_bot'),
		});
		return;
	}

	const targetData = await interaction.client.database.members.findOne(target, 'rank pdl mmr');

	const lastRankId = UserRank[Object.keys(UserRank).pop()];
	const lastRank = Ranks[lastRankId];

	if (targetData.rank >= lastRankId && targetData.pdl >= lastRank.maxPdl) {
		await interaction.editReply({
			content: t('pdl.add.errors.reached_maximum'),
		});
		return;
	}

	const updateEntity = {
		rank: targetData.rank,
		pdl: targetData.pdl,
		mmr: targetData.mmr,
	};

	let remaining = amount;
	while (remaining > 0 && (updateEntity.rank < lastRankId || updateEntity.pdl < Ranks[updateEntity.rank].maxPdl)) {
		const needsPdl = Ranks[updateEntity.rank].maxPdl - updateEntity.pdl;
		if (remaining >= needsPdl) {
			remaining -= needsPdl;
			updateEntity.mmr += needsPdl;
			if (Ranks[updateEntity.rank + 1]) {
				updateEntity.pdl = 0;
				updateEntity.rank++;
			} else {
				updateEntity.pdl += needsPdl;
			}
		} else {
			updateEntity.mmr += remaining;
			updateEntity.pdl += remaining;
			remaining = 0;
		}
	}

	await interaction.client.database.members.update(target, {
		$set: updateEntity,
	});

	updateNicknames(interaction.guild);
	updateRankRole({ guild: interaction.guild, members: [{ member: target, rank: updateEntity.rank }] });

	await interaction.editReply({
		content: t('pdl.add.added', {
			target: target.toString(),
			amount: amount - remaining,
		}),
	});
}
