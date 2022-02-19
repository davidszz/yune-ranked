import { Schema } from 'mongoose';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
	registered?: boolean;
	registerEndsAt?: Date;
	registeredAt?: Date;
	registeredBy?: string;
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
		registered: Boolean,
		registerEndsAt: Date,
		registeredAt: Date,
		registeredBy: String,
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
