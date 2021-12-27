import { Schema } from 'mongoose'

export interface GuildModel {
  _id: string
  locale: string
}

export const GuildSchema = new Schema<GuildModel>({
  _id: String,
  locale: String,
})
