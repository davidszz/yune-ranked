import { Schema } from 'mongoose';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
	wins: number;
	loses: number;
	rank: number;
	pdl: number;
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
		rank: Number,
		mmr: Number,
	},
	{
		timestamps: {
			createdAt: true,
		},
	}
);
