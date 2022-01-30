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
			...(super.parse(entity) ?? ({} as IGuildSchema)),
		};
	}
}
