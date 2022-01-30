import { Schema } from 'mongoose';

export interface IGuildSchema {
	_id: string;
	teamSize: number;
}

export const GuildSchema = new Schema<IGuildSchema>({
	_id: String,
	teamSize: Number,
});
