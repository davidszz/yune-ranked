import { Schema } from 'mongoose';

export interface ISubscriptionCodeSchema {
	_id: string;
	guildId: string;
	code: string;
	duration: number;
	createdAt: Date;
	createdBy: string;
}

export const SubscriptionCodeSchema = new Schema<ISubscriptionCodeSchema>({
	guildId: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
	createdAt: {
		type: Date,
		default: () => new Date(),
	},
	createdBy: String,
});
