import { Schema } from 'mongoose';

export interface IMemberSchema {
	_id: string;
	userId: string;
	guildId: string;
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
	},
	{
		timestamps: {
			createdAt: true,
		},
	}
);
