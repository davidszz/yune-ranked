import {
	Document,
	FilterQuery,
	HydratedDocument,
	Model,
	Mongoose,
	PopulateOptions,
	QueryOptions,
	UpdateQuery,
} from 'mongoose';
import transformProps from 'transform-props';

export abstract class Repository<T, R = T> {
	mongoose: Mongoose;
	model: Model<T>;

	constructor(mongoose: Mongoose, model: Model<T>) {
		this.mongoose = mongoose;
		this.model = model;
	}

	parse(entity: Document<T> | HydratedDocument<T>) {
		return entity ? (transformProps(entity.toObject({ versionKey: false }), String, '_id') as R) : null;
	}

	async update(
		query: string | FilterQuery<T>,
		entity: UpdateQuery<T>,
		options: QueryOptions = { upsert: true, new: true }
	) {
		await this.model.updateOne(typeof query === 'string' ? { _id: query } : query, entity, options);
	}

	async findOne(query: string | FilterQuery<T>, projection?: any): Promise<R> {
		if (typeof query === 'string') {
			return this.model.findById(query, projection).then((doc) => this.parse(doc));
		}

		return this.model.findOne(query, projection).then((doc) => this.parse(doc));
	}

	async findMany(query: FilterQuery<T>, projection?: any): Promise<R[]> {
		return this.model.find(query, projection).then((docs) => docs.map((doc) => this.parse(<Document<T>>doc)));
	}

	async findOneAndPopulate(
		query: string | FilterQuery<T>,
		populateOptions: PopulateOptions,
		projection?: any
	): Promise<R> {
		const cursor =
			typeof query === 'string' ? this.model.findById(query, projection) : this.model.findOne(query, projection);

		return cursor.populate(populateOptions).then((res) => this.parse(<Document<T>>res));
	}

	async deleteOne(query: string | FilterQuery<T>) {
		await this.model.deleteOne(typeof query === 'string' ? { _id: query } : query);
	}

	async create(docs: Partial<T> | Partial<T>[]) {
		return this.model.create(docs).then((doc) => this.parse(<Document<T>>doc[0]));
	}
}
