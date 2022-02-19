import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { Ranks, RANK_ROLES_LIMIT } from '@utils/Constants';

export async function add(interaction: CommandInteraction, t: TFunction): Promise<void> {
	const rank = interaction.options.getString('rank');
	const role = interaction.options.getRole('cargo');

	if (role.managed || !role.position) {
		interaction.editReply({
			content: t('rank_roles.add.errors.managed_role'),
		});
		return;
	}

	const { rankRoles } = await interaction.client.database.guilds.findOne(interaction.guildId, 'rankRoles');

	const currentData = {
		rank,
		roles: [],
		...(rankRoles?.find((x) => x.rank === rank) ?? {}),
	};

	if (currentData.roles.includes(role.id)) {
		interaction.editReply({
			content: t('rank_roles.add.errors.already_has'),
		});
		return;
	}

	currentData.roles = currentData.roles.filter((x) => interaction.guild.roles.cache.has(x));
	if (currentData.roles.length >= RANK_ROLES_LIMIT) {
		interaction.editReply({
			content: t('rank_roles.add.errors.reached_limit', {
				limit: RANK_ROLES_LIMIT,
			}),
		});
		return;
	}

	currentData.roles.push(role.id);
	if (rankRoles.some((x) => x.rank === rank)) {
		rankRoles[rankRoles.findIndex((x) => x.rank === rank)] = currentData;
	} else {
		rankRoles.push(currentData);
	}

	await interaction.client.database.guilds.update(interaction.guildId, {
		$set: {
			rankRoles,
		},
	});

	const rankData = Ranks.find((x) => x.name === rank);
	await interaction.editReply({
		content: t('rank_roles.add.added', {
			role: role.toString(),
			rank_name: t(`misc:ranks.names.${rankData.name}`),
		}),
	});
}
