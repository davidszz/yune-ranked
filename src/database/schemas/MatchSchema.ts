import { Schema } from 'mongoose';

export interface IMatchTeam {
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
		teams: [
			{
				_id: false,
				members: [{ type: String, ref: 'Member' }],
				captainId: String,
			},
		],
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
