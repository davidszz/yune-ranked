import { model, Mongoose } from 'mongoose';

import { Repository } from '../Repository';
import { IClientSchema, ClientSchema } from '../schemas/ClientSchema';

export class ClientRepository extends Repository<IClientSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Client', ClientSchema));
	}
}
