import { Document, model, Mongoose } from 'mongoose';

import { DEFAULT_TEAM_SIZE } from '@utils/Constants';

import { Repository } from '../Repository';
import { IGuildSchema, GuildSchema } from '../schemas/GuildSchema';

export class GuildRepository extends Repository<IGuildSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Guild', GuildSchema));
	}

	parse(entity: Document<IGuildSchema>): IGuildSchema {
		return {
			teamSize: DEFAULT_TEAM_SIZE,
			hideParticipantNames: true,
			...(super.parse(entity) ?? ({} as IGuildSchema)),
		};
	}

	async increamentMatchId(id: string) {
		return this.model
			.findByIdAndUpdate(id, { $inc: { matchId: 1 } }, { upsert: true, new: true })
			.then((res) => res?.matchId ?? 0);
	}
}
