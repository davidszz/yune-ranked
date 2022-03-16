import { ChannelType, Guild, GuildMember, OverwriteResolvable, TextBasedChannel, User, VoiceChannel } from 'discord.js';

import { tFunction } from '@functions/misc/tFunction';
import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';
import { Utils } from '@utils/Utils';

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
				deny: ['ViewChannel'],
			},
			...participants.map<OverwriteResolvable>((x) => ({
				id: x.user.id,
				allow: ['ViewChannel'],
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
		for (const member of members) {
			if (member && member.voice.channelId !== channel.id) {
				try {
					await member.voice.setChannel(channel);
					await Utils.wait(1250);
				} catch {
					// Nothing
				}
			}
		}
	};

	const members = participants.map((x) => guild.members.cache.get(x.user.id));
	const oldChannels = members.map((x) => ({
		id: x.id,
		channelId: x.voice?.channelId,
	}));

	await moveMembersTo(members.slice(0, teamSize), blueVoice);
	await moveMembersTo(members.slice(teamSize, teamSize * 2), redVoice);

	return guild.client.database.matches
		.create([
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
						teamId: TeamId.Blue,
						captainId: participants[0].user.id,
					},
					{
						teamId: TeamId.Red,
						captainId: participants[teamSize].user.id,
					},
				],
				status: MatchStatus.InGame,
				participants: participants.map((x, i) => ({
					member: x.id,
					userId: x.user.id,
					isCaptain: [0, teamSize].includes(i),
					teamId: i < teamSize ? TeamId.Blue : TeamId.Red,
					lastCallId: oldChannels.find((c) => c.id === x.user.id).channelId,
				})),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		])
		.then((data) => {
			const match = guild.client.matches.add(data);
			return match;
		});
}
