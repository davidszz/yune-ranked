import mongoose, { Mongoose } from 'mongoose'
import { MemberRepository } from './repositories/MemberRepository'
import { GuildRepository } from './repositories/GuildRepository'

export class DBWrapper {
  mongoose: Mongoose
  members: MemberRepository
  guilds: GuildRepository

  constructor() {
    this.mongoose = mongoose
  }

  async connect() {
    await mongoose.connect(process.env.MONGODB_URI).then(mongo => {
      this.members = new MemberRepository(mongo)
      this.guilds = new GuildRepository(mongo)
    })
  }
}
