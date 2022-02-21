import type { Guild } from 'discord.js';

export async function updateNicknames(guild: Guild) {
	const membersData = await guild.client.database.members
		.findMany(
			{
				guildId: guild.id,
				subscribed: true,
				$or: [{ wins: { $gt: 0 } }, { loses: { $gt: 0 } }],
			},
			'userId pdl wins rank'
		)
		.then((result) =>
			result
				.sort((a, b) => b.wins - a.wins)
				.sort((a, b) => b.pdl - a.pdl)
				.sort((a, b) => b.rank - a.rank)
		);

	if (!membersData?.length) return;

	for (let i = 0; i < membersData.length; i++) {
		const memberData = membersData[i];
		const rank = i + 1;

		if (guild.client.nicknameQueue.some((x) => x.userId === memberData.userId)) {
			const idx = guild.client.nicknameQueue.findIndex((x) => x.userId === memberData.userId);
			guild.client.nicknameQueue[idx].rank = rank;
		} else {
			guild.client.nicknameQueue.push({
				userId: memberData.userId,
				rank,
			});
		}
	}
}
