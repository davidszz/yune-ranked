import { Schema } from 'mongoose';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
	subscribed?: boolean;
	subscriptionEndsAt?: Date;
	subscribedAt?: Date;
	subscriptionCreatedBy?: string;
	wins: number;
	loses: number;
	mvps: number;
	rank: number;
	pdl: number;
	mmr: number;
	username?: string;
	discriminator?: string;
	avatar?: string;
	bannerUrl?: string;
	bannerDeleteHash?: string;
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
		subscribed: Boolean,
		subscriptionEndsAt: Date,
		subscribedAt: Date,
		subscriptionCreatedBy: String,
		wins: Number,
		loses: Number,
		mvps: Number,
		pdl: Number,
		rank: Number,
		mmr: Number,
		username: String,
		discriminator: String,
		avatar: String,
		bannerUrl: String,
		bannerDeleteHash: String,
	},
	{
		timestamps: {
			createdAt: true,
		},
	}
);
