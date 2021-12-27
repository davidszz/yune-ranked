import 'dotenv/config'

import { Bot } from '@client'
import { Intents } from 'discord.js'
import { DBWrapper } from './database/DBWrapper'

const database = new DBWrapper()
database.connect().then(() => {
  const client = new Bot({
    token: process.env.DISCORD_TOKEN,
    intents: Object.values(Intents.FLAGS).reduce((a, b) => a + b),
    guildId: '880504665807147039',
    database,
  })

  client.start()
})

process.on('unhandledRejection', console.error)
