import { Document, model, Mongoose } from 'mongoose'
import { Repository } from '../Repository'
import { GuildSchema, GuildModel } from '../schemas/GuildSchema'

export class GuildRepository extends Repository<GuildModel> {
  constructor(mongoose: Mongoose) {
    super(mongoose, model('Guilds', GuildSchema))
  }

  parse(entity: Document<GuildModel>): GuildModel {
    return {
      locale: 'pt-BR',
      ...super.parse(entity),
    }
  }
}
