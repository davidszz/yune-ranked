import { ActivitiesOptions, PresenceData } from 'discord.js';
import { Schema } from 'mongoose';

export interface IClientSchema {
	_id: string;
	token: string;
	guildId: string;
	ownerId: string;
	presence: PresenceData;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const ActivitySchema = new Schema<ActivitiesOptions>(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: Number,
			required: true,
		},
		url: String,
	},
	{ _id: false }
);

const PresenceSchema = new Schema<PresenceData>(
	{
		activities: [ActivitySchema],
		afk: Boolean,
		status: String,
	},
	{ _id: false }
);

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
		presence: PresenceSchema,
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
