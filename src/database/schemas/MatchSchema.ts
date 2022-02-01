import { Schema } from 'mongoose';

import { MatchStatus } from '@utils/Constants';

interface IMatchTeam {
	members: string[];
	captainId: string;
}

export interface IMatchSchema {
	_id: string;
	matchId: number;
	guildId: string;
	channelId: string;
	status: MatchStatus;
	teams: [IMatchTeam, IMatchTeam];
	createdAt: Date;
	updatedAt: Date;
}

const MatchTeamSchema = new Schema<IMatchTeam>(
	{
		members: {
			type: [String],
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
		channelId: {
			type: String,
			required: true,
		},
		status: {
			type: Number,
			required: true,
		},
		teams: [MatchTeamSchema, MatchTeamSchema],
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
