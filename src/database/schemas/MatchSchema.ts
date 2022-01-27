import { Schema } from 'mongoose';

interface IMatchTeam {
	members: string[];
	captainId: string;
}

export interface IMatchSchema {
	_id: string;
	matchId: number;
	guildId: string;
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
		teams: [MatchTeamSchema, MatchTeamSchema],
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
