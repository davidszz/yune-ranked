import { model, Mongoose } from 'mongoose';

import { Repository } from '../Repository';
import { IMatchSchema, MatchSchema } from '../schemas/MatchSchema';

export class MatchRepository extends Repository<IMatchSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Match', MatchSchema));
	}
}
