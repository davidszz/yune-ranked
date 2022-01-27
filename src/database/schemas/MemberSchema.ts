import { Schema } from 'mongoose';

import { Rank } from '@utils/Constants';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
	wins: number;
	loses: number;
	mmr: number;
	pdl: number;
	rank: Rank;
}

export const MemberSchema = new Schema<IMemberSchema>(
	{
		userId: {
			type: String,
			required: true,
		},
		guildId: {
			type: String,
			required: true,
		},
		wins: Number,
		loses: Number,
		mmr: Number,
		pdl: Number,
		rank: String,
	},
	{
		timestamps: {
			createdAt: true,
		},
	}
);
