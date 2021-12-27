import { Document, model, Mongoose } from 'mongoose'
import { Repository } from '../Repository'
import { MemberSchema, MemberModel } from '../schemas/MemberSchema'

export class MemberRepository extends Repository<MemberModel> {
  constructor(mongoose: Mongoose) {
    super(mongoose, model('Members', MemberSchema))
  }

  parse(entity: Document<MemberModel>): MemberModel {
    return {
      pdl: 0,
      ...super.parse(entity),
    }
  }
}
