import { Schema } from 'mongoose'

export interface ClientModel {
  _id: string
  token: string
  guildId: string
  ownerId: string
  expiresAt: Date
  createdAt: Date
}

export const ClientSchema = new Schema<ClientModel>({
  _id: String,
  token: String,
  guildId: String,
  ownerId: String,
  expiresAt: Date,
  createdAt: {
    default: () => new Date(),
    type: Date,
  },
})
