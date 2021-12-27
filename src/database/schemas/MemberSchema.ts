import { Schema } from 'mongoose'

export interface MemberModel {
  _id: string
  userId: string
  guildId: string
  pdl: number
}

export const MemberSchema = new Schema<MemberModel>({
  userId: String,
  guildId: String,
  pdl: {
    type: Number,
    default: 0,
  },
})
