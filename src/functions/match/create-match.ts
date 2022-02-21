import { ChannelType, Guild, GuildMember, OverwriteResolvable, TextBasedChannel, User, VoiceChannel } from 'discord.js';

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
		type: ChannelType.GuildCategory,
	});

	const chat = await category.children.create(`chat-${matchId}`, {
		type: ChannelType.GuildText,
		topic: `ID: ${matchId}`,
		permissionOverwrites: [
			{
				id: everyone.id,
				deny: ['SendMessages'],
			},
			...participants.map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				allow: ['SendMessages'],
			})),
		],
	});

	const blueVoice = await category.children.create(t('misc:match.teams.blue.channel_name'), {
		type: ChannelType.GuildVoice,
		userLimit: teamSize,
		permissionOverwrites: [
			{
				id: everyone.id,
				deny: ['Connect'],
			},
			...participants.slice(0, teamSize).map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				allow: ['Connect'],
			})),
		],
	});

	const redVoice = await category.children.create(t('misc:match.teams.red.channel_name'), {
		type: ChannelType.GuildVoice,
		userLimit: teamSize,
		permissionOverwrites: [
			{
				id: everyone.id,
				deny: ['Connect'],
			},
			...participants.slice(teamSize, teamSize * 2).map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				allow: ['Connect'],
			})),
		],
	});

	const moveMembersTo = async (members: GuildMember[], channel: VoiceChannel) => {
		for (const member of members.filter((m) => !!m && !!m.voice.channel)) {
			if (member.voice.channelId !== channel.id) {
				try {
					await member.voice.setChannel(channel);
				} catch {
					// Nothing
				}
			}
		}
	};
	const members = participants.map((x) => guild.members.cache.get(x.user.id));
	await moveMembersTo(members.slice(0, teamSize), blueVoice);
	await moveMembersTo(members.slice(teamSize, teamSize * 2), redVoice);

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
