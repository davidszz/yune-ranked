import { Schema } from 'mongoose';

interface IRankRole {
	rank: string;
	roles: string[];
}

export interface IGuildSchema {
	_id: string;
	teamSize: number;
	hideParticipantNames: boolean;
	matchId: number;
	rankRoles: IRankRole[];
	subscriptionRoles: string[];
	nicknameTemplate: string;
}

const RankRoleSchema = new Schema<IRankRole>(
	{
		rank: String,
		roles: [String],
	},
	{ _id: false }
);

export const GuildSchema = new Schema<IGuildSchema>({
	_id: String,
	teamSize: Number,
	hideParticipantNames: Boolean,
	matchId: Number,
	rankRoles: [RankRoleSchema],
	subscriptionRoles: [String],
	nicknameTemplate: String,
});
