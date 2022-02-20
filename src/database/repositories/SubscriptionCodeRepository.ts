import { model, Mongoose } from 'mongoose';

import { Repository } from '../Repository';
import { ISubscriptionCodeSchema, SubscriptionCodeSchema } from '../schemas/SubscriptionCodeSchema';

export class SubscriptionCodeRepository extends Repository<ISubscriptionCodeSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Subscription_Code', SubscriptionCodeSchema));
	}
}
