import { Document, model, Mongoose } from 'mongoose';

import { Repository } from '../Repository';
import { IMemberSchema, MemberSchema } from '../schemas/MemberModel';

export class MemberRepository extends Repository<IMemberSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Member', MemberSchema));
	}

	parse(entity: Document<IMemberSchema>) {
		return {
			...(super.parse(entity) ?? ({} as IMemberSchema)),
		};
	}
}
