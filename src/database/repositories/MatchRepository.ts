import type { Guild, OverwriteResolvable, TextBasedChannel, User } from 'discord.js';
import { model, Mongoose } from 'mongoose';

import { MatchStatus, TeamID } from '@utils/Constants';

import { Repository } from '../Repository';
import { IMatchSchema, MatchSchema } from '../schemas/MatchSchema';

interface ICreateMatchData {
	guild: Guild;
	queueChannel: TextBasedChannel;
	participants: User[];
	mmr: number;
	teamSize: number;
}

export class MatchRepository extends Repository<IMatchSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Match', MatchSchema));
	}

	async createMatch({ guild, queueChannel, mmr, participants, teamSize }: ICreateMatchData) {
		const matchId = await guild.client.database.guilds.increamentMatchId(guild.id);

		const { everyone } = guild.roles;
		const category = await guild.channels.create(`Partida ${matchId}`, {
			type: 'GUILD_CATEGORY',
			permissionOverwrites: [
				{
					id: everyone.id,
					type: 'role',
					deny: ['SEND_MESSAGES', 'CONNECT'],
				},
			],
		});

		const chat = await guild.channels.create(`chat-${matchId}`, {
			type: 'GUILD_TEXT',
			parent: category.id,
			permissionOverwrites: participants.map<OverwriteResolvable>((x) => ({
				id: x.id,
				type: 'member',
				allow: ['SEND_MESSAGES'],
			})),
		});

		const blueVoice = await guild.channels.create('Time azul', {
			type: 'GUILD_VOICE',
			parent: category.id,
			permissionOverwrites: participants.slice(0, teamSize).map<OverwriteResolvable>((x) => ({
				id: x.id,
				type: 'member',
				allow: ['CONNECT'],
			})),
		});

		const redVoice = await guild.channels.create('Time vermelho', {
			type: 'GUILD_VOICE',
			parent: category.id,
			permissionOverwrites: participants.slice(teamSize, teamSize * 2).map<OverwriteResolvable>((x) => ({
				id: x.id,
				type: 'member',
				allow: ['CONNECT'],
			})),
		});

		const matchData: Partial<IMatchSchema> = {
			queueChannelId: queueChannel.id,
			channels: {
				category: category.id,
				chat: chat.id,
				blueVoice: blueVoice.id,
				redVoice: redVoice.id,
			},
			guildId: guild.id,
			matchMmr: mmr,
			createdAt: new Date(),
			updatedAt: new Date(),
			status: MatchStatus.IN_GAME,
			matchId,
			teams: [
				{ teamId: TeamID.BLUE, captainId: participants[0].id },
				{ teamId: TeamID.RED, captainId: participants[teamSize].id },
			],
			participants: participants.map((x, i) => ({
				userId: x.id,
				isCaptain: !i || i === teamSize,
				mvp: false,
			})),
		};

		return this.create(matchData);
	}
}
