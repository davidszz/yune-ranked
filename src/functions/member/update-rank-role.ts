import type { Guild, GuildMember } from 'discord.js';

import { Ranks, UserRank } from '@utils/Constants';

interface IUpdateRankRoleMemberData {
	rank: UserRank;
	member: GuildMember;
}

interface IUpdateRankRoleData {
	guild: Guild;
	members: IUpdateRankRoleMemberData | IUpdateRankRoleMemberData[];
}

export async function updateRankRole(data: IUpdateRankRoleData) {
	const { guild, members } = data;
	const { rankRoles } = await guild.client.database.guilds.findOne(guild.id, 'rankRoles');

	if (!rankRoles.length) {
		return;
	}

	if (Array.isArray(members)) {
		for (const member of members) {
			const memberRank = Ranks[member.rank];
			if (!memberRank) {
				continue;
			}

			const roles = rankRoles.find((x) => x.rank === memberRank.name)?.roles ?? [];
			const removeRoles = rankRoles
				.reduce<string[]>((acc, val) => [...acc, ...(val.roles ?? [])], [])
				.filter((x) => !roles?.includes(x));

			if (roles.length) {
				try {
					await member.member.roles.add(roles);
				} catch (err) {
					console.log(err);
					// Nothing
				}
			}

			if (removeRoles.length) {
				try {
					await member.member.roles.remove(removeRoles);
				} catch {
					// Nothing
				}
			}
		}
	} else {
		const memberRank = Ranks[members.rank];
		if (memberRank) {
			const roles = rankRoles.find((x) => x.rank === memberRank.name)?.roles ?? [];
			const removeRoles = rankRoles
				.reduce<string[]>((acc, val) => [...acc, ...(val.roles ?? [])], [])
				.filter((x) => !roles?.includes(x));

			if (roles.length) {
				try {
					await members.member.roles.add(roles);
				} catch {
					// Nothing
				}
			}

			if (removeRoles.length) {
				try {
					await members.member.roles.remove(removeRoles);
				} catch {
					// Nothing
				}
			}
		}
	}
}
