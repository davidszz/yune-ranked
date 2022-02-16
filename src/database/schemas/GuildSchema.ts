import { Schema } from 'mongoose';

export interface IGuildSchema {
	_id: string;
	teamSize: number;
	hideParticipantNames: boolean;
	matchId: number;
}

export const GuildSchema = new Schema<IGuildSchema>({
	_id: String,
	teamSize: Number,
	hideParticipantNames: Boolean,
	matchId: Number,
});
