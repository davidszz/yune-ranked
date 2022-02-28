import {
	CategoryChannel,
	Collection,
	GuildMember,
	GuildMemberResolvable,
	TextBasedChannel,
	VoiceChannel,
} from 'discord.js';
import { UpdateQuery } from 'mongoose';

import type { Yune } from '@client';
import { IMatchSchema } from '@database/schemas/MatchSchema';
import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';

interface IMatchTeam {
	id: TeamId;
	captain: GuildMember;
	members: Collection<string, GuildMember>;
	win: boolean;
}

export class Match {
	private _id: string;
	public id: number;

	private _data: IMatchSchema;

	constructor(public client: Yune, data: IMatchSchema) {
		this._id = data._id;
		this._data = data;

		this.id = data.matchId;
	}

	get guild() {
		return this.client.guilds.resolve(this._data.guildId);
	}

	get status() {
		return this._data.status;
	}

	get inGame() {
		return this._data.status === MatchStatus.InGame;
	}

	get participants() {
		return new Collection<string, GuildMember>(
			this._data.participants.map((x) => [x.userId, this.guild.members.resolve(x.userId) ?? null])
		);
	}

	get mvpMember() {
		return this.participants.find((x) => this._data.participants.some((p) => p.mvp && p.userId === x.id));
	}

	get owner() {
		return this.participants.first();
	}

	get ownerId() {
		return this._data.participants[0].userId;
	}

	get captains() {
		return this.participants.filter((x) => this._data.participants.some((p) => p.isCaptain && p.userId === x.id));
	}

	get teams(): IMatchTeam[] {
		return this._data.teams.map((teamData) => {
			const participants = this._data.participants.filter((x) => x.teamId === teamData.teamId);
			const members = this.participants.filter((x) => participants.some((p) => p.userId === x.id));

			return {
				id: teamData.teamId,
				captain: members.first(),
				members,
				win: !!teamData.win,
			};
		});
	}

	get channels() {
		return {
			category: this.guild.channels.resolve(this._data.channels.category) as CategoryChannel,
			chat: this.guild.channels.resolve(this._data.channels.chat) as TextBasedChannel,
			blueVoice: this.guild.channels.resolve(this._data.channels.blueVoice) as VoiceChannel,
			redVoice: this.guild.channels.resolve(this._data.channels.redVoice) as VoiceChannel,
		};
	}

	get queueChannel() {
		return this.guild.channels.resolve(this._data.queueChannelId) as TextBasedChannel;
	}

	get channelIds() {
		return Object.values(this._data.channels);
	}

	get surrenderVotes() {
		return this.participants.filter((x) => this._data.surrenderVotes?.includes(x.id));
	}

	get createdAt() {
		return this._data.createdAt;
	}

	get createdTimestamp() {
		return this.createdAt.getTime();
	}

	async setStatus(status: MatchStatus) {
		await this.updateData({ $set: { status } });
		return status;
	}

	async addSurrenderVote(member: GuildMemberResolvable) {
		const memberId = this.guild.members.resolveId(member);
		if (!memberId || !this.participants.has(memberId)) {
			throw new Error('invalid_match_member');
		}

		if (this._data.surrenderVotes?.includes(memberId)) {
			throw new Error('already_voted');
		}

		await this.updateData({ $addToSet: { surrenderVotes: memberId } });
		return this.surrenderVotes;
	}

	async setTeamWinner(id: TeamId) {
		await this.updateData({
			$set: {
				teams: this.toJSON().teams.map((x) => ({
					...x,
					win: x.teamId === id,
				})),
			},
		});

		return this.teams.find((x) => x.id === id);
	}

	async setMvp(member: GuildMemberResolvable) {
		const memberId = this.guild.members.resolveId(member);
		await this.updateData({
			$set: {
				participants: this.toJSON().participants.map((x) => ({
					...x,
					mvp: x.userId === memberId,
				})),
			},
		});
		return this.mvpMember;
	}

	async deleteChannels() {
		for (const channel of Object.values(this.channels).filter(Boolean)) {
			if (channel?.id === this._data.channels.category) {
				continue;
			}

			try {
				await channel?.delete();
			} catch {
				// Nothing
			}
		}

		if (this.channels.category) {
			try {
				await this.channels.category.delete();
			} catch {
				// Nothing
			}
		}
	}

	async fetch(force?: boolean) {
		return this.client.matches.fetch(this.id, { force });
	}

	async delete() {
		await this.client.database.matches.deleteOne(this._id);
		this.client.matches.cache.delete(this.id);
	}

	private async updateData(data: UpdateQuery<IMatchSchema>) {
		const doc = await this.client.database.matches.findOneAndUpdate(this._id, data);
		this._data = doc;
	}

	toJSON() {
		return this._data;
	}
}
