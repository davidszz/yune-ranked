import type { Guild, OverwriteResolvable, TextBasedChannel, User } from 'discord.js';

import { MatchStatus, TeamID } from '@utils/Constants';

interface ICreateMatchData {
	guild: Guild;
	queueChannel: TextBasedChannel;
	participants: { id: string; user: User }[];
	teamSize: number;
}

export async function createMatch({ guild, queueChannel, participants, teamSize }: ICreateMatchData) {
	const matchId = await guild.client.database.guilds.increamentMatchId(guild.id);

	const { everyone } = guild.roles;

	const category = await guild.channels.create(`Partida ${matchId}`, {
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

	const blueVoice = await category.createChannel('🔵 Time Azul', {
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

	const redVoice = await category.createChannel('🔴 Time Vermelho', {
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

	return this.create({
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
	});
}
