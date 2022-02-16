import { Schema } from 'mongoose';

import { MatchStatus, TeamID } from '@utils/Constants';

interface IMatchParticipant {
	userId: string;
	isCaptain: boolean;
	mvp: boolean;
}

interface IMatchTeam {
	teamId: TeamID;
	captainId: string;
}

export interface IMatchSchema {
	_id: string;
	matchId: number;
	guildId: string;
	channels: {
		category: string;
		chat: string;
		blueVoice: string;
		redVoice: string;
	};
	queueChannelId: string;
	status: MatchStatus;
	matchMmr: number;
	teams: [IMatchTeam, IMatchTeam];
	participants: IMatchParticipant[];
	createdAt: Date;
	updatedAt: Date;
}

const MatchParticipantSchema = new Schema<IMatchParticipant>(
	{
		userId: {
			type: String,
			required: true,
		},
		isCaptain: Boolean,
		mvp: Boolean,
	},
	{ _id: false }
);

const MatchTeamSchema = new Schema<IMatchTeam>(
	{
		teamId: {
			type: String,
			required: true,
		},
		captainId: {
			type: String,
			required: true,
		},
	},
	{
		_id: false,
	}
);

export const MatchSchema = new Schema<IMatchSchema>(
	{
		matchId: {
			type: Number,
			required: true,
		},
		guildId: {
			type: String,
			required: true,
		},
		channels: {
			category: String,
			chat: String,
			blueVoice: String,
			redVoice: String,
		},
		queueChannelId: {
			type: String,
			required: true,
		},
		status: {
			type: Number,
			required: true,
		},
		teams: [MatchTeamSchema, MatchTeamSchema],
		participants: [MatchParticipantSchema],
		matchMmr: Number,
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
