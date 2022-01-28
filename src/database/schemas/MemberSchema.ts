import { Schema } from 'mongoose';

import { MemberRank } from '@utils/Constants';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
	wins: number;
	loses: number;
	pdl: number;
	rank: MemberRank;
	division: 1 | 2 | 3;
	mmr: number;
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
		pdl: Number,
		rank: String,
		division: Number,
		mmr: Number,
	},
	{
		timestamps: {
			createdAt: true,
		},
	}
);
