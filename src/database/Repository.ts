import {
  Mongoose,
  Model,
  FilterQuery,
  UpdateQuery,
  Document,
  QueryOptions,
} from 'mongoose'

function transformProp(
  object: Record<string, any>,
  field: string,
  callback?: (val: any) => any
): Record<string, any> {
  for (const key in object) {
    if (key === field) {
      object[key] = callback(object[key])
    } else {
      if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
        object[key] = this.transformProp(object[key], field, callback)
      }
    }
  }
  return object
}

export class Repository<T> {
  mongoose: Mongoose
  model: Model<T>

  constructor(mongoose: Mongoose, model: Model<T>) {
    this.mongoose = mongoose
    this.model = model
  }

  parse(entity: Document<T>): T {
    return (
      entity
        ? (transformProp(entity.toObject({ versionKey: false }), '_id', String) as T)
        : {}
    ) as T
  }

  async findOne(query: string | FilterQuery<T>, projection?: any): Promise<T> {
    return typeof query === 'string'
      ? this.model.findById(query, projection).then(this.parse)
      : this.model.findOne(query, projection).then(this.parse)
  }

  async findMany(query: FilterQuery<T>, projection?: any): Promise<T[]> {
    return this.model.find(query, projection).then(res => res.map(x => this.parse(x)))
  }

  async update(
    query: string | FilterQuery<T>,
    entity: UpdateQuery<T>,
    options: QueryOptions = { upsert: true, new: true }
  ): Promise<void> {
    await this.model.updateOne(
      typeof query === 'string' ? { _id: query } : query,
      entity,
      options
    )
  }
}
