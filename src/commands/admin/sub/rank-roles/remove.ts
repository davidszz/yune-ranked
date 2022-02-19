import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { Ranks } from '@utils/Constants';

export async function remove(interaction: CommandInteraction, t: TFunction): Promise<void> {
	const rank = interaction.options.getString('rank');
	const roleId = interaction.options.getString('cargo').replace(/[<@&>]/g, '');

	const { rankRoles } = await interaction.client.database.guilds.findOne(interaction.guildId, 'rankRoles');

	const currentData = rankRoles.find((x) => x.rank === rank);
	if (!currentData?.roles?.length) {
		interaction.editReply({
			content: t('rank_roles.remove.errors.no_roles'),
		});
		return;
	}

	if (!currentData.roles.includes(roleId)) {
		interaction.editReply({
			content: t('rank_roles.remove.errors.invalid_role'),
		});
		return;
	}

	const idx = rankRoles.indexOf(currentData);
	if (currentData.roles.length <= 1) {
		rankRoles.splice(idx, 1);
	} else {
		currentData.roles.splice(currentData.roles.indexOf(roleId), 1);
		rankRoles[idx] = currentData;
	}

	await interaction.client.database.guilds.update(interaction.guildId, {
		$set: {
			rankRoles,
		},
	});

	const role = interaction.guild.roles.cache.get(roleId);
	const rankData = Ranks.find((x) => x.name === rank);
	interaction.editReply({
		content: t('rank_roles.remove.removed', {
			context: role ? 'valid_role' : null,
			role: role?.toString() ?? roleId,
			rank_name: t(`misc:ranks.names.${rankData.name}`),
		}),
	});
}
