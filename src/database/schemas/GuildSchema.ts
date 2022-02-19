import { Schema } from 'mongoose';

import { UserRank } from '@utils/Constants';

interface IRankRole {
	rank: UserRank;
	roles: string[];
}

export interface IGuildSchema {
	_id: string;
	teamSize: number;
	hideParticipantNames: boolean;
	matchId: number;
	rankRoles: IRankRole[];
}

const RankRoleSchema = new Schema<IRankRole>(
	{
		rank: Number,
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
});
