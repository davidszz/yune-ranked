import { Document, FilterQuery, Model, Mongoose, QueryOptions, UpdateQuery } from 'mongoose';
import transformProps from 'transform-props';

export abstract class Repository<T, R = T> {
	mongoose: Mongoose;
	model: Model<T>;

	constructor(mongoose: Mongoose, model: Model<T>) {
		this.mongoose = mongoose;
		this.model = model;
	}

	parse(entity: Document<T>) {
		return entity ? (transformProps(entity.toObject({ versionKey: false }), String, '_id') as R) : null;
	}

	async update(
		query: string | FilterQuery<T>,
		entity: UpdateQuery<T>,
		options: QueryOptions = { upsert: true, new: true }
	) {
		await this.model.updateOne(typeof query === 'string' ? { _id: query } : query, entity, options);
	}

	async findOne(query: string | FilterQuery<T>, projection?: any) {
		if (typeof query === 'string') {
			return this.model.findById(query, projection).then((doc) => this.parse(<Document<T>>doc));
		}

		return this.model.findOne(query, projection).then((doc) => this.parse(<Document<T>>doc));
	}

	async create(...docs: Partial<T>[]) {
		return this.model.create(docs).then((doc) => this.parse(<Document<T>>doc[0]));
	}
}