import { Schema } from 'mongoose'

interface TeamModel {
  captainId: string
  channelId: string
  members: string[]
}

export interface MatchModel {
  _id: string
  guildId: string
  channelId: string
  teams: [TeamModel, TeamModel]
  startedAt: Date
  endedAt?: Date
  winner?: number
}

const TeamSchema = new Schema<TeamModel>(
  {
    captainId: String,
    channelId: String,
    members: [String],
  },
  { _id: false }
)

export const MatchSchema = new Schema<MatchModel>({
  guildId: String,
  channelId: String,
  teams: [TeamSchema, TeamSchema],
  startedAt: {
    default: () => new Date(),
    type: Date,
  },
  endedAt: Date,
  winner: Number,
})
