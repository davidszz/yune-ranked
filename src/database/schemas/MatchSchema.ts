import { Schema } from 'mongoose';

import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';
import { UserRank } from '@utils/UserRank';

import { IMemberSchema } from './MemberSchema';

interface IMatchParticipant {
	member: string | Partial<IMemberSchema>;
	userId: string;
	teamId: TeamId;
	isCaptain?: boolean;
	mvp?: boolean;
	win?: boolean;
	modifiedPdls?: number;
	oldRank?: UserRank;
	newRank?: UserRank;
}

export interface IMatchTeam {
	teamId: TeamId;
	captainId: string;
	win?: boolean;
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
	messageId: string;
	status: MatchStatus;
	teams: [IMatchTeam, IMatchTeam];
	participants: IMatchParticipant[];
	surrenderVotes: string[];
	createdAt: Date;
	updatedAt: Date;
	endedAt?: Date;
}

const MatchParticipantSchema = new Schema<IMatchParticipant>(
	{
		member: {
			type: String,
			ref: 'Member',
			required: true,
		},
		userId: {
			type: String,
			required: true,
		},
		teamId: {
			type: Number,
			required: true,
		},
		isCaptain: Boolean,
		mvp: Boolean,
		modifiedPdls: Number,
		oldRank: Number,
		newRank: Number,
		win: Boolean,
	},
	{ _id: false }
);

const MatchTeamSchema = new Schema<IMatchTeam>(
	{
		teamId: {
			type: Number,
			required: true,
		},
		captainId: {
			type: String,
			required: true,
		},
		win: Boolean,
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
		messageId: String,
		status: {
			type: Number,
			required: true,
		},
		teams: [MatchTeamSchema, MatchTeamSchema],
		participants: [MatchParticipantSchema],
		surrenderVotes: [String],
		endedAt: Date,
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
