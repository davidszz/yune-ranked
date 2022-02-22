import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { updateNicknames } from '@functions/match/update-nicknames';
import { updateRankRole } from '@functions/member/update-rank-role';
import { Ranks } from '@utils/Ranks';
import { UserRank } from '@utils/UserRank';

export async function remove(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
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

	if (targetData.rank <= UserRank.Iron1 && targetData.pdl < 1) {
		await interaction.editReply({
			content: t('pdl.remove.errors.reached_minimum'),
		});
		return;
	}

	const updateEntity = {
		rank: targetData.rank,
		pdl: targetData.pdl,
		mmr: targetData.mmr,
	};

	let remaining = amount;
	while (remaining > 0 && (updateEntity.rank > UserRank.Iron1 || updateEntity.pdl > 0)) {
		if (remaining >= updateEntity.pdl) {
			remaining -= updateEntity.pdl;
			if (updateEntity.rank > UserRank.Iron1) {
				updateEntity.rank--;
				updateEntity.mmr -= updateEntity.pdl;
				updateEntity.pdl = Ranks[updateEntity.rank].maxPdl;
			} else {
				updateEntity.mmr -= updateEntity.pdl;
				updateEntity.pdl = 0;
			}
		} else {
			updateEntity.pdl -= remaining;
			updateEntity.mmr -= remaining;
			remaining = 0;
		}
	}

	await interaction.client.database.members.update(target, {
		$set: updateEntity,
	});

	updateNicknames(interaction.guild);
	updateRankRole({ guild: interaction.guild, members: [{ member: target, rank: updateEntity.rank }] });

	await interaction.editReply({
		content: t('pdl.remove.removed', {
			target: target.toString(),
			amount: amount - remaining,
		}),
	});
}
