import { Schema } from 'mongoose';

export interface IClientSchema {
	_id: string;
	token: string;
	guildId: string;
	ownerId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export const ClientSchema = new Schema<IClientSchema>(
	{
		_id: String,
		token: {
			type: String,
			required: true,
		},
		guildId: {
			type: String,
			required: true,
		},
		ownerId: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
	}
);
