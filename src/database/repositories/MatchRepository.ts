import type { Guild, OverwriteResolvable, TextBasedChannel, User } from 'discord.js';
import type { TFunction } from 'i18next';
import { model, Mongoose } from 'mongoose';

import type { Yune } from '@client';
import type { IMemberSchema } from '@database/schemas/MemberSchema';
import { YuneEmbed } from '@structures/YuneEmbed';
import { DEFAULT_USER_MMR, MatchStatus, Ranks, TeamID, UserRank } from '@utils/Constants';
import { RankUtils } from '@utils/RankUtils';

import { Repository } from '../Repository';
import { IMatchSchema, MatchSchema } from '../schemas/MatchSchema';

interface ICreateMatchData {
	guild: Guild;
	queueChannel: TextBasedChannel;
	participants: { id: string; user: User }[];
	teamSize: number;
}

export class MatchRepository extends Repository<IMatchSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Match', MatchSchema));
	}

	async createMatch({ guild, queueChannel, participants, teamSize }: ICreateMatchData) {
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

	async finalizeMatch(data: { client: Yune; guild: Guild; t: TFunction; match: IMatchSchema }) {
		for (const participant of data.match.participants) {
			const memberTeam = data.match.teams.find((x) => x.teamId === participant.teamId);
			const member = participant.member as IMemberSchema;
			const wonPdl = memberTeam.win
				? RankUtils.calculateWonPdlAmount({
						mmr: member.mmr ?? DEFAULT_USER_MMR,
						rank: member.rank ?? UserRank.UNRANKED,
						mvp: !!participant.mvp,
				  })
				: RankUtils.calculateLosePdlAmount({
						mmr: member.mmr ?? DEFAULT_USER_MMR,
						rank: member.rank ?? UserRank.UNRANKED,
						mvp: !!participant.mvp,
				  });

			let rank = member.rank ?? UserRank.UNRANKED;
			let remainingPdl = (member.pdl ?? 0) + wonPdl;

			if (rank === UserRank.UNRANKED) {
				if (participant.mvp) {
					rank = memberTeam.win ? UserRank.BRONZE_3 : UserRank.IRON_3;
				} else {
					rank = memberTeam.win ? UserRank.BRONZE_1 : UserRank.IRON_1;
				}
			} else {
				while (remainingPdl > Ranks[rank].maxPdl && Ranks[rank + 1] !== null) {
					remainingPdl -= Ranks[rank].maxPdl;
					rank++;
				}
			}

			await data.client.database.members.update(
				{ _id: member._id },
				{
					$set: {
						pdl: remainingPdl,
						rank,
					},
					$inc: {
						wins: memberTeam.win ? 1 : 0,
						loses: memberTeam.win ? 0 : 1,
						mmr: wonPdl,
					},
				}
			);

			const chatChannel = data.guild.channels.cache.get(data.match.channels.chat) as TextBasedChannel;
			if (chatChannel) {
				const embed = new YuneEmbed()
					.setColor('YELLOW')
					.setTitle(data.t('match.embeds.finalized.title'))
					.setDescription(data.t('match.embeds.finalized.description'));

				chatChannel.send({
					embeds: [embed],
				});
			}
		}
	}
}
