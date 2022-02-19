import type { Guild } from 'discord.js';

export async function updateNicknames(guild: Guild) {
	const membersData = await guild.client.database.members
		.findMany(
			{
				guildId: guild.id,
				registered: true,
				$or: [{ wins: { $gt: 0 } }, { loses: { $gt: 0 } }],
			},
			'userId pdl'
		)
		.then((result) => result.sort((a, b) => b.pdl - a.pdl));

	if (!membersData?.length) return;

	for (let i = 0; i < membersData.length; i++) {}
}
