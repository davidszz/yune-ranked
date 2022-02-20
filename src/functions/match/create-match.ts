import type { Guild, OverwriteResolvable, TextBasedChannel, User } from 'discord.js';

import { tFunction } from '@functions/misc/t-function';
import { MatchStatus, TeamID } from '@utils/Constants';

interface ICreateMatchData {
	guild: Guild;
	queueChannel: TextBasedChannel;
	participants: { id: string; user: User }[];
	teamSize: number;
}

export async function createMatch({ guild, queueChannel, participants, teamSize }: ICreateMatchData) {
	const t = tFunction(guild.preferredLocale ?? 'pt-BR');
	const matchId = await guild.client.database.guilds.increamentMatchId(guild.id);

	const { everyone } = guild.roles;
	const category = await guild.channels.create(t('misc:match.category_name', { match_id: matchId }), {
		type: 'GUILD_CATEGORY',
	});

	const chat = await category.createChannel(`chat-${matchId}`, {
		type: 'GUILD_TEXT',
		topic: `ID: ${matchId}`,
		permissionOverwrites: [
			{
				id: everyone.id,
				type: 'role',
				deny: ['SEND_MESSAGES'],
			},
			...participants.map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				type: 'member',
				allow: ['SEND_MESSAGES'],
			})),
		],
	});

	const blueVoice = await category.createChannel(t('misc:match.teams.blue.channel_name'), {
		type: 'GUILD_VOICE',
		userLimit: teamSize,
		permissionOverwrites: [
			{
				id: everyone.id,
				type: 'role',
				deny: ['CONNECT'],
			},
			...participants.slice(0, teamSize).map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				type: 'member',
				allow: ['CONNECT'],
			})),
		],
	});

	const redVoice = await category.createChannel(t('misc:match.teams.red.channel_name'), {
		type: 'GUILD_VOICE',
		userLimit: teamSize,
		permissionOverwrites: [
			{
				id: everyone.id,
				type: 'role',
				deny: ['CONNECT'],
			},
			...participants.slice(teamSize, teamSize * 2).map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				type: 'member',
				allow: ['CONNECT'],
			})),
		],
	});

	return guild.client.database.matches.create([
		{
			guildId: guild.id,
			matchId,
			queueChannelId: queueChannel.id,
			channels: {
				category: category.id,
				chat: chat.id,
				blueVoice: blueVoice.id,
				redVoice: redVoice.id,
			},
			teams: [
				{
					teamId: TeamID.BLUE,
					captainId: participants[0].user.id,
				},
				{
					teamId: TeamID.RED,
					captainId: participants[teamSize].user.id,
				},
			],
			status: MatchStatus.IN_GAME,
			participants: participants.map((x, i) => ({
				member: x.id,
				userId: x.user.id,
				isCaptain: [0, teamSize].includes(i),
				teamId: i < teamSize ? TeamID.BLUE : TeamID.RED,
			})),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);
}
